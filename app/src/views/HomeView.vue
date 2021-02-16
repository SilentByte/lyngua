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
                        class="slim-scrollbar transcript"
                        :style="{ fontSize: `${24 * app.fontSize}px` }"
                        :height="transcriptHeight">
                    <span v-for="(w, i) in words" :key="i">{{ w }} </span>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">

import {
    Component,
    Ref,
    Vue,
} from "vue-property-decorator";

import rangy from "rangy";

import { getModule } from "vuex-module-decorators";
import { AppModule } from "@/store/app";

@Component
export default class HomeView extends Vue {
    private readonly app = getModule(AppModule);

    @Ref("transcript") private readonly transcriptRef!: HTMLElement;

    private playerHeight = 400;
    private controlsHeight = 400;
    private transcriptHeight = 400;

    private words = `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean aliquet maximus leo luctus pharetra.
        Nullam id tincidunt metus, nec luctus dolor. Nulla ut dui ut enim tempor eleifend. Morbi diam nibh,
        ornare ut tellus in, venenatis accumsan ligula. Donec maximus, libero faucibus porta pellentesque,
        nisi orci tincidunt quam, eu gravida leo justo at lectus. Nullam vel euismod lacus, quis blandit
        lectus. Morbi tincidunt laoreet sodales. Duis magna erat, sollicitudin non elementum vitae,
        sollicitudin in neque.

        Nulla rhoncus ex ut sollicitudin iaculis. Sed nulla risus, convallis a tellus dictum, fringilla
        lobortis justo. Morbi vehicula sit amet risus sit amet porta. Mauris et gravida velit. Integer
        tristique enim ut erat blandit, non pharetra dui scelerisque. Suspendisse purus purus, ultrices
        vitae orci a, ultricies convallis nulla. Integer a erat eget purus pretium tincidunt et non mi.
        Curabitur sit amet nulla a lacus pellentesque fringilla in at felis. Aenean augue diam, fringilla
        sollicitudin magna nec, viverra euismod libero. Maecenas efficitur lorem ut mi commodo mollis.
        Pellentesque nec odio non lectus facilisis feugiat.

        Duis dui nunc, mollis id ante et, ornare tempus metus. Aliquam varius orci et urna iaculis, sed
        aliquet sem varius. Curabitur sollicitudin pulvinar arcu, sit amet posuere nisi suscipit in. Aenean
        ut tristique risus. Sed ligula erat, tincidunt nec fringilla sed, tempor vel erat. Duis a nibh a
        nulla gravida pharetra ac in ipsum. Curabitur vel odio suscipit, volutpat quam in, rutrum massa. In
        eget metus eget lorem euismod fermentum. Aenean venenatis viverra dapibus. Maecenas molestie tortor
        eu est blandit, non ultricies nunc ultrices. Aliquam eu odio vel ante consequat sodales.`.split(/\s+/);

    private onResize() {
        const height = window.innerHeight - 90;
        this.playerHeight = 400;
        this.controlsHeight = height - this.playerHeight - 8;
        this.transcriptHeight = height;
    }

    // TODO: Cross-reference with timestamps, implement IWord interface.
    mounted(): void {
        document.addEventListener("selectionchange", e => {
            const nodes = rangy
                .getSelection()
                .getRangeAt(0)
                .getNodes()
                .filter(n => n.parentElement === (this.transcriptRef as any).$el);

            console.log(nodes);
        });
    }
}

</script>

<style lang="scss" scoped>

.youtube-iframe {
    border: none;
}

.transcript {
    padding: 10px 20px;
    overflow-y: scroll;
    font-size: 24px;
    line-height: 2em;
}

</style>
