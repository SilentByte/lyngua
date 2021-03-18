/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

import { SupportedLanguage } from "@/store/app";

export default class LocalStorage {
    private constructor() {
        //
    }

    static get language(): SupportedLanguage {
        return localStorage.getItem("app.language") as SupportedLanguage || "en";
    }

    static set language(code: SupportedLanguage) {
        localStorage.setItem("app.language", code);
    }

    static get fontSize(): number {
        return parseFloat(localStorage.getItem("app.font-size") || "0");
    }

    static set fontSize(size: number) {
        localStorage.setItem("app.font-size", size.toString());
    }

    static get hasRecordingPermission(): boolean {
        return localStorage.getItem("app.has-recording-permission") === "true";
    }

    static set hasRecordingPermission(state: boolean) {
        localStorage.setItem("app.has-recording-permission", state ? "true" : "false");
    }
}
