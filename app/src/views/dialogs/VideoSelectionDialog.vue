<!--
    LYNGUA LANGUAGE LEARNING EXPERIENCE
    Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
-->

<template>
    <v-dialog persistent
              :hide-overlay="fullscreen"
              :fullscreen="fullscreen"
              :transition="transition"
              :max-width="width"
              :value="visible"
              @input="onCancel">
        <v-card>
            <v-toolbar dark dense
                       class="pe-2"
                       color="primary">
                <v-toolbar-title>
                    Start a New Language Learning Session&hellip;
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-container class="pt-6 pb-0">
                    <v-row>
                        <v-col cols="12">
                            <div class="text-body-1">
                                Copy &amp; paste a link to a YouTube video into the text field below&hellip;
                            </div>
                        </v-col>
                        <v-col cols="12" class="pb-0">
                            <v-text-field dense outlined clearable
                                          placeholder="https://www.youtube.com/watch?v=…"
                                          :rules="youTubeVideoIdRules"
                                          @input="onVideoUrlChanged" />
                        </v-col>

                        <v-col cols="12" class="pt-0">
                            <v-list two-line rounded
                                    max-height="400"
                                    class="pt-0 overflow-y-auto slim-scrollbar">
                                <v-list-item-group v-model="selectedVideoIndex"
                                                   :key="groupKey">
                                    <v-list-item v-if="customVideoInfo" class="my-0">
                                        <template v-slot:default="{ active }">
                                            <v-list-item-action>
                                                <v-checkbox color="primary"
                                                            :input-value="active" />
                                            </v-list-item-action>

                                            <v-list-item-avatar tile
                                                                width="100%"
                                                                height="100%"
                                                                max-width="120"
                                                                max-height="120">
                                                <v-img class="thumbnail"
                                                       :aspect-ratio="16/9"
                                                       :src="customVideoInfo.thumbnailUrl" />
                                            </v-list-item-avatar>

                                            <v-list-item-content class="ms-4">
                                                <v-list-item-title>
                                                    {{ customVideoInfo.title }}
                                                </v-list-item-title>
                                                <v-list-item-subtitle>
                                                    {{ customVideoInfo.author }}
                                                </v-list-item-subtitle>
                                            </v-list-item-content>
                                        </template>
                                    </v-list-item>

                                    <div :class="[
                                            'text-body-1',
                                            'text--secondary',
                                            customVideoInfo ? 'py-6' : 'pb-6',
                                        ]">
                                        &hellip;or select one of these suggestions:
                                    </div>

                                    <v-list-item v-for="v in featuredVideos" :key="v.videoId"
                                                 class="my-0">
                                        <template v-slot:default="{ active }">
                                            <v-list-item-action>
                                                <v-checkbox color="primary"
                                                            :input-value="active" />
                                            </v-list-item-action>

                                            <v-list-item-avatar tile
                                                                width="100%"
                                                                height="100%"
                                                                max-width="120"
                                                                max-height="120">
                                                <v-img class="thumbnail"
                                                       :aspect-ratio="16/9"
                                                       :src="v.thumbnailUrl" />
                                            </v-list-item-avatar>

                                            <v-list-item-content class="ms-4">
                                                <v-list-item-title>
                                                    {{ v.title }}
                                                </v-list-item-title>
                                                <v-list-item-subtitle>
                                                    {{ v.author }}
                                                </v-list-item-subtitle>
                                            </v-list-item-content>
                                        </template>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-col>
                    </v-row>
                </v-container>

                <v-card-actions class="px-1 pt-4">
                    <v-spacer />

                    <v-btn depressed
                           color="primary"
                           class="mx-2"
                           :disabled="selectedVideoIndex === null || selectedVideoIndex === undefined"
                           :loading="pending"
                           @click="onStart">
                        Start Practicing
                    </v-btn>

                    <v-btn depressed
                           class="mx-2"
                           :disabled="!app.videoId || pending"
                           @click="onCancel">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<!--suppress JSMethodCanBeStatic -->
<script lang="ts">

import {
    Component,
    Vue,
} from "vue-property-decorator";

import { getModule } from "vuex-module-decorators";
import {
    AppModule,
    extractYouTubeVideoIdFromUrl,
    IVideoInfo,
} from "@/store/app";

@Component
export default class VideoSelectionDialog extends Vue {
    private readonly app = getModule(AppModule);

    private visible = false;
    private pending = false;
    private customVideoInfo: IVideoInfo | null = null;
    private selectedVideoIndex: number | null = null;
    private featuredVideos: IVideoInfo[] = [
        {
            videoId: "h4T_LlK1VE4",
            canonicalUrl: "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dh4T_LlK1VE4",
            thumbnailUrl: "https://i.ytimg.com/vi/h4T_LlK1VE4/hqdefault.jpg",
            title: "Glitterbomb 3.0 vs. Porch Pirates",
            author: "Mark Rober",
        },
        {
            videoId: "TfVYxnhuEdU",
            canonicalUrl: "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DTfVYxnhuEdU",
            thumbnailUrl: "https://i.ytimg.com/vi/TfVYxnhuEdU/hqdefault.jpg",
            title: "I asked an AI for video ideas, and they were actually good",
            author: "Tom Scott",
        },
        {
            videoId: "OmCzZ-D8Wdk",
            canonicalUrl: "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DOmCzZ-D8Wdk",
            thumbnailUrl: "https://i.ytimg.com/vi/OmCzZ-D8Wdk/hqdefault.jpg",
            title: "Gimbal Lock and Apollo 13",
            author: "The Vintage Space",
        },
        {
            videoId: "O37yJBFRrfg",
            canonicalUrl: "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DO37yJBFRrfg",
            thumbnailUrl: "https://i.ytimg.com/vi/O37yJBFRrfg/hqdefault.jpg",
            title: "The European Union Explained*",
            author: "CGP Grey",
        },
        {
            videoId: "uxPdPpi5W4o",
            canonicalUrl: "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DuxPdPpi5W4o",
            thumbnailUrl: "https://i.ytimg.com/vi/uxPdPpi5W4o/hqdefault.jpg",
            title: "Why Are 96,000,000 Black Balls on This Reservoir?",
            author: "Veritasium",
        },
        {
            videoId: "Vxlci1d2rOg",
            canonicalUrl: "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DVxlci1d2rOg",
            thumbnailUrl: "https://i.ytimg.com/vi/Vxlci1d2rOg/hqdefault.jpg",
            title: "How They Did It - Pet Dogs in Ancient Rome",
            author: "Invicta",
        },
    ];

    private get fullscreen() {
        return this.$vuetify.breakpoint.xsOnly;
    }

    private get transition() {
        return this.fullscreen
            ? "dialog-bottom-transition"
            : "dialog-transition";
    }

    private get width(): string {
        switch(this.$vuetify.breakpoint.name) {
            case "xs":
                return "100%";
            default:
                return "800px";
        }
    }

    private get groupKey() {
        return [this.customVideoInfo, ...this.featuredVideos]
            .map(v => v?.videoId)
            .join(":");
    }

    private get youTubeVideoIdRules() {
        return [
            (v: any) => (!v || !!extractYouTubeVideoIdFromUrl(v)) || "This does not seem to be a valid YouTube video URL…",
        ];
    }

    show(): void {
        this.visible = true;
    }

    private async onVideoUrlChanged(url: string) {
        const videoId = extractYouTubeVideoIdFromUrl(url);
        if(!videoId) {
            this.customVideoInfo = null;
            return;
        }

        this.customVideoInfo = await this.app.doFetchVideoInfo({youTubeVideoId: videoId});
        if(this.customVideoInfo !== null) {
            this.selectedVideoIndex = 0;
        }
    }

    private onStart() {
        if(this.selectedVideoIndex === null || this.selectedVideoIndex === undefined) {
            return;
        }

        const video = this.customVideoInfo === null
            ? this.featuredVideos[this.selectedVideoIndex]
            : [this.customVideoInfo, ...this.featuredVideos][this.selectedVideoIndex];

        this.app.doTranscribe({
            youTubeVideoId: video.videoId,
        });

        this.visible = false;
    }

    private onCancel() {
        this.visible = false;
    }
}

</script>

<style lang="scss" scoped>

@import "~@/styles/variables.scss";

.thumbnail {
    border: 2px solid $primary-color;
    border-radius: 8px !important;
}

</style>
