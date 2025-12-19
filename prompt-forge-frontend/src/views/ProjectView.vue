<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../lib/axios";

const route = useRoute();
const router = useRouter();
const projectId = route.params.id as string;

const project = ref<any>(null);
const prompts = ref<any[]>([]);
const showModal = ref(false);
const newPromptName = ref("");
const isLoading = ref(true);

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  try {
    isLoading.value = true;
    // 1. Fetch Project Details
    const projReq = await api.get(`/projects/${projectId}`);
    project.value = projReq.data;

    // 2. Fetch Prompts for this Project
    const promptsReq = await api.get(`/prompts/project/${projectId}`);
    prompts.value = promptsReq.data;
  } catch (e) {
    console.error("Failed to load project data", e);
  } finally {
    isLoading.value = false;
  }
}

async function createPrompt() {
  if (!newPromptName.value.trim()) return;

  try {
    const { data } = await api.post("/prompts", {
      name: newPromptName.value,
      projectId: projectId,
      template: "Write a {{type}} about {{topic}}...", // Default template
    });

    // Add to list and close modal
    prompts.value.push(data);
    showModal.value = false;
    newPromptName.value = "";

    // Navigate immediately to the Playground
    router.push(`/prompt/${data.id}`);
  } catch (e) {
    console.error(e);
    alert("Failed to create prompt.");
  }
}

function openPrompt(promptId: string) {
  router.push(`/prompt/${promptId}`);
}
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex justify-between items-center bg-slate-900 p-6 rounded-lg border border-slate-800"
    >
      <div>
        <h1 class="text-2xl font-bold text-white mb-1">
          {{ project?.name || "Loading..." }}
        </h1>
        <p class="text-slate-400 text-sm">{{ project?.description }}</p>
      </div>
      <button
        @click="showModal = true"
        class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold transition-all"
      >
        + New Prompt
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10 text-slate-500">
      Loading prompts...
    </div>

    <div
      v-else-if="prompts.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="prompt in prompts"
        :key="prompt.id"
        @click="openPrompt(prompt.id)"
        class="bg-slate-800 border border-slate-700 p-5 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-slate-800/80 transition-all group"
      >
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-blue-100 group-hover:text-blue-400">
            {{ prompt.name }}
          </h3>
          <span
            class="text-xs bg-slate-900 text-slate-500 px-2 py-1 rounded border border-slate-700"
          >
            v{{ prompt.versions?.length || 0 }}
          </span>
        </div>
        <div class="text-xs text-slate-500 font-mono mt-2">
          Last updated: {{ new Date(prompt.updatedAt).toLocaleDateString() }}
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-16 bg-slate-900 rounded-lg border border-slate-800 border-dashed"
    >
      <h3 class="text-lg text-slate-400 font-medium mb-2">No prompts yet</h3>
      <button
        @click="showModal = true"
        class="text-blue-400 hover:text-blue-300"
      >
        Create your first prompt
      </button>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-sm shadow-2xl"
      >
        <h2 class="text-xl font-bold text-white mb-4">Create Prompt</h2>
        <input
          v-model="newPromptName"
          placeholder="e.g., Customer Support Bot"
          class="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:border-blue-500 outline-none mb-6"
          @keyup.enter="createPrompt"
        />
        <div class="flex justify-end gap-3">
          <button
            @click="showModal = false"
            class="text-slate-400 hover:text-white px-3 py-2"
          >
            Cancel
          </button>
          <button
            @click="createPrompt"
            class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
