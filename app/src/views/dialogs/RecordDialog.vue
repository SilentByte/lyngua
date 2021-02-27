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
                    Record Audio
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-form ref="form"
                        v-model="form">
                    <v-container class="pt-6 pb-0">
                        <v-row dense>
                            <v-col cols="12">
                                Click on the 'Start Recording' button below to start the recording and then read the
                                following text as clearly as possible. Make sure your microphone is turned on.
                            </v-col>
                            <v-col cols="12">
                                <v-card outlined
                                        max-height="400"
                                        class="slim-scrollbar transcript"
                                        :style="{ fontSize: `${24 * app.fontSize}px` }">
                                    <template v-for="w in words">
                                        <span :key="w.index"
                                              :ref="`word-${w.index}`"
                                              :data-index="w.index"
                                              :class="[
                                                  'word',
                                              ]"
                                        >{{ w.text }}</span>
                                        <span :key="`${w.index}-s`" class="space">{{ " " }}</span>
                                    </template>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-container>

                    <v-card-actions class="px-1 pt-4">
                        <v-progress-linear v-if="recording"
                                           rounded
                                           color="error"
                                           class="ms-2 me-4"
                                           :value="amplitude" />

                        <v-spacer />

                        <v-btn depressed dark
                               color="recording"
                               class="mx-2"
                               :loading="pending"
                               @click="onStartRecording">
                            Start Recording
                        </v-btn>

                        <v-btn depressed
                               class="mx-2"
                               :disabled="recording"
                               @click="onCancel">
                            Cancel
                        </v-btn>
                    </v-card-actions>
                </v-form>
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
    IWord,
} from "@/store/app";

@Component
export default class RecordDialog extends Vue {
    private readonly app = getModule(AppModule);

    private visible = false;
    private form = false;
    private pending = false;
    private recording = false;

    private words: IWord[] = [];
    private amplitude = 50;

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

    show(words: IWord[]): void {
        this.visible = true;
        this.words = words;
    }

    private async onStartRecording() {
        if(!(this.$refs.form as any).validate()) {
            return;
        }

        // TODO: Implement.

        this.visible = false;
    }

    private async onCancel() {
        this.visible = false;
    }
}

</script>

<style lang="scss" scoped>

.transcript {
    padding: 10px 20px;
    overflow-y: auto;
    font-size: 24px;
    line-height: 2em;
}

</style>
