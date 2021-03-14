<!--
    LYNGUA LANGUAGE LEARNING EXPERIENCE
    Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
-->

<template>
    <v-dialog persistent
              overlay-opacity="0.8"
              content-class="elevation-0"
              style="z-index: 99999"
              :value="app.isAppBlocked">
        <v-card color="transparent"
                class="elevation-0">
            <v-layout fill-height column
                      class="ma-5 pa-5 justify-center align-center">
                <v-progress-circular indeterminate
                                     class="pa-4"
                                     size="60"
                                     width="5"
                                     color="white" />

                <v-chip class="mt-8">
                    {{ messages[messageIndex] }}
                </v-chip>
            </v-layout>
        </v-card>
    </v-dialog>
</template>

<!--suppress JSUnusedGlobalSymbols -->
<script lang="ts">

import {
    Component,
    Vue,
} from "vue-property-decorator";

import { getModule } from "vuex-module-decorators";
import { AppModule } from "@/store/app";

@Component
export default class AppBlockingDialog extends Vue {
    private readonly app = getModule(AppModule);

    private nativeInterval = 0;

    private messageIndex = 0;
    private messages = [
        "Crunching some numbers…",
        "Performing voice recognition…",
        "Hiring a professional translator…",
        "Improving your learning experience…",
    ];

    mounted(): void {
        this.nativeInterval = setInterval(
            () => this.messageIndex = Math.floor(Math.random() * this.messages.length),
            4000,
        ) as unknown as number;
    }

    beforeDestroy(): void {
        clearInterval(this.nativeInterval);
    }
}

</script>
