import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import ProjectView from "../views/ProjectView.vue"; // Import the new view
import Playground from "../views/Playground.vue";
import Login from "../views/Login.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: Login },
    {
      path: "/",
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: "/project/:id",
      component: ProjectView, // ✅ Shows list of prompts
      meta: { requiresAuth: true },
    },
    {
      path: "/prompt/:id",
      component: Playground, // ✅ Edits a specific prompt
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else {
    next();
  }
});

export default router;
