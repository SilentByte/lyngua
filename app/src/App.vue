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

            <v-select dense outlined hide-details
                      class="text-uppercase"
                      style="max-width: 200px"
                      item-value="code"
                      item-text="name"
                      :value="app.language"
                      :items="languages"
                      :disabled="app.recording"
                      @change="onChangeLanguage">
                <template v-slot:prepend-inner>
                    <v-icon small
                            class="mt-1 me-1">
                        mdi-translate
                    </v-icon>
                </template>
            </v-select>

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

            <AppBlockingDialog />
            <VideoSelectionDialog ref="videoSelectionDialog" />
        </v-main>
    </v-app>
</template>

<!--suppress JSMethodCanBeStatic -->
<script lang="ts">

import {
    Component,
    Ref,
    Vue,
} from "vue-property-decorator";

import { getModule } from "vuex-module-decorators";
import {
    AppModule,
    SupportedLanguage,
} from "@/store/app";

import VideoSelectionDialog from "@/views/dialogs/VideoSelectionDialog.vue";
import AppBlockingDialog from "@/views/dialogs/AppBlockingDialog.vue";

@Component({
    components: {
        AppBlockingDialog,
        VideoSelectionDialog,
    },
})
export default class App extends Vue {
    private readonly app = getModule(AppModule);

    private get languages(): Array<{ code: SupportedLanguage; name: string }> {
        return [
            {code: "en", name: "English"},
            {code: "de", name: "German"},
            {code: "fr", name: "French"},
            {code: "it", name: "Italian"},
            {code: "pt", name: "Portuguese"},
        ];
    }

    @Ref("videoSelectionDialog") private readonly videoSelectionDialogRef!: VideoSelectionDialog;

    private onChangeLanguage(code: SupportedLanguage) {
        this.app.setLanguage(code);
    }

    private onStartNewSession() {
        // this.videoSelectionDialogRef.show();
        this.app.doTranscribe({youTubeVideoId: "h4T_LlK1VE4"});
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
