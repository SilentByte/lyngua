/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

import axios from "axios";

import {
    VuexModule,
    Action,
    Module,
    Mutation,
    config as VuexModuleDecoratorsConfig,
} from "vuex-module-decorators";

import store from "@/store";
import LocalStorage from "@/store/local-storage";
import * as microphone from "@/microphone";

export type PronunciationError = "none" | "omission" | "insertion" | "mispronunciation";

export type SupportedLanguage = "en" | "de" | "fr" | "it" | "pt";

export interface IPronunciationScore {
    accuracy: number;
    error: PronunciationError;
}

export interface IWord {
    index: number;
    text: string;
    display: string;
    offset: number;
    duration: number;
    score: IPronunciationScore | null;
}

export interface ITranscription {
    audioUrl: string;
    words: IWord[];
}

export interface IVideoInfo {
    videoId: string;
    canonicalUrl: string;
    thumbnailUrl: string;
    title: string;
    author: string;
}

export interface IDictionaryEntry {
    source: string;
    target: string;
    pos: "ADJ" | "ADV" | "CONJ" | "DET" | "MODAL" | "NOUN" | "PREP" | "PRON" | "VERB" | "OTHER";
    alternatives: string[];
}

export interface ITranslation {
    text: string;
    words: IDictionaryEntry[];
}

export function hint<T>(value: T): T {
    return value;
}

export function postpone<T>(handler: () => T): void {
    setTimeout(handler, 0);
}

export function extractYouTubeVideoIdFromUrl(url: string): string | null {
    // See <https://gist.github.com/afeld/1254889>, forcing 10-12 characters.
    const matches = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^?&"'>]{10,12})/.exec(url);
    return matches === null ? null : matches[5];
}

function blobToDataUrl(data: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result as string || "");
        reader.onerror = () => reject();

        reader.readAsDataURL(data);
    });
}

async function blobToBase64(data: Blob): Promise<string> {
    return (await blobToDataUrl(data)).split(",")[1];
}

VuexModuleDecoratorsConfig.rawError = true;

const FONT_SIZE_STEP = 0.05;
const FONT_SIZE_MAX = 1.5;
const FONT_SIZE_MIN = 0.5;

@Module({
    store,
    dynamic: true,
    namespaced: true,
    name: "app",
})
export class AppModule extends VuexModule {
    appBlockingActionCounter = 0;

    sourceLanguage: SupportedLanguage = LocalStorage.sourceLanguage;
    targetLanguage: SupportedLanguage = LocalStorage.targetLanguage;
    fontSize = LocalStorage.fontSize || 1.0;

    videoId: string | null = null;
    transcription: ITranscription | null = null;

    recording = false;
    recordingAmplitude = 0;
    recordingPeak = 0;
    hasRecordingPermission = LocalStorage.hasRecordingPermission || false;

    private recorder: microphone.Recorder | null = null;

    get isAppBlocked(): boolean {
        return this.appBlockingActionCounter > 0;
    }

    get canDecreaseFontSize(): boolean {
        return this.fontSize > FONT_SIZE_MIN;
    }

    get canIncreaseFontSize(): boolean {
        return this.fontSize < FONT_SIZE_MAX;
    }

    @Mutation
    pushAppBlockingAction(): void {
        this.appBlockingActionCounter += 1;
    }

    @Mutation
    popAppBlockingAction(): void {
        this.appBlockingActionCounter -= 1;
    }

    @Mutation
    setSourceLanguage(code: SupportedLanguage): void {
        this.sourceLanguage = code;
        LocalStorage.sourceLanguage = code;
    }

    @Mutation
    setTargetLanguage(code: SupportedLanguage): void {
        this.targetLanguage = code;
        LocalStorage.targetLanguage = code;
    }

    @Mutation
    increaseFontSize(): void {
        this.fontSize = Math.min(this.fontSize + FONT_SIZE_STEP, FONT_SIZE_MAX);
        LocalStorage.fontSize = this.fontSize;
    }

    @Mutation
    decreaseFontSize(): void {
        this.fontSize = Math.max(this.fontSize - FONT_SIZE_STEP, FONT_SIZE_MIN);
        LocalStorage.fontSize = this.fontSize;
    }

    @Mutation
    setVideoId(videoId: string): void {
        this.videoId = videoId;
    }

    @Mutation
    setTranscription(transcription: ITranscription): void {
        this.transcription = transcription;
    }

    @Mutation
    setWordPronunciationScoreByIndex(payload: { index: number; score: IPronunciationScore }): void {
        if(!this.transcription) {
            return;
        }

        this.transcription.words[payload.index].score = payload.score;
    }

    @Mutation
    setRecorder(recorder: microphone.Recorder | null): void {
        this.recorder?.removeAllEventListeners();
        this.recorder = recorder;

        this.hasRecordingPermission = !!recorder;
        LocalStorage.hasRecordingPermission = !!recorder;

        recorder?.addAmplitudeListener((amplitude, peak) => {
            this.recordingAmplitude = amplitude;
            this.recordingPeak = peak;
        });
    }

    @Mutation
    setRecording(recording: boolean): void {
        this.recording = recording;
    }

    @Action
    doQueueAppBlockingAction(payload: { action: Promise<any> }): Promise<any> {
        this.context.commit("pushAppBlockingAction");
        return payload.action.finally(() => this.context.commit("popAppBlockingAction"));
    }

    @Action
    async doPing(): Promise<void> {
        await axios.get(`${process.env.VUE_APP_API_URL}/ping`);
    }

    @Action
    async doFetchVideoInfo(payload: { videoId: string }): Promise<IVideoInfo | null> {
        const canonicalUrl = encodeURIComponent(`https://www.youtube.com/watch?v=${payload.videoId}`);
        try {
            const response = await axios.get(`https://www.youtube.com/oembed?url=${canonicalUrl}&format=json`);
            return {
                videoId: payload.videoId,
                canonicalUrl,
                thumbnailUrl: response.data?.thumbnail_url || "",
                title: response.data?.title || "",
                author: response.data?.author_name || "",
            };
        } catch(e) {
            return null;
        }
    }

    @Action
    async doTranscribe(payload: { videoId: string; sourceLanguage: SupportedLanguage }): Promise<void> {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/getvideo`, {
            params: {
                v: payload.videoId,
                l: payload.sourceLanguage,
            },
        });

        console.log(response);

        this.context.commit("setVideoId", payload.videoId);
        this.context.commit("setTranscription", hint<ITranscription>({
            audioUrl: "",
            words: response.data.map((w: any, i: number) => hint<IWord>({
                index: i,
                text: w.Word,
                display: w.Word, // TODO: Figure out if possible.
                offset: w.Offset / 10_000_000,
                duration: w.Duration / 10_000_000,
                score: null,
            })),
        }));
    }

    @Action
    async doTranslate(payload: {
        words: string[];
        sourceLanguage: SupportedLanguage;
        targetLanguage: SupportedLanguage;
    }): Promise<ITranslation> {
        const response = await axios.post(`${process.env.VUE_APP_API_URL}/translatev2`, {
            text_to_translate: payload.words,
            from_language: payload.sourceLanguage,
            to_language: payload.targetLanguage,
        });

        return {
            text: response.data.text,
            words: response.data.words.map((w: any) => ({
                source: w.source_word,
                target: w.translated_word,
                pos: w.word_type,
                alternatives: w.backTranslations.filter((bt: string) => bt !== w.source_word),
            })),
        };
    }

    @Action
    async doScorePronunciation(payload: { words: IWord[]; audio: Blob }): Promise<void> {
        const response = await axios.post(`${process.env.VUE_APP_API_URL}/pronounce`, {
            words: payload.words.map(w => w.display).join(" "),
            data: await blobToBase64(payload.audio),
        });

        const scoredWords = response.data?.NBest[0]?.Words as any[];
        if(scoredWords) {
            for(const word of payload.words) {
                const scoredWord = scoredWords.find(w => w.Word === word.text);
                this.context.commit("setWordPronunciationScoreByIndex", {
                    index: word.index,
                    score: scoredWord ? hint<IPronunciationScore>({
                        accuracy: scoredWord.AccuracyScore / 100,
                        error: scoredWord.ErrorType.toLowerCase(),
                    }) : null,
                });
            }
        }
    }

    @Action
    async doStartRecording(): Promise<void> {
        this.recorder?.stop();
        this.context.commit("setRecording", false);

        try {
            const recorder = await microphone.microphone();
            this.context.commit("setRecorder", recorder);
            this.context.commit("setRecording", true);
            this.recorder!.start();
        } catch(e) {
            if(e.name === "PermissionDeniedError") {
                this.context.commit("setRecorder", null);
            }
            throw e;
        }
    }

    @Action
    async doStopRecording(): Promise<Blob | null> {
        this.context.commit("setRecording", false);
        return await this.recorder?.stop() || null;
    }
}
