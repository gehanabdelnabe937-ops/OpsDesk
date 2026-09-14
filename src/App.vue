<script setup>
import { ref, onMounted } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const sidebarOpen = ref(false)
const darkMode = ref(false)

function toggleDarkMode() {
  darkMode.value = !darkMode.value

  if (darkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', 'true')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', 'false')
  }
}

onMounted(() => {
  darkMode.value = localStorage.getItem('darkMode') === 'true'

  if (darkMode.value) {
    document.documentElement.classList.add('dark')
  }
})
</script>

<template>
  <div
    class="min-h-screen bg-slate-100 text-slate-800 transition-colors duration-300 dark:bg-slate-950 dark:text-white"
  >

    <!-- Desktop Sidebar -->
    <Sidebar />

    <!-- Mobile Header -->
    <header
      class="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-slate-900 p-4 text-white md:hidden"
    >

      <h1 class="text-xl font-bold">
        OpsDesk
      </h1>

      <div class="flex items-center gap-3">

        <!-- Dark Mode Button -->
        <button
          @click="toggleDarkMode"
          class="relative h-9 w-16 rounded-full bg-slate-700 transition-colors duration-300"
        >
          <span
            class="absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow transition-transform duration-300"
            :class="darkMode ? 'translate-x-7' : 'translate-x-0'"
          >
            {{ darkMode ? '☀️' : '🌙' }}
          </span>
        </button>

        <!-- Menu Button -->
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="rounded-lg bg-slate-800 px-3 py-2 text-xl hover:bg-slate-700"
        >
          ☰
        </button>

      </div>
    </header>

    <!-- Mobile Sidebar -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-50 md:hidden"
    >

      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="sidebarOpen = false"
      ></div>

      <!-- Menu -->
      <aside
        class="relative h-full w-64 bg-slate-900 p-5 text-white"
      >

        <div class="mb-10 flex items-center justify-between">

          <h1 class="text-2xl font-bold">
            OpsDesk
          </h1>

          <button
            @click="sidebarOpen = false"
            class="text-xl text-slate-400 hover:text-white"
          >
            ✕
          </button>

        </div>

        <nav class="space-y-2">

          <RouterLink
            to="/dashboard"
            @click="sidebarOpen = false"
            class="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </RouterLink>

          <RouterLink
            to="/requests"
            @click="sidebarOpen = false"
            class="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Requests
          </RouterLink>

          <RouterLink
            to="/team"
            @click="sidebarOpen = false"
            class="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Team
          </RouterLink>

          <RouterLink
            to="/smart-operations"
            @click="sidebarOpen = false"
            class="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Smart Operations
          </RouterLink>

          <RouterLink
            to="/reports"
            @click="sidebarOpen = false"
            class="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Reports
          </RouterLink>

          <RouterLink
            to="/settings"
            @click="sidebarOpen = false"
            class="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Settings
          </RouterLink></nav>

      </aside>
    </div>

    <!-- Main Content -->
    <main
      class="min-w-0 p-4 pt-20 transition-colors duration-300 sm:p-6 lg:ml-64 lg:p-8 lg:pt-8"
    >

      <!-- Desktop Dark Mode Button -->
      <div class="mb-6 hidden justify-end md:flex">

        <button
          @click="toggleDarkMode"
          class="relative h-10 w-20 rounded-full bg-slate-300 shadow-inner transition-colors duration-300 dark:bg-slate-700"
        >

          <span
            class="absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-md transition-transform duration-300"
            :class="darkMode ? 'translate-x-10' : 'translate-x-0'"
          >
            {{ darkMode ? '☀️' : '🌙' }}
          </span>

        </button>

      </div>

      <RouterView />

    </main>

  </div>
</template>