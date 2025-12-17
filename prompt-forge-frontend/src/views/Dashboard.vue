<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

interface Project {
  id: string;
  name: string;
  description: string;
}

const projects = ref<Project[]>([]);
const loading = ref(true);
const creating = ref(false);

// Fetch Projects
const fetchProjects = async () => {
  loading.value = true;
  try {
    const response = await axios.get("http://localhost:3000/projects");
    projects.value = response.data;
  } catch (error) {
    console.error("Failed to fetch projects", error);
  } finally {
    loading.value = false;
  }
};

// Create New Project
const createProject = async () => {
  creating.value = true;
  try {
    await axios.post("http://localhost:3000/projects", {
      name: "New AI Project " + Math.floor(Math.random() * 100),
      description: "Created from Dashboard",
    });
    // Refresh the list immediately
    await fetchProjects();
  } catch (error) {
    alert("Failed to create project");
  } finally {
    creating.value = false;
  }
};

onMounted(fetchProjects);
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-10">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">PromptForge Projects</h1>

        <div class="flex gap-3">
          <button
            @click="createProject"
            :disabled="creating"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition flex items-center gap-2"
          >
            <span v-if="creating">Creating...</span>
            <span v-else>+ New Project</span>
          </button>

          <router-link
            to="/playground"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow transition"
          >
            Empty Playground
          </router-link>
        </div>
      </div>

      <div v-if="loading" class="text-gray-500">Loading...</div>

      <div
        v-else-if="projects.length === 0"
        class="text-center py-20 bg-white rounded-lg shadow"
      >
        <div class="text-gray-400 mb-4 text-5xl">📂</div>
        <h3 class="text-xl font-medium text-gray-900">No Projects Yet</h3>
        <p class="text-gray-500 mt-2">
          Click the "+ New Project" button to get started.
        </p>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2">
        <div
          v-for="project in projects"
          :key="project.id"
          class="bg-white p-6 rounded-lg shadow hover:shadow-md transition flex flex-col justify-between border-l-4 border-blue-500"
        >
          <div>
            <h2 class="text-xl font-semibold text-gray-900">
              {{ project.name }}
            </h2>
            <p class="text-gray-600 mt-2 text-sm">{{ project.description }}</p>
          </div>

          <div class="mt-6 pt-4 border-t flex justify-between items-center">
            <span class="text-xs text-gray-400 font-mono"
              >ID: {{ project.id.slice(0, 8) }}...</span
            >

            <router-link
              :to="`/playground/${project.id}`"
              class="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Open Project →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
