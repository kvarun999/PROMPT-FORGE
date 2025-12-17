<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import axios from "axios";

interface PromptVersion {
  id: string;
  versionNumber: number;
  template: string;
  model: string;
  createdAt: string;
}

interface PromptHistory {
  id: string;
  name: string;
  versions: PromptVersion[];
}

const route = useRoute();
const projectId = route.params.projectId as string;

// State
const history = ref<PromptHistory[]>([]);
const currentPromptId = ref<string | null>(null); // Track which prompt we are editing
const code = ref("Write a product description for {{product}}...");
const selectedModel = ref("llama-3.3-70b-versatile"); // Default
const output = ref("");
const loading = ref(false);
const saving = ref(false);
const notification = ref("");
const activeTab = ref<"editor" | "batch">("editor"); // Switch between modes
const batchResults = ref<any[]>([]);
const isBatchRunning = ref(false);

// Available Models (Groq)
const models = [
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Fast)" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  { value: "gemma-7b-it", label: "Gemma 7B" },
];

// Load History
const refreshHistory = async () => {
  if (!projectId) return;
  try {
    const response = await axios.get(
      `http://localhost:3000/prompts/project/${projectId}`
    );
    history.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

onMounted(async () => {
  await refreshHistory();
  // Load latest if exists
  if (history.value.length > 0) {
    selectPrompt(history.value[0]);
  }
});

const selectPrompt = (item: PromptHistory) => {
  currentPromptId.value = item.id;
  // Get latest version
  const latest = item.versions[0];
  if (latest) {
    code.value = latest.template;
    selectedModel.value = latest.model || "llama-3.3-70b-versatile";
  }
};

const runPrompt = async () => {
  loading.value = true;
  output.value = "";
  try {
    const response = await axios.post("http://localhost:3000/ai/test", {
      prompt: code.value,
      model: selectedModel.value, // Send selected model
    });
    output.value = response.data.content;
  } catch (error) {
    output.value = "Error: Failed to connect to AI.";
  } finally {
    loading.value = false;
  }
};

const savePrompt = async () => {
  if (!projectId) return alert("No Project ID found!");
  saving.value = true;

  try {
    if (currentPromptId.value) {
      // SCENARIO A: Add Version to EXISTING Prompt
      await axios.post(
        `http://localhost:3000/prompts/${currentPromptId.value}/versions`,
        {
          template: code.value,
          model: selectedModel.value,
          commitMessage: "Updated via Playground",
        }
      );
      showNotification("✅ New Version Saved!");
    } else {
      // SCENARIO B: Create NEW Prompt
      await axios.post("http://localhost:3000/prompts", {
        name: "New Prompt " + new Date().toLocaleTimeString(),
        projectId: projectId,
        template: code.value,
        // We need to update backend DTO to accept model for creation too,
        // but for now create logic defaults it. Ideally update DTO.
      });
      showNotification("✅ New Prompt Created!");
    }

    await refreshHistory();
  } catch (error) {
    console.error(error);
    showNotification("❌ Failed to save");
  } finally {
    saving.value = false;
  }
};

const createNew = () => {
  currentPromptId.value = null;
  code.value = "";
  output.value = "";
  showNotification("✨ Ready for new prompt");
};

const showNotification = (msg: string) => {
  notification.value = msg;
  setTimeout(() => (notification.value = ""), 3000);
};

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !projectId) return;

  isBatchRunning.value = true;
  batchResults.value = []; // Clear old results

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      `http://localhost:3000/prompts/${currentPromptId.value}/batch`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    batchResults.value = response.data;
    showNotification("✅ Batch Run Complete!");
  } catch (error) {
    console.error(error);
    showNotification("❌ Batch Failed");
  } finally {
    isBatchRunning.value = false;
  }
};
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-900 text-white">
    <header
      class="h-14 border-b border-gray-700 flex items-center px-4 justify-between bg-gray-800 shrink-0"
    >
      <div class="flex items-center gap-4">
        <router-link to="/" class="text-gray-400 hover:text-white"
          >← Back</router-link
        >
        <div class="font-bold text-lg">PromptForge</div>

        <select
          v-model="selectedModel"
          class="bg-gray-700 text-xs text-white rounded px-2 py-1 border border-gray-600 outline-none focus:border-blue-500"
        >
          <option v-for="m in models" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>
      </div>

      <div class="flex items-center gap-3">
        <span
          v-if="notification"
          class="text-sm text-green-400 font-medium animate-pulse"
          >{{ notification }}</span
        >

        <button
          @click="createNew"
          class="text-gray-400 hover:text-white text-sm mr-2"
        >
          + New
        </button>

        <button
          @click="savePrompt"
          :disabled="saving"
          class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded text-sm font-medium transition"
        >
          {{
            saving
              ? "Saving..."
              : currentPromptId
              ? "Save Version"
              : "Create Prompt"
          }}
        </button>

        <button
          @click="runPrompt"
          :disabled="loading"
          class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-medium transition flex items-center gap-2"
        >
          <span v-if="loading">Running...</span>
          <span v-else>▶ Run</span>
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <div class="w-1/2 border-r border-gray-700 flex">
        <div
          class="w-48 bg-gray-800 border-r border-gray-700 flex flex-col overflow-y-auto"
        >
          <div
            class="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-gray-800"
          >
            Saved Prompts
          </div>
          <div
            v-for="item in history"
            :key="item.id"
            @click="selectPrompt(item)"
            :class="{ 'bg-gray-700': currentPromptId === item.id }"
            class="p-3 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer border-b border-gray-700 transition"
          >
            <div class="truncate font-medium">{{ item.name }}</div>
            <div class="text-xs text-gray-500 flex justify-between mt-1">
              <span>v{{ item.versions.length }}</span>
              <span>{{
                new Date(item.versions[0].createdAt).toLocaleTimeString()
              }}</span>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col">
          <VueMonacoEditor
            v-model:value="code"
            theme="vs-dark"
            language="handlebars"
            :options="{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
            }"
            class="flex-1"
          />
        </div>
      </div>

      <div class="w-1/2 flex flex-col bg-gray-900 border-l border-gray-700">
        <div class="flex border-b border-gray-700 bg-gray-800">
          <button
            @click="activeTab = 'editor'"
            :class="{
              'text-blue-400 border-b-2 border-blue-500':
                activeTab === 'editor',
            }"
            class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
          >
            Single Run
          </button>
          <button
            @click="activeTab = 'batch'"
            :class="{
              'text-blue-400 border-b-2 border-blue-500': activeTab === 'batch',
            }"
            class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
          >
            Batch Testing
          </button>
        </div>

        <div
          v-if="activeTab === 'editor'"
          class="flex-1 flex flex-col overflow-hidden"
        >
          <div
            class="bg-gray-800 text-xs text-gray-400 px-4 py-2 uppercase tracking-wider"
          >
            AI Response
          </div>
          <div
            class="p-4 whitespace-pre-wrap font-mono text-gray-300 text-sm overflow-auto flex-1"
          >
            {{ output }}
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col overflow-hidden p-6">
          <div
            class="mb-6 p-6 border-2 border-dashed border-gray-700 rounded-lg text-center hover:border-blue-500 transition cursor-pointer bg-gray-800"
          >
            <input
              type="file"
              accept=".csv"
              @change="handleFileUpload"
              class="hidden"
              id="csvUpload"
              :disabled="isBatchRunning"
            />
            <label
              for="csvUpload"
              class="cursor-pointer flex flex-col items-center gap-2"
            >
              <span class="text-3xl">📂</span>
              <span class="text-sm font-medium text-gray-300">
                {{
                  isBatchRunning
                    ? "Running Batch..."
                    : "Upload CSV to Run Batch"
                }}
              </span>
              <span class="text-xs text-gray-500"
                >Columns must match variables (e.g., product, audience)</span
              >
            </label>
          </div>

          <div
            v-if="batchResults.length > 0"
            class="flex-1 overflow-auto border border-gray-700 rounded-lg"
          >
            <table class="w-full text-left text-sm text-gray-300">
              <thead
                class="bg-gray-800 text-xs uppercase font-medium text-gray-400 sticky top-0"
              >
                <tr>
                  <th class="px-4 py-3">Inputs</th>
                  <th class="px-4 py-3">AI Output</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                <tr
                  v-for="(res, idx) in batchResults"
                  :key="idx"
                  class="hover:bg-gray-800"
                >
                  <td
                    class="px-4 py-3 font-mono text-xs text-blue-300 align-top w-1/3"
                  >
                    <div v-for="(val, key) in res.inputs" :key="key">
                      <span class="text-gray-500">{{ key }}:</span> {{ val }}
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-pre-wrap">
                    {{ res.output }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
