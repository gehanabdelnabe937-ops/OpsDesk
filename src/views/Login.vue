<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => {
  if (localStorage.getItem('opsdesk-auth') === 'true') {
    router.replace('/dashboard')
  }
})

async function login() {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Please enter email and password'
    return
  }

  loading.value = true

  await new Promise(resolve => setTimeout(resolve, 500))

  localStorage.setItem('opsdesk-auth', 'true')

  loading.value = false

  router.push('/dashboard')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-100 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-slate-800">
          OpsDesk
        </h1>

        <p class="mt-2 text-slate-500">
          Operations Management
        </p>
      </div>

      <form @submit.prevent="login" class="space-y-5">

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>

          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <p
          v-if="error"
          class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

      </form>
    </div>
  </div>
</template>