<script setup lang="ts">
import { ref, onMounted } from "vue";
// FIX: Import the configured 'api' instance, NOT the default 'axios'
import api from "../lib/axios";
import { useRouter } from "vue-router";

interface Project {
  id: string;
  name: string;
  description: string;
  prompts: any[];
  createdAt: string;
}

const projects = ref<Project[]>([]);
const router = useRouter();
const showNewProjectModal = ref(false);
const newProjectName = ref("");
const newProjectDesc = ref("");

onMounted(async () => {
  fetchProjects();
});

async function fetchProjects() {
  try {
    // FIX: Use 'api.get' instead of 'axios.get'
    const { data } = await api.get("/projects");
    projects.value = data;
  } catch (error) {
    console.error("Failed to fetch projects", error);
  }
}

async function createProject() {
  try {
    // FIX: Use 'api.post' instead of 'axios.post'
    const { data } = await api.post("/projects", {
      name: newProjectName.value,
      description: newProjectDesc.value,
    });
    projects.value.push(data);
    showNewProjectModal.value = false;
    newProjectName.value = "";
    newProjectDesc.value = "";
  } catch (error) {
    console.error("Failed to create project", error);
  }
}

function navigateToProject(id: string) {
  router.push(`/project/${id}`);
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-slate-100">My Projects</h1>
      <button
        @click="showNewProjectModal = true"
        class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-semibold transition-colors"
      >
        + New Project
      </button>
    </div>

    <div
      v-if="projects.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="project in projects"
        :key="project.id"
        @click="navigateToProject(project.id)"
        class="bg-slate-800 border border-slate-700 p-6 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-slate-800/80 transition-all group"
      >
        <h3
          class="text-xl font-bold text-blue-400 mb-2 group-hover:text-blue-300"
        >
          {{ project.name }}
        </h3>
        <p class="text-slate-400 text-sm mb-4 line-clamp-2">
          {{ project.description || "No description provided." }}
        </p>
        <div class="text-xs text-slate-600">
          Created: {{ new Date(project.createdAt).toLocaleDateString() }}
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-20 bg-slate-900 rounded-lg border border-slate-800 border-dashed"
    >
      <h3 class="text-xl text-slate-500 font-semibold mb-2">No projects yet</h3>
      <p class="text-slate-600 mb-6">
        Create your first prompt engineering project to get started.
      </p>
      <button
        @click="showNewProjectModal = true"
        class="text-blue-400 hover:text-blue-300 font-semibold"
      >
        Create Project
      </button>
    </div>

    <div
      v-if="showNewProjectModal"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-slate-800 p-6 rounded-lg w-full max-w-md border border-slate-700 shadow-2xl"
      >
        <h2 class="text-xl font-bold text-slate-100 mb-4">
          Create New Project
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm text-slate-400 mb-1"
              >Project Name</label
            >
            <input
              v-model="newProjectName"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:border-blue-500 outline-none"
              placeholder="e.g. Email Generator"
            />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              v-model="newProjectDesc"
              class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:border-blue-500 outline-none"
              placeholder="What is this project for?"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showNewProjectModal = false"
            class="px-4 py-2 text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            @click="createProject"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
