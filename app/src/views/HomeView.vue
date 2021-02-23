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
                                :height="controlsHeight">
                            CONTROLS (?)
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>

            <v-col cols="6" lg="7" xl="8">
                <v-card ref="transcript"
                        outlined
                        class="slim-scrollbar transcript fill-height align-center justify-center align-content-center"
                        :style="{ fontSize: `${24 * app.fontSize}px` }"
                        :height="transcriptHeight">

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
                        <span :key="w.index"
                              :ref="`word-${w.index}`"
                              :class="['word', currentWordIndex === w.index ? 'active' : '']"
                              @click="onWordClick(w)"
                        >{{ w.text }}</span>
                        <span :key="`${w.index}-s`" class="space">{{ " " }}</span>
                    </template>
                </v-card>
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
    ITranscription, IWord,
} from "@/store/app";

const PLAYER_TICK_INTERVAL = 100;

// TODO: - Make playback speed changeable
//       - Auto-scroll current word into view
//       - When clicked/hovered on word, show FABs like 'go to (seek)', 'play', 'record'.
//       - When words are selected, show FABs, e.g. 'play'. Then only play exactly this part.

@Component
export default class HomeView extends Vue {
    private readonly app = getModule(AppModule);

    @Ref("transcript") private readonly transcriptRef!: HTMLElement;

    private playerHeight = 400;
    private controlsHeight = 400;
    private transcriptHeight = 400;
    private nativeSelectionChangedEvent!: () => void;
    private nativePlayerTickInterval!: number;

    private transcription: ITranscription | null = null;
    private currentWordIndex: number | null = null;

    private get player(): any {
        return (this.$refs.youtube as any).player;
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
        this.controlsHeight = height - this.playerHeight - 8;
        this.transcriptHeight = height;
    }

    // TODO: Cross-reference with timestamps, implement IWord interface.
    private onSelectionChanged() {
        let nodes: Array<Node | HTMLElement> = rangy
            .getSelection()
            .getAllRanges()
            .flatMap(r => r.getNodes());

        nodes = [
            ...nodes,
            ...nodes.map(n => n.parentElement).filter(n => n !== null),
        ].filter((n: any) => n.classList?.contains("word")) as typeof nodes;

        console.log(nodes);
        console.log("-----------------------------");
    }

    private onWordClick(word: IWord) {
        console.log(word);
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
            this.currentWordIndex = word.index;
        }
    }

    async mounted(): Promise<void> {
        this.nativeSelectionChangedEvent = () => this.onSelectionChanged();
        this.nativePlayerTickInterval = setInterval(() => this.onPlayerTick(), PLAYER_TICK_INTERVAL) as unknown as number;

        document.addEventListener("selectionchange", this.nativeSelectionChangedEvent);

        this.transcription = await this.app.doTranscribe({youTubeVideoId: "LseK5gp66u8"});

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
        padding: 4px;
        border: 2px solid transparent;
        border-radius: 4px;

        cursor: pointer;

        &:hover {
            border-color: $primary-color;
        }
    }

    .word.active {
        color: $primary-color;
        border-color: $primary-color;
    }
}

.image-skeleton-loader {
    & ::v-deep .v-skeleton-loader__image {
        height: 100%;
    }
}

</style>
