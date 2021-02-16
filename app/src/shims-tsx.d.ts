/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

import Vue, { VNode } from "vue";

declare global {
    namespace JSX {
        // tslint:disable no-empty-interface
        interface Element extends VNode {
            //
        }

        // tslint:disable no-empty-interface
        interface ElementClass extends Vue {
            //
        }

        interface IntrinsicElements {
            [elem: string]: any;
        }
    }
}
