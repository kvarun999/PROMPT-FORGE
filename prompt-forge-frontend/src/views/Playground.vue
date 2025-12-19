<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import api from "../lib/axios"; // ✅ Uses secure API client

const route = useRoute();
const promptId = route.params.id as string;

// --- State ---
const activeTab = ref<"compare" | "batch">("compare");
const isLoading = ref(false);

// Prompt Data
const template = ref("Explain {{topic}} to a {{audience}}");
const variables = ref<{ [key: string]: string }>({});

// --- MODEL CONFIGURATION ---
const modelA = ref("llama-3.3-70b-versatile"); // Groq
const modelB = ref("gemini-2.5-flash"); // Gemini
const providerA = ref("groq");
const providerB = ref("gemini");

const resultA = ref<any>(null);
const resultB = ref<any>(null);

// Batch State
const batchFile = ref<File | null>(null);
const batchResults = ref<any[]>([]);

// --- Computed: Live Preview ---
const compiledPrompt = computed(() => {
  let output = template.value;
  for (const [key, val] of Object.entries(variables.value)) {
    output = output.replace(new RegExp(`{{${key}}}`, "g"), val || `{{${key}}}`);
  }
  return output;
});

// --- Lifecycle ---
onMounted(async () => {
  if (promptId) {
    try {
      const { data } = await api.get(`/prompts/${promptId}`);
      if (data.versions && data.versions.length > 0) {
        const latest = data.versions[data.versions.length - 1];
        template.value = latest.template;
        extractVariables();
      }
    } catch (e) {
      console.error("Failed to load prompt", e);
    }
  }
  extractVariables();
});

// --- Helpers ---
function extractVariables() {
  const regex = /{{([^}]+)}}/g;
  let match;
  const newVars: any = {};
  while ((match = regex.exec(template.value)) !== null) {
    const varName = match[1].trim();
    newVars[varName] = variables.value[varName] || "";
  }
  variables.value = newVars;
}

// --- Actions: Comparison ---
async function runCompare() {
  isLoading.value = true;
  resultA.value = null;
  resultB.value = null;

  const promptText = compiledPrompt.value;

  try {
    const [resA, resB] = await Promise.allSettled([
      api.post("/ai/generate", {
        prompt: promptText,
        model: modelA.value,
        provider: providerA.value,
      }),
      api.post("/ai/generate", {
        prompt: promptText,
        model: modelB.value,
        provider: providerB.value,
      }),
    ]);

    // Handle Result A (Groq)
    if (resA.status === "fulfilled") {
      resultA.value = resA.value.data;
    } else {
      resultA.value = { error: "Failed to generate" };
    }

    // Handle Result B (Gemini)
    if (resB.status === "fulfilled") {
      resultB.value = resB.value.data;
    } else {
      const errorData = resB.reason?.response?.data;
      const msg = errorData?.message || resB.reason?.message || "Unknown error";
      resultB.value = { error: msg };
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}

async function saveVersion() {
  const message = prompt(
    'Enter a commit message (e.g., "v2: Added clearer instructions"):'
  );
  if (!message) return;

  try {
    await api.post(`/prompts/${promptId}/versions`, {
      template: template.value,
      model: modelA.value,
      commitMessage: message,
    });
    alert("Version saved successfully!");
  } catch (e) {
    console.error(e);
    alert("Failed to save version. Please check console.");
  }
}

// --- Actions: Batch Testing ---
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    batchFile.value = target.files[0];
  }
}

async function runBatch() {
  if (!batchFile.value) return alert("Please upload a CSV file first");
  isLoading.value = true;
  const formData = new FormData();
  formData.append("file", batchFile.value);

  try {
    const { data } = await api.post(
      `/prompts/${promptId}/batch-test`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    batchResults.value = data;
  } catch (e) {
    console.error(e);
    alert("Batch run failed. Ensure you have SAVED a version first.");
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden">
    <div
      class="flex-none flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800"
    >
      <div class="flex gap-4">
        <button
          @click="activeTab = 'compare'"
          class="px-4 py-2 text-sm font-semibold rounded transition-colors"
          :class="
            activeTab === 'compare'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          "
        >
          Playground & Compare
        </button>
        <button
          @click="activeTab = 'batch'"
          class="px-4 py-2 text-sm font-semibold rounded transition-colors"
          :class="
            activeTab === 'batch'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          "
        >
          Batch Testing
        </button>
      </div>
      <div class="flex gap-2">
        <button
          @click="saveVersion"
          class="px-4 py-2 border border-slate-600 text-slate-300 rounded hover:bg-slate-800 text-sm"
        >
          Save Version
        </button>
      </div>
    </div>

    <div
      v-if="activeTab === 'compare'"
      class="flex-1 grid grid-cols-12 gap-4 h-full overflow-hidden min-h-0"
    >
      <div class="col-span-4 flex flex-col gap-3 h-full overflow-hidden">
        <div
          class="flex-none bg-slate-900 p-3 rounded border border-slate-800 max-h-[25vh] overflow-y-auto"
        >
          <h3 class="text-xs uppercase font-bold text-slate-500 mb-2">
            1. Variables
          </h3>
          <div
            v-if="Object.keys(variables).length === 0"
            class="text-slate-600 text-sm italic"
          >
            Add {{ variables }} in template.
          </div>
          <div v-for="(val, name) in variables" :key="name" class="mb-2">
            <label class="block text-[10px] text-blue-400 mb-1">{{
              name
            }}</label>
            <input
              v-model="variables[name]"
              class="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none text-slate-200"
            />
          </div>
        </div>

        <div
          class="flex-1 flex flex-col bg-slate-900 rounded border border-slate-800 min-h-[300px] overflow-hidden"
        >
          <div
            class="flex-none bg-slate-800 px-3 py-1 text-xs font-bold text-slate-400 border-b border-slate-700"
          >
            2. TEMPLATE (Handlebars)
          </div>
          <div class="flex-1 relative w-full h-full">
            <VueMonacoEditor
              v-model:value="template"
              theme="vs-dark"
              language="handlebars"
              :options="{
                minimap: { enabled: false },
                fontSize: 13,
                automaticLayout: true,
                padding: { top: 10 },
              }"
              @change="extractVariables"
              class="absolute inset-0 w-full h-full"
            />
          </div>
        </div>

        <div
          class="flex-none bg-slate-900 rounded border border-slate-800 flex flex-col h-[100px]"
        >
          <div
            class="bg-slate-800 px-3 py-1 text-xs font-bold text-green-400 border-b border-slate-700"
          >
            3. PREVIEW
          </div>
          <div
            class="p-2 text-xs font-mono text-slate-300 overflow-auto whitespace-pre-wrap h-full"
          >
            {{ compiledPrompt }}
          </div>
        </div>

        <button
          @click="runCompare"
          :disabled="isLoading"
          class="flex-none w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white transition-all disabled:opacity-50"
        >
          {{ isLoading ? "Running..." : "Run Comparison" }}
        </button>
      </div>

      <div class="col-span-8 grid grid-cols-2 gap-4 h-full overflow-hidden">
        <div
          class="flex flex-col bg-slate-900 rounded border border-slate-800 h-full overflow-hidden"
        >
          <div
            class="flex-none p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800"
          >
            <span class="font-bold text-slate-300 text-sm">Model A (Groq)</span>
            <select
              v-model="modelA"
              class="bg-slate-900 border border-slate-600 rounded text-xs px-2 py-1 text-slate-300 max-w-[180px]"
            >
              <option value="llama-3.3-70b-versatile">
                llama-3.3-70b-versatile
              </option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
            </select>
          </div>
          <div
            class="flex-1 p-4 overflow-auto font-mono text-sm whitespace-pre-wrap text-slate-300"
          >
            <span v-if="resultA?.error" class="text-red-400">{{
              resultA.error
            }}</span>
            <span v-else>{{ resultA?.output || "Waiting..." }}</span>
          </div>
          <div
            v-if="resultA && !resultA.error"
            class="flex-none bg-slate-950 p-2 grid grid-cols-3 gap-2 text-center border-t border-slate-800"
          >
            <div>
              <div class="text-[10px] text-slate-500">LATENCY</div>
              <div class="text-green-400 text-xs">
                {{ resultA.latencyMs }}ms
              </div>
            </div>
            <div>
              <div class="text-[10px] text-slate-500">TOKENS</div>
              <div class="text-blue-400 text-xs">{{ resultA.tokenUsage }}</div>
            </div>
            <div>
              <div class="text-[10px] text-slate-500">COST</div>
              <div class="text-yellow-400 text-xs">${{ resultA.cost }}</div>
            </div>
          </div>
        </div>

        <div
          class="flex flex-col bg-slate-900 rounded border border-slate-800 h-full overflow-hidden"
        >
          <div
            class="flex-none p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800"
          >
            <span class="font-bold text-slate-300 text-sm"
              >Model B (Gemini)</span
            >
            <select
              v-model="modelB"
              @change="providerB = 'gemini'"
              class="bg-slate-900 border border-slate-600 rounded text-xs px-2 py-1 text-slate-300 max-w-[180px]"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            </select>
          </div>
          <div
            class="flex-1 p-4 overflow-auto font-mono text-sm whitespace-pre-wrap text-slate-300"
          >
            <span v-if="resultB?.error" class="text-red-400">{{
              resultB.error
            }}</span>
            <span v-else>{{ resultB?.output || "Waiting..." }}</span>
          </div>
          <div
            v-if="resultB && !resultB.error"
            class="flex-none bg-slate-950 p-2 grid grid-cols-3 gap-2 text-center border-t border-slate-800"
          >
            <div>
              <div class="text-[10px] text-slate-500">LATENCY</div>
              <div class="text-green-400 text-xs">
                {{ resultB.latencyMs }}ms
              </div>
            </div>
            <div>
              <div class="text-[10px] text-slate-500">TOKENS</div>
              <div class="text-blue-400 text-xs">N/A</div>
            </div>
            <div>
              <div class="text-[10px] text-slate-500">COST</div>
              <div class="text-yellow-400 text-xs">Free</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="activeTab === 'batch'"
      class="flex-1 flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full overflow-auto"
    >
      <div class="bg-blue-950/30 border border-blue-900 p-4 rounded-lg">
        <div class="flex items-start gap-4">
          <div class="p-2 bg-blue-900 rounded text-blue-200">ℹ️</div>
          <div>
            <h3 class="text-blue-400 font-bold text-sm uppercase mb-1">
              Batch Context
            </h3>
            <p class="text-slate-400 text-xs mb-3">
              The batch test runs against your <strong>SAVED</strong> prompt
              version. Ensure your CSV columns match the variables below.
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-[10px] text-slate-500 uppercase font-bold">
                  Current Template
                </div>
                <code
                  class="block bg-slate-900 border border-slate-800 p-2 rounded text-xs text-slate-300 font-mono mt-1 whitespace-pre-wrap"
                  >{{ template }}</code
                >
              </div>
              <div>
                <div class="text-[10px] text-slate-500 uppercase font-bold">
                  Required CSV Columns
                </div>
                <div class="flex gap-2 mt-1 flex-wrap">
                  <span
                    v-for="(val, name) in variables"
                    :key="name"
                    class="px-2 py-1 bg-purple-900/50 border border-purple-700 text-purple-200 text-xs rounded font-mono"
                  >
                    {{ name }}
                  </span>
                  <span
                    v-if="Object.keys(variables).length === 0"
                    class="text-slate-500 text-xs italic"
                    >No variables detected</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-slate-900 p-6 rounded-lg border border-slate-800 text-center"
      >
        <h2 class="text-xl font-bold text-slate-200 mb-2">
          Upload Test Dataset
        </h2>
        <div class="flex justify-center gap-4 mt-4">
          <input
            type="file"
            accept=".csv"
            @change="handleFileUpload"
            class="text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-600 file:text-white cursor-pointer"
          />
          <button
            @click="runBatch"
            :disabled="!batchFile || isLoading"
            class="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold disabled:opacity-50 transition-all"
          >
            {{ isLoading ? "Processing Batch..." : "Run Batch" }}
          </button>
        </div>
      </div>

      <div
        v-if="batchResults.length > 0"
        class="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden"
      >
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-800 text-xs uppercase text-slate-400">
            <tr>
              <th class="px-6 py-3">Inputs</th>
              <th class="px-6 py-3">Output</th>
              <th class="px-6 py-3 text-right">Quality & Metrics</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr
              v-for="(res, idx) in batchResults"
              :key="idx"
              class="hover:bg-slate-800/50"
            >
              <td class="px-6 py-4 w-1/3 align-top">
                <div v-for="(val, key) in res.inputs" :key="key">
                  <span class="text-slate-500 text-xs">{{ key }}:</span>
                  {{ val }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-pre-wrap font-mono text-xs">
                {{ res.output }}
              </td>
              <td class="px-6 py-4 text-right align-top">
                <div class="flex flex-col items-end gap-1">
                  <span
                    v-if="res.qualityScore === 1"
                    class="px-2 py-0.5 rounded bg-green-900/30 text-green-400 text-[10px] border border-green-800"
                  >
                    ✅ Valid JSON
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] border border-slate-700"
                  >
                    📄 Text / Invalid
                  </span>
                  <div class="text-slate-400 text-xs mt-1">
                    {{ res.latencyMs }}ms
                  </div>
                  <div class="text-yellow-600 text-xs">${{ res.cost }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
