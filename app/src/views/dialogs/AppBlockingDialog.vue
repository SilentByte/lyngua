<!--
    LYNGUA LANGUAGE LEARNING EXPERIENCE
    Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
-->

<template>
    <v-dialog persistent
              overlay-color="#F00"
              content-class="elevation-0"
              style="z-index: 99999"
              :value="app.isAppBlocked||1">
        <v-card color="transparent"
                class="elevation-0">
            <v-layout fill-height
                      class="ma-5 pa-5 justify-center align-center">
                <v-progress-circular indeterminate
                                     class="pa-4"
                                     size="60"
                                     width="5"
                                     color="white" />
            </v-layout>
        </v-card>
    </v-dialog>
</template>

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
}

</script>
