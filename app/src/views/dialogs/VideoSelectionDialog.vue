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
              :value="visible || true"
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
                        <v-col cols="12">
                            <v-text-field dense outlined hide-details
                                          placeholder="https://www.youtube.com/watch?v=…" />
                        </v-col>
                        <v-col cols="12">
                            <div class="text-body-1">
                                &hellip;or select one of these suggestions:
                            </div>
                        </v-col>
                    </v-row>
                </v-container>

                <v-card-actions class="px-1 pt-4">
                    <v-spacer />

                    <v-btn depressed dark
                           color="primary"
                           class="mx-2"
                           :loading="pending"
                           @click="onStart">
                        Start Practicing
                    </v-btn>

                    <v-btn depressed
                           class="mx-2"
                           :disabled="pending"
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
import { AppModule } from "@/store/app";

@Component
export default class VideoSelectionDialog extends Vue {
    private readonly app = getModule(AppModule);

    private visible = false;
    private pending = false;

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

    show(): void {
        this.visible = true;
    }

    private async onStart() {
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
