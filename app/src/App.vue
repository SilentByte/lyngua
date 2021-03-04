<!--
    LYNGUA LANGUAGE LEARNING EXPERIENCE
    Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
-->

<template>
    <v-app>
        <v-app-bar app dark
                   color="primary"
                   elevation="3">
            <v-toolbar-items>
                <v-btn plain
                       to="/">
                    <div class="brand">
                        Lyngua
                    </div>
                </v-btn>
            </v-toolbar-items>

            <v-spacer />

            <v-toolbar-items>
                <v-btn text
                       :disabled="app.recording"
                       @click="onStartNewSession">
                    <v-icon small left>
                        mdi-video-vintage
                    </v-icon>
                    New Session
                </v-btn>
            </v-toolbar-items>

            <div>
                <v-btn icon
                       :disabled="!app.canDecreaseFontSize"
                       @click="app.decreaseFontSize()">
                    <v-icon>
                        mdi-format-font-size-decrease
                    </v-icon>
                </v-btn>

                <v-btn icon
                       :disabled="!app.canIncreaseFontSize"
                       @click="app.increaseFontSize()">
                    <v-icon>
                        mdi-format-font-size-increase
                    </v-icon>
                </v-btn>
            </div>
        </v-app-bar>
        <v-main>
            <keep-alive>
                <router-view />
            </keep-alive>

            <VideoSelectionDialog ref="videoSelectionDialog" />
        </v-main>
    </v-app>
</template>

<script lang="ts">

import {
    Component,
    Ref,
    Vue,
} from "vue-property-decorator";

import { getModule } from "vuex-module-decorators";
import { AppModule } from "@/store/app";

import VideoSelectionDialog from "@/views/dialogs/VideoSelectionDialog.vue";

@Component({
    components: {
        VideoSelectionDialog,
    },
})
export default class App extends Vue {
    private readonly app = getModule(AppModule);

    @Ref("videoSelectionDialog") private readonly videoSelectionDialogRef!: VideoSelectionDialog;

    private onStartNewSession() {
        this.videoSelectionDialogRef.show();
    }

    async mounted(): Promise<void> {
        this.onStartNewSession();
    }
}

</script>

<style lang="scss" scoped>

.brand {
    font-size: 26px;
    font-weight: bold;
    letter-spacing: 2px;
    text-transform: uppercase;
}

</style>
