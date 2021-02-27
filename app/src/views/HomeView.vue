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
                            <v-skeleton-loader v-if="!transcription"
                                               type="image"
                                               class="image-skeleton-loader"
                                               height="100%" />

                            <youtube v-else
                                     ref="youtube"
                                     nocookie
                                     video-id="LseK5gp66u8"
                                     width="100%"
                                     height="100%"
                                     @ready="onPlayerReady"
                                     @ended="onPlayerEnded"
                                     @playing="onPlayerPlaying"
                                     @paused="onPlayerPaused"
                                     @buffering="onPlayerBuffering"
                                     @cued="onPlayerCued"
                                     @error="onPlayerError" />
                        </v-card>
                    </v-col>
                    <v-col cols="12">
                        <v-card outlined
                                :height="infoHeight">
                            CONTROLS / DICTIONARY?
                            {{ selectedRange }}
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

                            <template v-if="!transcription">
                                <template v-for="i in 50">
                                    <v-skeleton-loader :key="i"
                                                       type="text"
                                                       height="1em"
                                                       :width="`${Math.random() * (95 - 70) + 70}%`" />
                                </template>
                            </template>

                            <!-- Keep on one line because whitespace is relevant here. -->
                            <template v-else v-for="w in transcription.words">
                                <v-tooltip bottom
                                           :key="w.index"
                                           :disabled="!w.score">
                                    <template v-slot:activator="{ on, attrs }">
                                        <span :ref="`word-${w.index}`"
                                              v-bind="attrs"
                                              v-on="on"
                                              :data-index="w.index"
                                              :class="[
                                          'word',
                                          isWordActive(w) ? 'active' : '',
                                          isWordSelected(w) ? 'selected' : '',
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
                                class="pa-4"
                                :height="controlsHeight">

                            <v-btn large depressed
                                   width="200"
                                   color="info"
                                   :disabled="!selectedRange"
                                   @click="onPlay">
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
                                   class="ms-2"
                                   :disabled="!selectedRange"
                                   @click="onRecord">
                                <v-icon left>mdi-record</v-icon>
                                Record Selection
                            </v-btn>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <RecordDialog ref="recordDialog" />
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
    ITranscription,
    IWord,
    postpone,
} from "@/store/app";

import RecordDialog from "@/views/dialogs/RecordDialog.vue";

const PLAYER_TICK_INTERVAL = 100;

// TODO: - Make playback speed changeable
//       - Auto-scroll current word into view
//       - When clicked/hovered on word, show FABs like 'go to (seek)', 'play', 'record'.
//       - When words are selected, show FABs, e.g. 'play'. Then only play exactly this part.
@Component({
    components: {RecordDialog},
})
export default class HomeView extends Vue {
    private readonly app = getModule(AppModule);

    @Ref("recordDialog") private readonly recordDialogRef!: RecordDialog;
    @Ref("transcript") private readonly transcriptRef!: HTMLElement;

    private playerHeight = 400;
    private infoHeight = 400;
    private creditsHeight = 28;
    private transcriptHeight = 400;
    private controlsHeight = 78;

    private nativeSelectionChangedEvent!: () => void;
    private nativePlayerTickInterval!: number;

    private transcription: ITranscription | null = null;
    private currentWord: IWord | null = null;
    private selectedRange: [IWord, IWord] | null = null;
    private currentPlayRange: [number, number] | null = null;

    private get player(): any {
        return (this.$refs.youtube as any).player;
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
        return !word.score ? ""
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
        if(!this.transcription) {
            return null;
        }

        const words = this.transcription.words;
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
        if(!this.transcription) {
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
                this.transcription.words[(nodes[0] as any).getAttribute("data-index")],
                this.transcription.words[(nodes[nodes.length - 1] as any).getAttribute("data-index")],
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

        postpone(() => this.selectedRange = savedRange);
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

    private async onPlayerTick() {
        const offset = await this.player.getCurrentTime();
        const word = this.findWordByOffset(offset);

        if(word) {
            this.currentWord = word;
        }

        if(this.currentPlayRange) {
            const position = await this.player.getCurrentTime();
            if(position > this.currentPlayRange[1]) {
                this.currentPlayRange = null;
                await this.player.pauseVideo();
            }
        }
    }

    private async playRange(offset: number, duration: number) {
        this.currentPlayRange = [offset, duration];

        await this.player.seekTo(offset);
        await this.player.playVideo();
    }

    private async onPlay() {
        if(this.currentPlayRange) {
            this.currentPlayRange = null;
            await this.player.pauseVideo();
            return;
        }

        if(this.selectedRange) {
            await this.playRange(
                this.selectedRange[0].offset,
                this.selectedRange[1].offset + this.selectedRange[1].duration,
            );
        }
    }

    private async onRecord() {
        if(!this.selectedRange) {
            return;
        }

        const words = this.transcription!.words.slice(this.selectedRange[0].index, this.selectedRange[1].index);
        await this.recordDialogRef.show(words);
    }

    async mounted(): Promise<void> {
        this.nativeSelectionChangedEvent = () => this.onSelectionChanged();
        this.nativePlayerTickInterval = setInterval(() => this.onPlayerTick(), PLAYER_TICK_INTERVAL) as unknown as number;

        document.addEventListener("selectionchange", this.nativeSelectionChangedEvent);

        this.transcription = await this.app.doTranscribe({youTubeVideoId: "LseK5gp66u8"});
        for(let i = 18; i < 67; i += 1) {
            this.transcription.words[i].score = {
                accuracy: Math.random(),
                error: ["none", "omission", "insertion", "mispronunciation"][(Math.floor(Math.random() * 4))] as any,
            };
        }
    }

    beforeDestroy(): void {
        document.removeEventListener("selectionchange", this.nativeSelectionChangedEvent);
        clearInterval(this.nativePlayerTickInterval);
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

        &:hover {
            color: $primary-color;
            border-color: $primary-color;
        }

        &.score-high {
            text-decoration: $success-color underline auto;
        }

        &.score-medium {
            text-decoration: $warning-color wavy underline from-font;
        }

        &.score-low {
            text-decoration: $error-color wavy underline from-font;
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
