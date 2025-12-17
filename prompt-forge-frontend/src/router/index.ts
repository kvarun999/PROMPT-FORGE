import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Dashboard",
      component: Dashboard,
    },
    {
      path: "/playground/:projectId?", // ? means projectId is optional
      name: "Playground",
      // Lazy load the component (we will create this file in the next step)
      component: () => import("../views/Playground.vue"),
    },
  ],
});

export default router;
