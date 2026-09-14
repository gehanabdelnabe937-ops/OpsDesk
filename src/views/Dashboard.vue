<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

import { Doughnut } from 'vue-chartjs'

import { useRequestStore } from '../stores/requestStore'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

const requestStore = useRequestStore()
const router = useRouter()

/* =========================
   Navigation
========================= */

function goToRequests(filter = null) {
  if (filter) {
    router.push({
      path: '/requests',
      query: {
        status: filter
      }
    })
  } else {
    router.push('/requests')
  }
}

/* =========================
   Statistics
========================= */

const totalRequests = computed(() => {
  return requestStore.requests.length
})

const openRequests = computed(() => {
  return requestStore.requests.filter(
    request => request.status !== 'Resolved'
  ).length
})

const resolvedRequests = computed(() => {
  return requestStore.requests.filter(
    request => request.status === 'Resolved'
  ).length
})

const overdueRequests = computed(() => {
  return requestStore.requests.filter(
    request =>
      request.status !== 'Resolved' &&
      request.priority === 'Urgent'
  ).length
})

const resolutionRate = computed(() => {
  if (totalRequests.value === 0) return 0

  return Math.round(
    (resolvedRequests.value / totalRequests.value) * 100
  )
})

/* =========================
   Recent Requests
========================= */

const recentRequests = computed(() => {
  return requestStore.requests.slice(0, 5)
})

/* =========================
   Status Data
========================= */

const statusData = computed(() => {
  return {
    new: requestStore.requests.filter(
      request => request.status === 'New'
    ).length,

    inProgress: requestStore.requests.filter(
      request => request.status === 'In Progress'
    ).length,

    resolved: requestStore.requests.filter(
      request => request.status === 'Resolved'
    ).length
  }
})

/* =========================
   Chart Data
========================= */

const chartData = computed(() => {
  return {
    labels: [
      'New',
      'In Progress',
      'Resolved'
    ],

    datasets: [
      {
        data: [
          statusData.value.new,
          statusData.value.inProgress,
          statusData.value.resolved
        ],

        backgroundColor: [
          '#3b82f6',
          '#f97316',
          '#22c55e'
        ],

        borderWidth: 0
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

/* =========================
   Load Data
========================= */

onMounted(() => {
  if (requestStore.requests.length === 0) {
    requestStore.getRequests()
  }
})
</script>


<template>

  <div class="space-y-8">

    <!-- Header -->

    <div>

      <h1 class="text-3xl font-bold text-slate-800">
        Dashboard
      </h1>

      <p class="mt-1 text-slate-500">
        Overview of your company operations
      </p>

    </div>


    <!-- Loading -->

    <div
      v-if="requestStore.loading"
      class="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm"
    >
      Loading dashboard...
    </div>


    <!-- Error -->

    <div
      v-else-if="requestStore.error"
      class="rounded-xl bg-red-50 p-6 text-center text-red-600"
    >
      {{ requestStore.error }}
    </div>


    <!-- Dashboard -->

    <div
      v-else
      class="space-y-8"
    >

      <!-- Statistics -->

      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">


        <!-- Total -->

        <div
          @click="goToRequests()"
          class="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >

          <p class="text-sm text-slate-500">
            Total Requests
          </p>

          <p class="mt-2 text-3xl font-bold text-slate-800">
            {{ totalRequests }}
          </p>

          <p class="mt-2 text-sm text-slate-400">
            All requests
          </p>

        </div>


        <!-- Open -->

        <div
          @click="goToRequests('open')"
          class="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >

          <p class="text-sm text-slate-500">
            Open Requests
          </p>

          <p class="mt-2 text-3xl font-bold text-blue-600">
            {{ openRequests }}
          </p>

          <p class="mt-2 text-sm text-slate-400">
            Currently active
          </p>

        </div>


        <!-- Resolved -->

        <div
          @click="goToRequests('Resolved')"
          class="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >

          <p class="text-sm text-slate-500">
            Resolved
          </p>

          <p class="mt-2 text-3xl font-bold text-green-600">
            {{ resolvedRequests }}
          </p>

          <p class="mt-2 text-sm text-slate-400">
            Completed requests
          </p>

        </div>


        <!-- Resolution -->

        <div class="rounded-xl bg-white p-6 shadow-sm">

          <p class="text-sm text-slate-500">
            Resolution Rate
          </p>

          <p class="mt-2 text-3xl font-bold text-purple-600">
            {{ resolutionRate }}%
          </p>

          <p class="mt-2 text-sm text-slate-400">
            Overall performance
          </p>

        </div>

      </div>


      <!-- Status + Chart -->

      <div class="grid gap-8 lg:grid-cols-2">


        <!-- Request Status -->

        <div class="rounded-xl bg-white p-6 shadow-sm">

          <h2 class="text-xl font-bold text-slate-800">
            Request Status
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Current request distribution
          </p>


          <div class="mt-6 space-y-5">


            <!-- New -->

            <div>

              <div class="mb-2 flex justify-between">

                <span class="font-medium text-slate-700">
                  New
                </span>

                <span class="text-slate-500">
                  {{ statusData.new }}
                </span>

              </div>


              <div class="h-3 rounded-full bg-slate-100">

                <div
                  class="h-3 rounded-full bg-blue-500"
                  :style="{
                    width: totalRequests
                      ? `${(statusData.new / totalRequests) * 100}%`
                      : '0%'
                  }"
                ></div>

              </div>

            </div>


            <!-- In Progress -->

            <div>

              <div class="mb-2 flex justify-between">

                <span class="font-medium text-slate-700">
                  In Progress
                </span>

                <span class="text-slate-500">
                  {{ statusData.inProgress }}
                </span>

              </div>


              <div class="h-3 rounded-full bg-slate-100">

                <div
                  class="h-3 rounded-full bg-orange-500"
                  :style="{
                    width: totalRequests
                      ? `${(statusData.inProgress / totalRequests) * 100}%`
                      : '0%'
                  }"
                ></div>

              </div>

            </div>


            <!-- Resolved -->

            <div>

              <div class="mb-2 flex justify-between">

                <span class="font-medium text-slate-700">
                  Resolved
                </span>

                <span class="text-slate-500">
                  {{ statusData.resolved }}
                </span>

              </div>


              <div class="h-3 rounded-full bg-slate-100">

                <div
                  class="h-3 rounded-full bg-green-500"
                  :style="{
                    width: totalRequests
                      ? `${(statusData.resolved / totalRequests) * 100}%`
                      : '0%'
                  }"
                ></div>

              </div>

            </div>

          </div>

        </div>


        <!-- Doughnut Chart -->

        <div class="rounded-xl bg-white p-6 shadow-sm">

          <h2 class="text-xl font-bold text-slate-800">
            Requests Overview
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Distribution of requests by status
          </p>


          <div class="mx-auto mt-6 h-72 max-w-sm">

            <Doughnut
              :data="chartData"
              :options="chartOptions"
            />

          </div>

        </div>

      </div>


      <!-- Attention -->

      <div class="rounded-xl bg-white p-6 shadow-sm">

        <h2 class="text-xl font-bold text-slate-800">
          Attention Required
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Requests that may need immediate action
        </p>


        <div
          @click="goToRequests('urgent')"
          class="mt-6 cursor-pointer rounded-xl bg-red-50 p-6 transition hover:-translate-y-1 hover:shadow-md"
        >

          <p class="text-sm font-medium text-red-600">
            Urgent Requests
          </p>

          <p class="mt-2 text-4xl font-bold text-red-700">
            {{ overdueRequests }}
          </p>

          <p class="mt-2 text-sm text-red-500">
            Unresolved urgent requests
          </p>

        </div>

      </div>


      <!-- Recent Requests -->

      <div class="rounded-xl bg-white p-6 shadow-sm">

        <div class="mb-6">

          <h2 class="text-xl font-bold text-slate-800">
            Recent Requests
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Latest requests in the system
          </p>

        </div>


        <!-- No Requests -->

        <div
          v-if="recentRequests.length === 0"
          class="rounded-lg bg-slate-50 p-6 text-center text-slate-400"
        >
          No requests available
        </div>


        <!-- Requests -->

        <div
          v-else
          class="space-y-3"
        >

          <div
            v-for="request in recentRequests"
            :key="request.id"
            @click="router.push(`/requests/${request.id}`)"
            class="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 p-4 transition hover:bg-slate-50"
          >

            <div>

              <p class="font-semibold text-slate-800">
                {{ request.title }}
              </p>

              <p class="mt-1 text-sm text-slate-500">
                {{ request.department }} · {{ request.assignee }}
              </p>

            </div>


            <span
              class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {{ request.status }}
            </span>

          </div>

        </div>

      </div>

    </div>

  </div>

</template>