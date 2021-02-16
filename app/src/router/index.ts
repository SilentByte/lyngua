/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import Home from "@/views/HomeView.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/about",
        name: "About",
        component: () => import(/* webpackChunkName: "about" */ "@/views/AboutView.vue"),
    },
];

const router = new VueRouter({
    routes,
});

export default router;
