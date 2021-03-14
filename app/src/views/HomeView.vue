<!--
    LYNGUA LANGUAGE LEARNING EXPERIENCE
    Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
-->

<template>
    <v-container fluid
                 v-resize="onResize">
        <v-row dense class="fill-height">
            <v-col cols="6" lg="5" xl="4">
                <v-row dense>
                    <v-col cols="12">
                        <v-card outlined
                                :height="playerHeight">
                            <v-skeleton-loader v-if="!app.videoId"
                                               type="image"
                                               class="image-skeleton-loader"
                                               height="100%" />

                            <youtube v-else
                                     ref="youtube"
                                     nocookie
                                     width="100%"
                                     height="100%"
                                     :video-id="app.videoId"
                                     @ready="onPlayerReady"
                                     @ended="onPlayerEnded"
                                     @playing="onPlayerPlaying"
                                     @paused="onPlayerPaused"
                                     @buffering="onPlayerBuffering"
                                     @cued="onPlayerCued"
                                     @error="onPlayerError" />

                            <v-overlay absolute
                                       opacity="0.8"
                                       :value="app.recording" />
                        </v-card>
                    </v-col>
                    <v-col cols="12">
                        <v-card outlined
                                class="slim-scrollbar overflow-y-auto"
                                :height="infoHeight">

                            <v-card-text v-if="translation">
                                <v-row dense>
                                    <v-col cols="12">
                                        <strong>Translation:</strong>
                                        {{ translation.text }}
                                    </v-col>
                                    <v-col cols="12">
                                        <div v-for="(w, i) in translation.words" :key="i"
                                             class="mb-2">
                                            {{ w.source }} {{ w.pos }} {{ w.target }} - example?
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-text v-else>
                                Select text to translate.
                            </v-card-text>

                            <v-overlay absolute
                                       opacity="0.8"
                                       :value="app.recording" />
                        </v-card>
                    </v-col>
                    <v-col cols="12">
                        <v-card outlined
                                :height="creditsHeight">
                            <div class="d-flex align-center fill-height">
                                <v-btn x-small plain
                                       color="primary"
                                       href="https://twitter.com/RicoBeti"
                                       target="_blank"
                                       class="ms-2 text-none">
                                    @RicoBeti
                                </v-btn>

                                <v-btn x-small plain
                                       color="primary"
                                       href="https://twitter.com/Phtevem"
                                       target="_blank"
                                       class="text-none">
                                    @Phtevem
                                </v-btn>

                                <v-spacer />

                                <v-btn x-small plain disabled
                                       class="text-none">
                                    Powered by Microsoft Azure
                                </v-btn>
                            </div>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>

            <v-col cols="6" lg="7" xl="8">
                <v-row dense>
                    <v-col cols="12">
                        <v-card ref="transcript"
                                outlined
                                class="slim-scrollbar transcript"
                                :style="{ fontSize: `${24 * app.fontSize}px` }"
                                :height="transcriptHeight"
                                @pointerdown="onMouseDown"
                                @pointerup="onMouseUp">

                            <template v-if="!app.transcription">
                                <template v-for="i in 50">
                                    <v-skeleton-loader :key="i"
                                                       type="text"
                                                       height="1em"
                                                       :width="`${Math.random() * (95 - 70) + 70}%`" />
                                </template>
                            </template>

                            <!-- Keep on one line because whitespace is relevant here. -->
                            <template v-else v-for="w in app.transcription.words">
                                <v-tooltip bottom
                                           open-delay="400"
                                           :key="w.index"
                                           :disabled="!w.score || app.recording">
                                    <template v-slot:activator="{ on, attrs }">
                                        <span :ref="`word-${w.index}`"
                                              v-bind="attrs"
                                              v-on="on"
                                              :data-index="w.index"
                                              :class="[
                                                  'word',
                                                  isWordActive(w) ? 'active' : '',
                                                  isWordSelected(w) ? 'selected' : '',
                                                  app.recording && !isWordSelected(w) ? 'disabled' : '',
                                                  wordScoreClass(w),
                                              ]">{{ w.text }}</span>
                                        <span :key="`${w.index}-s`" class="space">{{ " " }}</span>
                                    </template>
                                    <span>{{ wordScoreText(w) }}</span>
                                </v-tooltip>
                            </template>
                        </v-card>
                    </v-col>

                    <v-col cols="12">
                        <v-card outlined
                                class="pa-4 d-flex align-center"
                                :height="controlsHeight">

                            <v-btn large depressed
                                   width="200"
                                   color="info"
                                   :disabled="!selectedRange || app.recording"
                                   @click="onPlayOrPause">
                                <template v-if="currentPlayRange">
                                    <v-icon left>mdi-pause</v-icon>
                                    Pause Playback
                                </template>
                                <template v-else>
                                    <v-icon left>mdi-play</v-icon>
                                    Play Selection
                                </template>
                            </v-btn>

                            <v-btn large depressed
                                   width="200"
                                   color="error"
                                   class="mx-2"
                                   :disabled="!selectedRange"
                                   @click="onRecordOrStop">
                                <template v-if="app.recording">
                                    <v-icon left>mdi-stop</v-icon>
                                    Stop Recording
                                </template>
                                <template v-else>
                                    <v-icon left>mdi-record</v-icon>
                                    Record Selection
                                </template>
                            </v-btn>

                            <template v-if="!app.hasRecordingPermission">
                                <div class="text-caption text--secondary">
                                    <v-icon small color="info">
                                        mdi-information-outline
                                    </v-icon>
                                    Please give Lyngua permission to use your microphone.
                                </div>
                            </template>
                            <template v-else-if="app.recording">
                                <v-progress-linear rounded
                                                   color="recording"
                                                   height="16"
                                                   class="d-inline-flex"
                                                   style="width: 150px"
                                                   :value="app.recordingPeak * 100" />

                                <v-progress-circular color="recording"
                                                     size="35"
                                                     class="ms-2 d-inline-flex"
                                                     :value="recordingDurationPercentage">
                                    <div class="text-caption text--secondary">
                                        {{ Math.round(recordingDuration) }}
                                    </div>
                                </v-progress-circular>
                            </template>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<!--suppress JSMethodCanBeStatic, JSUnusedGlobalSymbols -->
<script lang="ts">

import {
    Component,
    Ref,
    Vue,
} from "vue-property-decorator";

import rangy from "rangy";

import { getModule } from "vuex-module-decorators";
import {
    AppModule,
    IWord,
    ITranslation,
    postpone,
} from "@/store/app";

const PLAYER_TICK_INTERVAL_MS = 100;
const MAX_RECORDING_TIMEOUT_MS = 30_000;

// TODO: - Make playback speed changeable
//       - Auto-scroll current word into view
//       - When clicked/hovered on word, show FABs like 'go to (seek)', 'play', 'record'.
//       - When words are selected, show FABs, e.g. 'play'. Then only play exactly this part.
@Component
export default class HomeView extends Vue {
    private readonly app = getModule(AppModule);

    @Ref("transcript") private readonly transcriptRef!: HTMLElement;

    private playerHeight = 400;
    private infoHeight = 400;
    private creditsHeight = 28;
    private transcriptHeight = 400;
    private controlsHeight = 78;

    private nativeSelectionChangedEvent!: () => void;
    private nativeTickInterval = 0;
    private nativeRecordingTimeout = 0;

    // TODO: Move out into Vuex.
    private currentWord: IWord | null = null;
    private selectedRange: [IWord, IWord] | null = null;
    private currentPlayRange: [number, number] | null = null;

    private recordingStartTimestamp = 0;
    private recordingDuration = 0;

    private translation: ITranslation | null = null;

    private get recordingDurationPercentage() {
        return this.recordingDuration / (MAX_RECORDING_TIMEOUT_MS / 1000) * 100;
    }

    private get selectedWords(): IWord[] {
        if(!this.selectedRange) {
            return [];
        }

        return this.app.transcription!.words.slice(this.selectedRange[0].index, this.selectedRange[1].index + 1);
    }

    private player(): Record<string, any> | null {
        return (this.$refs.youtube as any)?.player || null;
    }

    private isWordActive(word: IWord) {
        return this.currentWord?.index === word.index;
    }

    private isWordSelected(word: IWord) {
        if(!this.selectedRange) {
            return false;
        }

        return word.index >= this.selectedRange[0].index
            && word.index <= this.selectedRange[1].index;
    }

    private wordScoreClass(word: IWord) {
        return this.app.recording || !word.score ? ""
            : word.score.accuracy >= 0.8 ? "score-high"
                : word.score.accuracy >= 0.5 ? "score-medium"
                    : "score-low";
    }

    private wordScoreText(word: IWord) {
        if(!word.score) {
            return "";
        }

        const accuracy = Math.round(word.score.accuracy * 100);
        if(word.score.error === "none") {
            return `Pronunciation Score: ${accuracy}%`;
        } else {
            return word.score.error === "omission" ? "This is an omission"
                : word.score.error === "insertion" ? "This is an insertion"
                    : "This is a mispronunciation";
        }
    }

    private findWordByOffset(offset: number): IWord | null {
        if(!this.app.transcription) {
            return null;
        }

        const words = this.app.transcription.words;
        for(let i = 0; i < words.length; i += 1) {
            if(words[i].offset > offset) {
                return words[i - 1];
            }
        }

        return null;
    }

    private onResize() {
        const height = window.innerHeight - 90;
        this.playerHeight = 400;
        this.infoHeight = height - this.playerHeight - this.creditsHeight - 16;
        this.transcriptHeight = height - this.controlsHeight - 8;
    }

    private onSelectionChanged() {
        if(!this.app.transcription || this.app.recording) {
            return;
        }

        this.currentPlayRange = null;

        let nodes: Array<Node | HTMLElement> = rangy
            .getSelection()
            .getAllRanges()
            .flatMap(r => r.getNodes());

        nodes = [
            ...nodes,
            ...nodes.map(n => n.parentElement).filter(n => !!n),
        ].filter((n: any) => n.classList?.contains("word")) as typeof nodes;

        if(nodes.length > 0) {
            this.selectedRange = [
                this.app.transcription.words[(nodes[0] as any).getAttribute("data-index")],
                this.app.transcription.words[(nodes[nodes.length - 1] as any).getAttribute("data-index")],
            ];
        }
    }

    private onMouseDown(e: PointerEvent) {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }

    private onMouseUp(e: PointerEvent) {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);

        const savedRange = this.selectedRange;
        rangy.getNativeSelection().removeAllRanges();

        postpone(async () => {
            this.selectedRange = savedRange;

            // TODO: Debounce.
            this.translation = null;
            this.translation = await this.app.doTranslate({
                words: this.selectedWords.map(w => w.display),
                targetLanguage: "de-CH",
            });
        });
    }

    private onPlayerReady() {
        console.log("onPlayerReady");
    }

    private onPlayerEnded() {
        console.log("onPlayerEnded");
    }

    private onPlayerPlaying() {
        console.log("onPlayerPlaying");
    }

    private onPlayerPaused() {
        console.log("onPlayerPaused");
    }

    private onPlayerBuffering() {
        console.log("onPlayerBuffering");
    }

    private onPlayerCued() {
        console.log("onPlayerCued");
    }

    private onPlayerError() {
        console.log("onPlayerError");
    }

    private async onTick() {
        this.recordingDuration = (Date.now() - this.recordingStartTimestamp) / 1000;

        const player = this.player();
        if(!player) {
            return;
        }

        const offset = await player.getCurrentTime();
        const word = this.findWordByOffset(offset);

        if(word) {
            this.currentWord = word;
        }

        if(this.currentPlayRange) {
            const position = await player.getCurrentTime();
            if(position > this.currentPlayRange[1]) {
                this.currentPlayRange = null;
                await player.pauseVideo();
            }
        }
    }

    private async playRange(offset: number, duration: number) {
        this.currentPlayRange = [offset, duration];

        await this.player()?.seekTo(offset);
        await this.player()?.playVideo();
    }

    private async startRecording() {
        this.player()?.pauseVideo();
        await this.app.doStartRecording();

        this.nativeRecordingTimeout = setTimeout(() => this.stopRecording(), MAX_RECORDING_TIMEOUT_MS) as unknown as number;
        this.recordingStartTimestamp = Date.now();
        this.recordingDuration = 0;
    }

    private async stopRecording() {
        clearTimeout(this.nativeRecordingTimeout);
        this.nativeRecordingTimeout = 0;

        const blob = await this.app.doStopRecording();
        if(blob) {
            await this.app.doQueueAppBlockingAction({
                action: this.app.doScorePronunciation({
                    words: this.selectedWords,
                    audio: blob,
                }),
            });
        }
    }

    private async onPlayOrPause() {
        if(this.currentPlayRange) {
            this.currentPlayRange = null;
            await this.player()?.pauseVideo();
            return;
        }

        if(this.selectedRange) {
            await this.playRange(
                this.selectedRange[0].offset,
                this.selectedRange[1].offset + this.selectedRange[1].duration,
            );
        }
    }

    private async onRecordOrStop() {
        if(this.app.recording) {
            await this.stopRecording();
            return;
        }

        if(!this.selectedRange) {
            return;
        }

        await this.startRecording();
    }

    async mounted(): Promise<void> {
        this.nativeSelectionChangedEvent = () => this.onSelectionChanged();
        this.nativeTickInterval = setInterval(() => this.onTick(), PLAYER_TICK_INTERVAL_MS) as unknown as number;

        document.addEventListener("selectionchange", this.nativeSelectionChangedEvent);
    }

    beforeDestroy(): void {
        document.removeEventListener("selectionchange", this.nativeSelectionChangedEvent);
        clearInterval(this.nativeTickInterval);
        clearTimeout(this.nativeRecordingTimeout);
    }
}

</script>

<style lang="scss" scoped>

@import "~@/styles/variables.scss";

.youtube-iframe {
    border: none;
}

.transcript {
    padding: 10px 20px;
    overflow-y: auto;
    font-size: 24px;
    line-height: 2em;

    .word {
        padding: 0.2em 0.1em;
        border: 2px solid transparent;
        border-radius: 4px;
        cursor: pointer;

        &:active {
            cursor: text;
        }

        &.active {
            color: $primary-color;
            border-color: $primary-color;
        }

        &.selected {
            color: $selected-color;
            border-color: $selected-color;
        }

        &.selected.active {
            color: $primary-color;
        }

        &.disabled {
            color: $bleached-color;
        }

        &:hover {
            color: $primary-color;
            border-color: $primary-color;
        }

        &.score-high {
            text-decoration: $success-color underline auto;
            text-underline-offset: 0.1em;
        }

        &.score-medium {
            text-decoration: $warning-color wavy underline from-font;
            text-underline-offset: 0.1em;
        }

        &.score-low {
            text-decoration: $error-color wavy underline from-font;
            text-underline-offset: 0.1em;
        }
    }

    & ::selection {
        background: transparent;
    }
}

.image-skeleton-loader {
    & ::v-deep .v-skeleton-loader__image {
        height: 100%;
    }
}

</style>
