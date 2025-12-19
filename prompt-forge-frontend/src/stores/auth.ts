import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../lib/axios";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token") || "");
  const user = ref(null);
  const router = useRouter();

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  async function login(email: string, pass: string) {
    try {
      const { data } = await api.post("/auth/login", { email, password: pass });
      setToken(data.access_token);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async function register(email: string, pass: string) {
    try {
      await api.post("/auth/register", { email, password: pass });
      return await login(email, pass); // Auto login after register
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function logout() {
    token.value = "";
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return { token, user, login, register, logout };
});
