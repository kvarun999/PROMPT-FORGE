<script setup lang="ts">
import { useAuthStore } from "./stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 font-sans">
    <nav
      v-if="auth.token"
      class="h-14 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900"
    >
      <div class="font-bold text-xl tracking-tight text-blue-400">
        PromptForge
      </div>
      <div class="flex items-center gap-4">
        <router-link to="/" class="hover:text-white transition-colors"
          >Dashboard</router-link
        >
        <button
          @click="handleLogout"
          class="text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded hover:bg-red-500/20"
        >
          Logout
        </button>
      </div>
    </nav>

    <main class="p-6">
      <router-view></router-view>
    </main>
  </div>
</template>
