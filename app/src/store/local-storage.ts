/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

export default class LocalStorage {
    private constructor() {
        //
    }

    static get fontSize(): number {
        return parseFloat(localStorage.getItem("app.font-size") || "0");
    }

    static set fontSize(size: number) {
        localStorage.setItem("app.font-size", size.toString());
    }
}
