<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRequestStore } from '../stores/requestStore'

const router = useRouter()
const requestStore = useRequestStore()

const team = ref([])
const loading = ref(true)
const error = ref('')
const selectedEmployee = ref(null)

async function getTeam() {
  try {
    const response = await axios.get(
      'https://dummyjson.com/users'
    )

    team.value = response.data.users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.company?.title || 'Employee',
      department: user.company?.department || 'Operations',
      image: user.image
    }))
  } catch (err) {
    error.value = 'Failed to load team'
  } finally {
    loading.value = false
  }
}

function getEmployeeRequests(employee) {
  return requestStore.requests.filter(
    request => request.assignee === employee.name
  )
}

function getEmployeeStats(employee) {
  const requests = getEmployeeRequests(employee)

  const completed = requests.filter(
    request => request.status === 'Resolved'
  ).length

  const active = requests.filter(
    request => request.status !== 'Resolved'
  ).length

  const overdue = requests.filter(
    request =>
      request.status !== 'Resolved' &&
      request.priority === 'Urgent'
  ).length

  const progress =
    requests.length === 0
      ? 0
      : Math.round((completed / requests.length) * 100)

  let status = 'Available'

  if (active >= 7) {
    status = 'Overloaded'
  } else if (active >= 4) {
    status = 'Busy'
  }

  return {
    assigned: requests.length,
    completed,
    active,
    overdue,
    progress,
    status
  }
}

function statusClass(status) {
  if (status === 'Overloaded') {
    return 'bg-red-100 text-red-700'
  }

  if (status === 'Busy') {
    return 'bg-orange-100 text-orange-700'
  }

  return 'bg-green-100 text-green-700'
}

function progressClass(progress) {
  if (progress >= 80) {
    return 'bg-green-500'
  }

  if (progress >= 50) {
    return 'bg-blue-500'
  }

  return 'bg-orange-500'
}

function toggleEmployee(employee) {
  if (selectedEmployee.value === employee.id) {
    selectedEmployee.value = null
  } else {
    selectedEmployee.value = employee.id
  }
}

function openRequest(id) {
  router.push(`/requests/${id}`)
}

const totalMembers = computed(() => {
  return team.value.length
})

const availableMembers = computed(() => {
  return team.value.filter(
    employee =>
      getEmployeeStats(employee).status === 'Available'
  ).length
})

const busyMembers = computed(() => {
  return team.value.filter(
    employee =>
      getEmployeeStats(employee).status === 'Busy'
  ).length
})

const overloadedMembers = computed(() => {
  return team.value.filter(
    employee =>
      getEmployeeStats(employee).status === 'Overloaded'
  ).length
})

const totalAssigned = computed(() => {
  return requestStore.requests.filter(
    request => request.assignee !== 'Unassigned'
  ).length
})

const totalCompleted = computed(() => {
  return requestStore.requests.filter(
    request => request.status === 'Resolved'
  ).length
})

onMounted(async () => {
  await Promise.all([
    getTeam(),

    requestStore.requests.length === 0
      ? requestStore.getRequests()
      : Promise.resolve()
  ])
})
</script>

<template>
  <div class="space-y-8">

    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-slate-800">
        Team
      </h1>

      <p class="mt-1 text-slate-500">
        Monitor team workload, performance and assignments
      </p>
    </div>

    <!-- Loading -->
    <div
      v-if="loading || requestStore.loading"
      class="rounded-xl bg-white p-10 text-center shadow-sm"
    >
      <p class="font-medium text-slate-600">
        Loading team...
      </p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error || requestStore.error"
      class="rounded-xl bg-red-50 p-6 text-red-600"
    >
      {{ error || requestStore.error }}
    </div>

    <!-- Main -->
    <div v-else class="space-y-8">

      <!-- Summary -->
      <div
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >

        <div class="rounded-xl bg-white p-5 shadow-sm">

          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">
              Team Members
            </p>

            <span
              class="rounded-lg bg-blue-50 px-3 py-2 text-blue-600"
            >
              👥
            </span>
          </div>

          <p class="mt-4 text-3xl font-bold text-slate-800">
            {{ totalMembers }}
          </p>

          <p class="mt-1 text-sm text-slate-400">
            Active employees
          </p>

        </div>

        <div class="rounded-xl bg-white p-5 shadow-sm">

          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">
              Available
            </p>

            <span
              class="rounded-lg bg-green-50 px-3 py-2 text-green-600"
            >
              ✓
            </span>
          </div>

          <p class="mt-4 text-3xl font-bold text-green-600">
            {{ availableMembers }}
          </p>

          <p class="mt-1 text-sm text-slate-400">
            Ready for work
          </p>

        </div>

        <div class="rounded-xl bg-white p-5 shadow-sm">

          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">
              Busy
            </p>

            <span
              class="rounded-lg bg-orange-50 px-3 py-2 text-orange-600"
            >
              !
            </span>
          </div>

          <p class="mt-4 text-3xl font-bold text-orange-600">
            {{ busyMembers }}
          </p>

          <p class="mt-1 text-sm text-slate-400">
            High workload
          </p>

        </div>

        <div class="rounded-xl bg-white p-5 shadow-sm">

          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">
              Overloaded
            </p>

            <span
              class="rounded-lg bg-red-50 px-3 py-2 text-red-600"
            >
              ⚠
            </span>
          </div>

          <p class="mt-4 text-3xl font-bold text-red-600">
            {{ overloadedMembers }}
          </p>

          <p class="mt-1 text-sm text-slate-400">
            Need redistribution
          </p>

        </div>

      </div>

      <!-- Workload Overview -->
      <div class="rounded-xl bg-white p-6 shadow-sm">

        <div
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >

          <div>
            <h2 class="text-xl font-bold text-slate-800">
              Workload Overview
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Current assignment and completion performance
            </p>
          </div>

          <div class="text-sm text-slate-500">
            {{ totalAssigned }} assigned ·
            {{ totalCompleted }} resolved
          </div>

        </div>

        <div class="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            class="h-full rounded-full bg-blue-600 transition-all duration-500"
            :style="{
              width: `${
                totalAssigned === 0
                  ? 0
                  : Math.min(
                      (totalCompleted / totalAssigned) * 100,
                      100
                    )
              }%`
            }"
          ></div>

        </div>

      </div>

      <!-- Team Grid -->
      <div>

        <div class="mb-5">

          <h2 class="text-xl font-bold text-slate-800">
            Team Members
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Click a member to view their assigned requests
          </p>

        </div>

        <div
          class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >

          <div
            v-for="employee in team"
            :key="employee.id"
            class="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
          >

            <!-- Employee -->
            <div class="p-6">

              <div class="flex items-start justify-between">

                <div class="flex items-center gap-4">

                  <img
                    :src="employee.image"
                    :alt="employee.name"
                    class="h-14 w-14 rounded-full object-cover"
                  >

                  <div>

                    <h3 class="font-bold text-slate-800">
                      {{ employee.name }}
                    </h3>

                    <p class="text-sm text-slate-500">
                      {{ employee.role }}
                    </p>

                    <p class="mt-1 text-xs text-slate-400">
                      {{ employee.department }}
                    </p>

                  </div>

                </div>

              </div>

              <!-- Status -->
              <div class="mt-5 flex items-center justify-between">

                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="
                    statusClass(
                      getEmployeeStats(employee).status
                    )
                  "
                >
                  {{ getEmployeeStats(employee).status }}
                </span>

                <span class="text-xs text-slate-400">
                  {{ employee.email }}
                </span>

              </div>

              <!-- Stats -->
              <div
                class="mt-5 grid grid-cols-3 gap-2"
              >

                <div
                  class="rounded-lg bg-slate-50 p-3 text-center"
                >
                  <p class="text-lg font-bold text-slate-800">
                    {{ getEmployeeStats(employee).assigned }}
                  </p>

                  <p class="text-xs text-slate-500">
                    Assigned
                  </p>
                </div>

                <div
                  class="rounded-lg bg-slate-50 p-3 text-center"
                >
                  <p class="text-lg font-bold text-green-600">
                    {{ getEmployeeStats(employee).completed }}
                  </p>

                  <p class="text-xs text-slate-500">
                    Completed
                  </p>
                </div>

                <div
                  class="rounded-lg bg-slate-50 p-3 text-center"
                >
                  <p class="text-lg font-bold text-red-600">
                    {{ getEmployeeStats(employee).overdue }}
                  </p>

                  <p class="text-xs text-slate-500">
                    Urgent
                  </p>
                </div>

              </div>

              <!-- Progress -->
              <div class="mt-5">

                <div
                  class="mb-2 flex justify-between text-xs"
                >

                  <span class="text-slate-500">
                    Completion
                  </span>

                  <span class="font-semibold text-slate-700">
                    {{ getEmployeeStats(employee).progress }}%
                  </span>

                </div>

                <div
                  class="h-2 overflow-hidden rounded-full bg-slate-100"
                >

                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="
                      progressClass(
                        getEmployeeStats(employee).progress
                      )
                    "
                    :style="{
                      width: `${
                        getEmployeeStats(employee).progress
                      }%`
                    }"
                  ></div>

                </div>

              </div>

              <!-- Action -->
              <button
                @click="toggleEmployee(employee)"
                class="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                {{
                  selectedEmployee === employee.id
                    ? 'Hide Requests'
                    : 'View Requests'
                }}
              </button>

            </div>

            <!-- Requests -->
            <div
              v-if="selectedEmployee === employee.id"
              class="border-t border-slate-100 bg-slate-50 p-5"
            >

              <div
                class="mb-4 flex items-center justify-between"
              >

                <h4 class="font-semibold text-slate-800">
                  Assigned Requests
                </h4>

                <span class="text-xs text-slate-400">
                  {{ getEmployeeStats(employee).active }}
                  active
                </span>

              </div>

              <div
                v-if="
                  getEmployeeRequests(employee).length === 0
                "
                class="rounded-lg bg-white p-5 text-center text-sm text-slate-400"
              >
                No requests assigned
              </div>

              <div
                v-else
                class="max-h-72 space-y-2 overflow-y-auto"
              >

                <div
                  v-for="
                    request in getEmployeeRequests(employee)
                  "
                  :key="request.id"
                  @click="openRequest(request.id)"
                  class="cursor-pointer rounded-lg bg-white p-4 transition hover:shadow-sm"
                >

                  <div
                    class="flex items-start justify-between gap-3"
                  >

                    <p
                      class="text-sm font-semibold text-slate-800"
                    >
                      {{ request.title }}
                    </p>

                    <span
                      class="shrink-0 text-xs text-slate-400"
                    >
                      #{{ request.id }}
                    </span>

                  </div>

                  <div
                    class="mt-3 flex flex-wrap gap-2"
                  >

                    <span
                      class="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      {{ request.status }}
                    </span>

                    <span
                      class="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700"
                    >
                      {{ request.priority }}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>