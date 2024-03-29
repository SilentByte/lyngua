/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

import Vue from "vue";
import router from "@/router";
import store from "@/store";

import vuetify from "@/plugins/vuetify";
import "@/plugins/vue-youtube";

import App from "@/App.vue";

import "@/styles/app.scss";

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App),
}).$mount("#app");
