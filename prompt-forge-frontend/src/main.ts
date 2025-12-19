import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { install as VueMonacoEditorPlugin } from "@guolao/vue-monaco-editor";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

// Configure Monaco Editor to load from CDN (Faster/Easier setup)
app.use(VueMonacoEditorPlugin, {
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs",
  },
});

app.mount("#app");
