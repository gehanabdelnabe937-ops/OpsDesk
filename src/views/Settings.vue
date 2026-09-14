<script setup>
import { ref, onMounted } from 'vue'

const companyName = ref('')
const emailNotifications = ref(true)
const requestNotifications = ref(true)
const autoAssignment = ref(false)

const saved = ref(false)

onMounted(() => {
  const savedSettings = localStorage.getItem('opsdesk-settings')

  if (savedSettings) {
    const settings = JSON.parse(savedSettings)

    companyName.value = settings.companyName
    emailNotifications.value = settings.emailNotifications
    requestNotifications.value = settings.requestNotifications
    autoAssignment.value = settings.autoAssignment
  } else {
    companyName.value = 'OpsDesk Company'
  }
})

function saveSettings() {
  const settings = {
    companyName: companyName.value,
    emailNotifications: emailNotifications.value,
    requestNotifications: requestNotifications.value,
    autoAssignment: autoAssignment.value
  }

  localStorage.setItem(
    'opsdesk-settings',
    JSON.stringify(settings)
  )

  saved.value = true

  setTimeout(() => {
    saved.value = false
  }, 2000)
}
</script>

<template>
  <div class="p-6">

    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800">
        Settings
      </h1>

      <p class="mt-1 text-slate-500">
        Manage your company and system preferences
      </p>
    </div>

    <div class="max-w-3xl space-y-6">

      <!-- Company -->
      <div class="rounded-xl bg-white p-6 shadow-sm">

        <h2 class="text-lg font-semibold text-slate-800">
          Company Settings
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Basic information about your company
        </p>

        <div class="mt-5">

          <label class="mb-2 block text-sm font-medium text-slate-700">
            Company Name
          </label>

          <input
            v-model="companyName"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Enter company name"
          />

        </div>

      </div>

      <!-- Notifications -->
      <div class="rounded-xl bg-white p-6 shadow-sm">

        <h2 class="text-lg font-semibold text-slate-800">
          Notifications
        </h2>

        <div class="mt-5 space-y-5">

          <label class="flex cursor-pointer items-center justify-between">

            <div>
              <p class="font-medium text-slate-800">
                Email Notifications
              </p>

              <p class="text-sm text-slate-500">
                Receive important updates by email
              </p>
            </div>

            <input
              v-model="emailNotifications"
              type="checkbox"
              class="h-5 w-5"
            />

          </label>

          <label class="flex cursor-pointer items-center justify-between">

            <div>
              <p class="font-medium text-slate-800">
                Request Notifications
              </p>

              <p class="text-sm text-slate-500">
                Receive notifications when requests change
              </p>
            </div>

            <input
              v-model="requestNotifications"
              type="checkbox"
              class="h-5 w-5"
            />

          </label>

        </div>

      </div>

      <!-- Automation -->
      <div class="rounded-xl bg-white p-6 shadow-sm">

        <h2 class="text-lg font-semibold text-slate-800">
          Automation
        </h2>

        <label class="mt-5 flex cursor-pointer items-center justify-between">

          <div>
            <p class="font-medium text-slate-800">
              Auto Assignment
            </p>

            <p class="text-sm text-slate-500">
              Automatically assign new requests to team members
            </p>
          </div>

          <input
            v-model="autoAssignment"
            type="checkbox"
            class="h-5 w-5"
          />

        </label>

      </div>

      <!-- Save -->
      <div class="flex items-center gap-4">

        <button
          @click="saveSettings"
          class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Save Settings
        </button>

        <p
          v-if="saved"
          class="font-medium text-green-600"
        >
          Settings saved successfully ✓
        </p>

      </div>

    </div>

  </div>
</template>