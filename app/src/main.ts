/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

import Vue from "vue";
import router from "@/router";
import App from "@/App.vue";

Vue.config.productionTip = false;

new Vue({
    router,
    render: h => h(App),
}).$mount("#app");
