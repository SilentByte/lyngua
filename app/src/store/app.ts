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
    fontSize = LocalStorage.fontSize || 1.0;

    videoId: string | null = null;
    transcription: ITranscription | null = null;

    recording = false;
    recordingAmplitude = 0;
    recordingPeak = 0;
    hasRecordingPermission = LocalStorage.hasRecordingPermission || false;

    private recorder: microphone.Recorder | null = null;

    get canDecreaseFontSize(): boolean {
        return this.fontSize > FONT_SIZE_MIN;
    }

    get canIncreaseFontSize(): boolean {
        return this.fontSize < FONT_SIZE_MAX;
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
    async doFetchVideoInfo(payload: { youTubeVideoId: string }): Promise<IVideoInfo | null> {
        const canonicalUrl = encodeURIComponent(`https://www.youtube.com/watch?v=${payload.youTubeVideoId}`);
        try {
            const response = await axios.get(`https://www.youtube.com/oembed?url=${canonicalUrl}&format=json`);
            return {
                videoId: payload.youTubeVideoId,
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
    async doTranscribe(payload: { youTubeVideoId: string }): Promise<void> {
        // TODO: Implement, first check if transcription.json and audio.mp3 are available in the bucket.
        //       If yes, fetch the cached transcription, otherwise start a conversion job.
        const response = JSON.parse(`{"RecognitionStatus":"Success","Offset":300000,"Duration":609700000,"NBest":[{"Confidence":0.8281137943267822,"Lexical":"this guy stole my package from porch and he's about to open it in his house but he doesn't know is that this is the third generation of a new and improved custom built bay package that's recording him on four different phones and just released a pound of the world 's finest glitter along with some other nasty surprises but to understand how we got here we first have to go back in time a bit 'cause that's when this couple stole a package from my porch and even with the video footage the police wouldn't do anything so i vowed to use my engineering skills to go full home alone on these punks not just to avenge my package but as a tribute to the two million packages that are stolen across america every year and because packages are taking most in december for the third year now it's sort of become a christmas time tradition for me to do my very small part to encourage future would be porch pirates to choose a different profession in just the most fabulous way possible so before we see how this years version fares in the wild i'm going to first walk you through all the upgrades my buddy sean and i have been incorporating into this box off","ITN":"this guy stole my package from porch and he's about to open it in his house but he doesn't know is that this is the third generation of a new and improved custom built bay package that's recording him on four different phones and just released a pound of the world's finest glitter along with some other nasty surprises but to understand how we got here we first have to go back in time a bit 'cause that's when this couple stole a package from my porch and even with the video footage the police wouldn't do anything so i vowed to use my engineering skills to go full home alone on these punks not just to avenge my package but as a tribute to the 2,000,000 packages that are stolen across america every year and because packages are taking most in december for the third year now it's sort of become a christmas time tradition for me to do my very small part to encourage future would be porch pirates to choose a different profession in just the most fabulous way possible so before we see how this years version fares in the wild i'm going to first walk you through all the upgrades my buddy sean and i have been incorporating into this box off","MaskedITN":"This guy stole my package from porch and he's about to open it in his house, but he doesn't know is that this is the third generation of a new and improved custom built Bay package that's recording him on four different phones and just released a pound of the world's finest glitter along with some other nasty surprises. But to understand how we got here, we first have to go back in time a bit, 'cause that's when this couple stole a package from my porch and even with the video footage, the police wouldn't do anything. So I vowed to use my engineering skills to go full home alone on these punks not just to avenge my package, but as a tribute to the 2,000,000 packages that are stolen across America every year. And because packages are taking most in December for the third year now, it's sort of become a Christmas time tradition for me to do my very small part to encourage future would be porch Pirates to choose a different profession in just the most fabulous way possible. So before we see how this years version fares in the wild, I'm going to first walk you through all the upgrades my buddy Sean and I have been incorporating into this box off.","Display":"This guy stole my package from porch and he's about to open it in his house, but he doesn't know is that this is the third generation of a new and improved custom built Bay package that's recording him on four different phones and just released a pound of the world's finest glitter along with some other nasty surprises. But to understand how we got here, we first have to go back in time a bit, 'cause that's when this couple stole a package from my porch and even with the video footage, the police wouldn't do anything. So I vowed to use my engineering skills to go full home alone on these punks not just to avenge my package, but as a tribute to the 2,000,000 packages that are stolen across America every year. And because packages are taking most in December for the third year now, it's sort of become a Christmas time tradition for me to do my very small part to encourage future would be porch Pirates to choose a different profession in just the most fabulous way possible. So before we see how this years version fares in the wild, I'm going to first walk you through all the upgrades my buddy Sean and I have been incorporating into this box off.","Words":[{"Word":"this","Offset":500000,"Duration":1900000},{"Word":"guy","Offset":2500000,"Duration":1300000},{"Word":"stole","Offset":3900000,"Duration":2300000},{"Word":"my","Offset":6300000,"Duration":1100000},{"Word":"package","Offset":7500000,"Duration":3700000},{"Word":"from","Offset":11300000,"Duration":2100000},{"Word":"porch","Offset":13500000,"Duration":4900000},{"Word":"and","Offset":18700000,"Duration":1000000},{"Word":"he's","Offset":19800000,"Duration":1400000},{"Word":"about","Offset":21300000,"Duration":2800000},{"Word":"to","Offset":24200000,"Duration":1000000},{"Word":"open","Offset":25300000,"Duration":2900000},{"Word":"it","Offset":28300000,"Duration":1000000},{"Word":"in","Offset":29400000,"Duration":1200000},{"Word":"his","Offset":30700000,"Duration":1500000},{"Word":"house","Offset":32300000,"Duration":6300000},{"Word":"but","Offset":44100000,"Duration":4300000},{"Word":"he","Offset":48500000,"Duration":500000},{"Word":"doesn't","Offset":49100000,"Duration":3000000},{"Word":"know","Offset":52200000,"Duration":1800000},{"Word":"is","Offset":54100000,"Duration":900000},{"Word":"that","Offset":55100000,"Duration":1300000},{"Word":"this","Offset":56500000,"Duration":1400000},{"Word":"is","Offset":58000000,"Duration":1100000},{"Word":"the","Offset":59200000,"Duration":1200000},{"Word":"third","Offset":60500000,"Duration":2500000},{"Word":"generation","Offset":63100000,"Duration":6100000},{"Word":"of","Offset":69300000,"Duration":1700000},{"Word":"a","Offset":71100000,"Duration":500000},{"Word":"new","Offset":71700000,"Duration":1800000},{"Word":"and","Offset":73600000,"Duration":800000},{"Word":"improved","Offset":74500000,"Duration":4500000},{"Word":"custom","Offset":79100000,"Duration":3500000},{"Word":"built","Offset":82700000,"Duration":2000000},{"Word":"bay","Offset":84800000,"Duration":1400000},{"Word":"package","Offset":86300000,"Duration":5000000},{"Word":"that's","Offset":91400000,"Duration":1400000},{"Word":"recording","Offset":92900000,"Duration":3300000},{"Word":"him","Offset":96300000,"Duration":900000},{"Word":"on","Offset":97300000,"Duration":1300000},{"Word":"four","Offset":98700000,"Duration":1900000},{"Word":"different","Offset":100700000,"Duration":2700000},{"Word":"phones","Offset":103500000,"Duration":4900000},{"Word":"and","Offset":108500000,"Duration":1600000},{"Word":"just","Offset":110200000,"Duration":2400000},{"Word":"released","Offset":112700000,"Duration":3300000},{"Word":"a","Offset":116100000,"Duration":500000},{"Word":"pound","Offset":116700000,"Duration":2100000},{"Word":"of","Offset":118900000,"Duration":500000},{"Word":"the","Offset":119500000,"Duration":800000},{"Word":"world","Offset":120400000,"Duration":1700000},{"Word":"'s","Offset":122200000,"Duration":400000},{"Word":"finest","Offset":122700000,"Duration":3300000},{"Word":"glitter","Offset":126100000,"Duration":4100000},{"Word":"along","Offset":130600000,"Duration":2800000},{"Word":"with","Offset":133500000,"Duration":1100000},{"Word":"some","Offset":134700000,"Duration":1300000},{"Word":"other","Offset":136100000,"Duration":1700000},{"Word":"nasty","Offset":137900000,"Duration":3300000},{"Word":"surprises","Offset":141300000,"Duration":8500000},{"Word":"but","Offset":173400000,"Duration":2700000},{"Word":"to","Offset":176200000,"Duration":600000},{"Word":"understand","Offset":176900000,"Duration":4000000},{"Word":"how","Offset":181000000,"Duration":900000},{"Word":"we","Offset":182000000,"Duration":1100000},{"Word":"got","Offset":183200000,"Duration":2200000},{"Word":"here","Offset":185500000,"Duration":4300000},{"Word":"we","Offset":190100000,"Duration":900000},{"Word":"first","Offset":191100000,"Duration":2400000},{"Word":"have","Offset":193600000,"Duration":1100000},{"Word":"to","Offset":194800000,"Duration":800000},{"Word":"go","Offset":195700000,"Duration":900000},{"Word":"back","Offset":196700000,"Duration":2100000},{"Word":"in","Offset":198900000,"Duration":800000},{"Word":"time","Offset":199800000,"Duration":2500000},{"Word":"a","Offset":202400000,"Duration":500000},{"Word":"bit","Offset":203000000,"Duration":3400000},{"Word":"'cause","Offset":220700000,"Duration":2900000},{"Word":"that's","Offset":223900000,"Duration":4100000},{"Word":"when","Offset":228100000,"Duration":2300000},{"Word":"this","Offset":230500000,"Duration":2300000},{"Word":"couple","Offset":232900000,"Duration":5900000},{"Word":"stole","Offset":239100000,"Duration":3900000},{"Word":"a","Offset":243100000,"Duration":700000},{"Word":"package","Offset":243900000,"Duration":5300000},{"Word":"from","Offset":249300000,"Duration":2100000},{"Word":"my","Offset":251500000,"Duration":1700000},{"Word":"porch","Offset":253300000,"Duration":6800000},{"Word":"and","Offset":260400000,"Duration":1400000},{"Word":"even","Offset":261900000,"Duration":2300000},{"Word":"with","Offset":264300000,"Duration":1700000},{"Word":"the","Offset":266100000,"Duration":900000},{"Word":"video","Offset":267100000,"Duration":3100000},{"Word":"footage","Offset":270300000,"Duration":3700000},{"Word":"the","Offset":274100000,"Duration":1100000},{"Word":"police","Offset":275300000,"Duration":3300000},{"Word":"wouldn't","Offset":278700000,"Duration":3300000},{"Word":"do","Offset":282100000,"Duration":1500000},{"Word":"anything","Offset":283700000,"Duration":5900000},{"Word":"so","Offset":289700000,"Duration":2300000},{"Word":"i","Offset":292100000,"Duration":900000},{"Word":"vowed","Offset":293100000,"Duration":3900000},{"Word":"to","Offset":297100000,"Duration":1100000},{"Word":"use","Offset":298300000,"Duration":1500000},{"Word":"my","Offset":299900000,"Duration":2100000},{"Word":"engineering","Offset":302100000,"Duration":4700000},{"Word":"skills","Offset":306900000,"Duration":5100000},{"Word":"to","Offset":312100000,"Duration":1100000},{"Word":"go","Offset":313300000,"Duration":2100000},{"Word":"full","Offset":315500000,"Duration":3500000},{"Word":"home","Offset":319100000,"Duration":2400000},{"Word":"alone","Offset":321600000,"Duration":3400000},{"Word":"on","Offset":325100000,"Duration":1100000},{"Word":"these","Offset":326300000,"Duration":2100000},{"Word":"punks","Offset":328500000,"Duration":4500000},{"Word":"not","Offset":333100000,"Duration":1800000},{"Word":"just","Offset":335000000,"Duration":1800000},{"Word":"to","Offset":336900000,"Duration":900000},{"Word":"avenge","Offset":337900000,"Duration":2900000},{"Word":"my","Offset":340900000,"Duration":2100000},{"Word":"package","Offset":343100000,"Duration":6500000},{"Word":"but","Offset":349900000,"Duration":1900000},{"Word":"as","Offset":351900000,"Duration":1100000},{"Word":"a","Offset":353100000,"Duration":500000},{"Word":"tribute","Offset":353700000,"Duration":3700000},{"Word":"to","Offset":357500000,"Duration":900000},{"Word":"the","Offset":358500000,"Duration":1100000},{"Word":"two","Offset":359700000,"Duration":2500000},{"Word":"million","Offset":362300000,"Duration":2900000},{"Word":"packages","Offset":365300000,"Duration":5700000},{"Word":"that","Offset":371100000,"Duration":1200000},{"Word":"are","Offset":372400000,"Duration":800000},{"Word":"stolen","Offset":373300000,"Duration":3500000},{"Word":"across","Offset":376900000,"Duration":3500000},{"Word":"america","Offset":380500000,"Duration":6100000},{"Word":"every","Offset":386700000,"Duration":3900000},{"Word":"year","Offset":390700000,"Duration":4100000},{"Word":"and","Offset":395100000,"Duration":1300000},{"Word":"because","Offset":396500000,"Duration":2500000},{"Word":"packages","Offset":399100000,"Duration":4500000},{"Word":"are","Offset":403700000,"Duration":1000000},{"Word":"taking","Offset":404800000,"Duration":2600000},{"Word":"most","Offset":407500000,"Duration":2500000},{"Word":"in","Offset":410100000,"Duration":700000},{"Word":"december","Offset":410900000,"Duration":5700000},{"Word":"for","Offset":416700000,"Duration":1300000},{"Word":"the","Offset":418100000,"Duration":700000},{"Word":"third","Offset":418900000,"Duration":2200000},{"Word":"year","Offset":421200000,"Duration":1400000},{"Word":"now","Offset":422700000,"Duration":4000000},{"Word":"it's","Offset":427000000,"Duration":2000000},{"Word":"sort","Offset":429100000,"Duration":1500000},{"Word":"of","Offset":430700000,"Duration":700000},{"Word":"become","Offset":431500000,"Duration":2700000},{"Word":"a","Offset":434300000,"Duration":900000},{"Word":"christmas","Offset":435300000,"Duration":5100000},{"Word":"time","Offset":440500000,"Duration":2300000},{"Word":"tradition","Offset":442900000,"Duration":6900000},{"Word":"for","Offset":450100000,"Duration":1900000},{"Word":"me","Offset":452100000,"Duration":900000},{"Word":"to","Offset":453100000,"Duration":1100000},{"Word":"do","Offset":454300000,"Duration":1300000},{"Word":"my","Offset":455700000,"Duration":1500000},{"Word":"very","Offset":457300000,"Duration":4700000},{"Word":"small","Offset":462100000,"Duration":3700000},{"Word":"part","Offset":465900000,"Duration":4300000},{"Word":"to","Offset":470300000,"Duration":1100000},{"Word":"encourage","Offset":471500000,"Duration":4700000},{"Word":"future","Offset":476300000,"Duration":4500000},{"Word":"would","Offset":480900000,"Duration":1900000},{"Word":"be","Offset":482900000,"Duration":1300000},{"Word":"porch","Offset":484300000,"Duration":3700000},{"Word":"pirates","Offset":488100000,"Duration":5100000},{"Word":"to","Offset":493300000,"Duration":1500000},{"Word":"choose","Offset":494900000,"Duration":2600000},{"Word":"a","Offset":497600000,"Duration":1000000},{"Word":"different","Offset":498700000,"Duration":3600000},{"Word":"profession","Offset":502400000,"Duration":7100000},{"Word":"in","Offset":509800000,"Duration":2000000},{"Word":"just","Offset":511900000,"Duration":2400000},{"Word":"the","Offset":514400000,"Duration":1000000},{"Word":"most","Offset":515500000,"Duration":4600000},{"Word":"fabulous","Offset":520800000,"Duration":6500000},{"Word":"way","Offset":527400000,"Duration":1500000},{"Word":"possible","Offset":529000000,"Duration":6500000},{"Word":"so","Offset":535800000,"Duration":1500000},{"Word":"before","Offset":537400000,"Duration":2900000},{"Word":"we","Offset":540400000,"Duration":1100000},{"Word":"see","Offset":541600000,"Duration":1500000},{"Word":"how","Offset":543200000,"Duration":1100000},{"Word":"this","Offset":544400000,"Duration":2300000},{"Word":"years","Offset":546800000,"Duration":2100000},{"Word":"version","Offset":549000000,"Duration":3500000},{"Word":"fares","Offset":552600000,"Duration":2600000},{"Word":"in","Offset":555300000,"Duration":600000},{"Word":"the","Offset":556000000,"Duration":700000},{"Word":"wild","Offset":556800000,"Duration":4700000},{"Word":"i'm","Offset":561600000,"Duration":700000},{"Word":"going","Offset":562400000,"Duration":1200000},{"Word":"to","Offset":563700000,"Duration":900000},{"Word":"first","Offset":564700000,"Duration":3000000},{"Word":"walk","Offset":567800000,"Duration":1900000},{"Word":"you","Offset":569800000,"Duration":700000},{"Word":"through","Offset":570600000,"Duration":1500000},{"Word":"all","Offset":572200000,"Duration":1900000},{"Word":"the","Offset":574200000,"Duration":1700000},{"Word":"upgrades","Offset":576000000,"Duration":4300000},{"Word":"my","Offset":580400000,"Duration":1300000},{"Word":"buddy","Offset":581800000,"Duration":2100000},{"Word":"sean","Offset":584000000,"Duration":2900000},{"Word":"and","Offset":587000000,"Duration":1300000},{"Word":"i","Offset":588400000,"Duration":1500000},{"Word":"have","Offset":590000000,"Duration":1600000},{"Word":"been","Offset":591700000,"Duration":1200000},{"Word":"incorporating","Offset":593000000,"Duration":7200000},{"Word":"into","Offset":600300000,"Duration":1600000},{"Word":"this","Offset":602000000,"Duration":1700000},{"Word":"box","Offset":603800000,"Duration":5100000},{"Word":"off","Offset":609000000,"Duration":700000}]}]}`);
        this.context.commit("setVideoId", payload.youTubeVideoId);
        this.context.commit("setTranscription", hint<ITranscription>({
            audioUrl: "",
            words: response.NBest[0].Words.map((w: any, i: number) => hint<IWord>({
                index: i,
                text: w.Word,
                display: w.Word,
                offset: w.Offset / 10_000_000,
                duration: w.Duration / 10_000_000,
                score: null,
            })),
        }));
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
