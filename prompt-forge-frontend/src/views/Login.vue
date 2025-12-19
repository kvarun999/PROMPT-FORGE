<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const isRegister = ref(false);
const email = ref("");
const password = ref("");
const error = ref("");

async function handleSubmit() {
  error.value = "";
  let success = false;

  if (isRegister.value) {
    success = await auth.register(email.value, password.value);
  } else {
    success = await auth.login(email.value, password.value);
  }

  if (success) {
    router.push("/");
  } else {
    error.value = "Authentication failed. Please check your credentials.";
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100"
  >
    <div
      class="w-full max-w-md p-8 bg-slate-800 rounded-lg shadow-xl border border-slate-700"
    >
      <h1 class="text-3xl font-bold mb-6 text-center text-blue-400">
        PromptForge
      </h1>

      <div class="flex mb-6 border-b border-slate-700">
        <button
          @click="isRegister = false"
          class="flex-1 pb-2 text-center transition-colors"
          :class="
            !isRegister
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400'
          "
        >
          Login
        </button>
        <button
          @click="isRegister = true"
          class="flex-1 pb-2 text-center transition-colors"
          :class="
            isRegister
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400'
          "
        >
          Register
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block mb-1 text-sm text-slate-400">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm text-slate-400">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div v-if="error" class="text-red-400 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition-colors"
        >
          {{ isRegister ? "Create Account" : "Sign In" }}
        </button>
      </form>
    </div>
  </div>
</template>
