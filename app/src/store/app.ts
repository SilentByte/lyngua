/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

import {
    VuexModule,
    Module,
    Mutation,
    config as VuexModuleDecoratorsConfig,
} from "vuex-module-decorators";

import store from "@/store";
import LocalStorage from "@/store/local-storage";

VuexModuleDecoratorsConfig.rawError = true;

const FONT_SIZE_STEP = 0.05;
const FONT_SIZE_MAX = 1.5;
const FONT_SIZE_MIN = 0.5;

@Module({
    store,
    dynamic: true,
    namespaced: true,
    name: "app",
})
export class AppModule extends VuexModule {
    fontSize = LocalStorage.fontSize || 1.0;

    get canDecreaseFontSize(): boolean {
        return this.fontSize > FONT_SIZE_MIN;
    }

    get canIncreaseFontSize(): boolean {
        return this.fontSize < FONT_SIZE_MAX;
    }

    @Mutation
    increaseFontSize(): void {
        this.fontSize = Math.min(this.fontSize + FONT_SIZE_STEP, FONT_SIZE_MAX);
        LocalStorage.fontSize = this.fontSize;
    }

    @Mutation
    decreaseFontSize(): void {
        this.fontSize = Math.max(this.fontSize - FONT_SIZE_STEP, FONT_SIZE_MIN);
        LocalStorage.fontSize = this.fontSize;
    }
}
