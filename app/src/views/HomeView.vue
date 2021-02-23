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
                            <iframe allowfullscreen
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube-nocookie.com/embed/LseK5gp66u8?controls=0"
                                    allow="autoplay; encrypted-media"
                                    class="youtube-iframe">
                            </iframe>
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
                        <span :key="w.index" :data-index="w.index" class="word">{{ w.text }}</span>
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
    ITranscription,
} from "@/store/app";

// TODO: Make playback speed changeable.

@Component
export default class HomeView extends Vue {
    private readonly app = getModule(AppModule);

    @Ref("transcript") private readonly transcriptRef!: HTMLElement;

    private playerHeight = 400;
    private controlsHeight = 400;
    private transcriptHeight = 400;
    private selectionChangedNativeEvent!: () => void;

    private transcription: ITranscription | null = null;

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

    async mounted(): Promise<void> {
        this.selectionChangedNativeEvent = () => this.onSelectionChanged();
        document.addEventListener("selectionchange", this.selectionChangedNativeEvent);

        this.transcription = await this.app.doTranscribe({youTubeVideoId: "LseK5gp66u8"});
    }

    beforeDestroy(): void {
        document.removeEventListener("selectionchange", this.selectionChangedNativeEvent);
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
        border: 2px dotted transparent;
        border-radius: 4px;

        cursor: pointer;

        &:hover {
            border-color: $primary-color;
        }
    }
}

</style>
