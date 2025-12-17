import { createApp } from "vue";
import { install as VueMonacoEditorPlugin } from "@guolao/vue-monaco-editor";
import "./style.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Re-enable Monaco, but use 'unpkg' instead of the default
app.use(VueMonacoEditorPlugin, {
  paths: {
    vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs",
  },
});

app.use(router);
app.mount("#app");
