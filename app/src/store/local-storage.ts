/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

import { SupportedLanguage } from "@/store/app";

export default class LocalStorage {
    private constructor() {
        //
    }

    static get sourceLanguage(): SupportedLanguage {
        return localStorage.getItem("app.source-language") as SupportedLanguage || "en";
    }

    static set sourceLanguage(code: SupportedLanguage) {
        localStorage.setItem("app.source-language", code);
    }

    static get targetLanguage(): SupportedLanguage {
        return localStorage.getItem("app.target-language") as SupportedLanguage || "de";
    }

    static set targetLanguage(code: SupportedLanguage) {
        localStorage.setItem("app.target-language", code);
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
