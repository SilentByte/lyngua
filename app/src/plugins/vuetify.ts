/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: "#f4511e",
                secondary: "#424242",
                accent: "#64ffda",
                error: "#ff5252",
                info: "#2196f3",
                success: "#4caf50",
                warning: "#ffc107",
                recording: "#ff5252",
            },
        },
    },
});
