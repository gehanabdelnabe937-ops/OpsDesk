<script setup>
import { computed } from 'vue'
import { useRequestStore } from '../stores/requestStore'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Doughnut, Bar } from 'vue-chartjs'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
)

const requestStore = useRequestStore()

/* =========================
   Basic Statistics
========================= */

const totalRequests = computed(() => {
  return requestStore.requests.length
})

const newRequests = computed(() => {
  return requestStore.requests.filter(
    request => request.status === 'New'
  ).length
})

const inProgressRequests = computed(() => {
  return requestStore.requests.filter(
    request => request.status === 'In Progress'
  ).length
})

const resolvedRequests = computed(() => {
  return requestStore.requests.filter(
    request => request.status === 'Resolved'
  ).length
})

const urgentRequests = computed(() => {
  return requestStore.requests.filter(
    request => request.priority === 'Urgent'
  ).length
})

const highRequests = computed(() => {
  return requestStore.requests.filter(
    request => request.priority === 'High'
  ).length
})

const mediumRequests = computed(() => {
  return requestStore.requests.filter(
    request => request.priority === 'Medium'
  ).length
})

const lowRequests = computed(() => {
  return requestStore.requests.filter(
    request => request.priority === 'Low'
  ).length
})

/* =========================
   Resolution Rate
========================= */

const resolutionRate = computed(() => {
  if (totalRequests.value === 0) {
    return 0
  }

  return Math.round(
    (resolvedRequests.value / totalRequests.value) * 100
  )
})

/* =========================
   Status Chart
========================= */

const statusChartData = computed(() => {
  return {
    labels: [
      'New',
      'In Progress',
      'Resolved'
    ],

    datasets: [
      {
        data: [
          newRequests.value,
          inProgressRequests.value,
          resolvedRequests.value
        ]
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}

/* =========================
   Priority Chart
========================= */

const priorityChartData = computed(() => {
  return {
    labels: [
      'Urgent',
      'High',
      'Medium',
      'Low'
    ],

    datasets: [
      {
        label: 'Requests',
        data: [
          urgentRequests.value,
          highRequests.value,
          mediumRequests.value,
          lowRequests.value
        ]
      }
    ]
  }
})

/* =========================
   Department Analysis
========================= */

const departmentStats = computed(() => {

  const departments = {}

  requestStore.requests.forEach(request => {

    const department =
      request.department || 'Unknown'

    if (!departments[department]) {
      departments[department] = 0
    }

    departments[department]++
  })

  return Object.entries(departments)
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count)
})

/* =========================
   Department Chart
========================= */

const departmentChartData = computed(() => {

  return {
    labels: departmentStats.value.map(
      department => department.name
    ),

    datasets: [
      {
        label: 'Requests',
        data: departmentStats.value.map(
          department => department.count
        )
      }
    ]
  }

})

/* =========================
   Employee Workload
========================= */

const employeeStats = computed(() => {

  const employees = {}

  requestStore.requests.forEach(request => {

    const employee =
      request.assignee || 'Unassigned'

    if (!employees[employee]) {
      employees[employee] = 0
    }

    employees[employee]++
  })

  return Object.entries(employees)
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count)
})

/* =========================
   Highest Workload
========================= */

const busiestEmployee = computed(() => {

  if (employeeStats.value.length === 0) {
    return null
  }

  return employeeStats.value[0]
})

/* =========================
   Most Used Department
========================= */

const busiestDepartment = computed(() => {

  if (departmentStats.value.length === 0) {
    return null
  }

  return departmentStats.value[0]
})
</script>

<template>

  <div class="space-y-8">

    <!-- Header -->

    <div>

      <h1 class="text-3xl font-bold text-slate-800">
        Reports
      </h1>

      <p class="mt-1 text-slate-500">
        Operational analytics and performance overview
      </p>

    </div>


    <!-- Main Statistics -->

    <div
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >

      <!-- Total -->

      <div class="rounded-xl bg-white p-6 shadow-sm">

        <p class="text-sm text-slate-500">
          Total Requests
        </p>

        <p class="mt-2 text-3xl font-bold text-slate-800">
          {{ totalRequests }}
        </p>

      </div>


      <!-- New -->

      <div class="rounded-xl bg-white p-6 shadow-sm">

        <p class="text-sm text-slate-500">
          New Requests
        </p>

        <p class="mt-2 text-3xl font-bold text-blue-600">
          {{ newRequests }}
        </p>

      </div>


      <!-- In Progress -->

      <div class="rounded-xl bg-white p-6 shadow-sm">

        <p class="text-sm text-slate-500">
          In Progress
        </p>

        <p class="mt-2 text-3xl font-bold text-orange-500">
          {{ inProgressRequests }}
        </p>

      </div>


      <!-- Resolved -->

      <div class="rounded-xl bg-white p-6 shadow-sm">

        <p class="text-sm text-slate-500">
          Resolved
        </p>

        <p class="mt-2 text-3xl font-bold text-green-600">
          {{ resolvedRequests }}
        </p>

      </div>


      <!-- Urgent -->

      <div class="rounded-xl bg-white p-6 shadow-sm">

        <p class="text-sm text-slate-500">
          Urgent Requests
        </p>

        <p class="mt-2 text-3xl font-bold text-red-600">
          {{ urgentRequests }}
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

      </div>

    </div>


    <!-- Quick Insights -->

    <div
      class="grid gap-6 md:grid-cols-2"
    >

      <!-- Busiest Employee -->

      <div
        class="rounded-xl bg-white p-6 shadow-sm"
      >

        <p class="text-sm text-slate-500">
          Busiest Employee
        </p>

        <p
          v-if="busiestEmployee"
          class="mt-2 text-xl font-bold text-slate-800"
        >
          {{ busiestEmployee.name }}
        </p>

        <p
          v-if="busiestEmployee"
          class="mt-1 text-sm text-slate-500"
        >
          {{ busiestEmployee.count }} assigned requests
        </p>

        <p
          v-else
          class="mt-2 text-slate-400"
        >
          No data available
        </p>

      </div>


      <!-- Busiest Department -->

      <div
        class="rounded-xl bg-white p-6 shadow-sm"
      >

        <p class="text-sm text-slate-500">
          Busiest Department
        </p>

        <p
          v-if="busiestDepartment"
          class="mt-2 text-xl font-bold text-slate-800"
        >
          {{ busiestDepartment.name }}
        </p>

        <p
          v-if="busiestDepartment"
          class="mt-1 text-sm text-slate-500"
        >
          {{ busiestDepartment.count }} requests
        </p>

        <p
          v-else
          class="mt-2 text-slate-400"
        >
          No data available
        </p>

      </div>

    </div>


    <!-- Charts -->

    <div
      class="grid gap-6 lg:grid-cols-2"
    >

      <!-- Status Chart -->

      <div
        class="rounded-xl bg-white p-6 shadow-sm"
      >

        <div class="mb-5">

          <h2 class="text-xl font-bold text-slate-800">
            Request Status
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Current request distribution
          </p>

        </div>

        <div class="h-72">

          <Doughnut
            :data="statusChartData"
            :options="chartOptions"
          />

        </div>

      </div>


      <!-- Priority Chart -->

      <div
        class="rounded-xl bg-white p-6 shadow-sm"
      >

        <div class="mb-5">

          <h2 class="text-xl font-bold text-slate-800">
            Priority Analysis
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Requests by priority level
          </p>

        </div>

        <div class="h-72">

          <Bar
            :data="priorityChartData"
            :options="chartOptions"
          />

        </div>

      </div>

    </div>


    <!-- Department Chart -->

    <div
      class="rounded-xl bg-white p-6 shadow-sm"
    >

      <div class="mb-5">

        <h2 class="text-xl font-bold text-slate-800">
          Department Performance
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Number of requests handled by each department
        </p>

      </div>

      <div
        v-if="departmentStats.length === 0"
        class="rounded-lg bg-slate-50 p-6 text-center text-slate-400"
      >
        No department data available
      </div>

      <div
        v-else
        class="h-80"
      >

        <Bar
          :data="departmentChartData"
          :options="chartOptions"
        />

      </div>

    </div>


    <!-- Resolution Progress -->

    <div
      class="rounded-xl bg-white p-6 shadow-sm"
    >

      <div
        class="mb-4 flex items-center justify-between"
      >

        <div>

          <h2 class="text-xl font-bold text-slate-800">
            Resolution Progress
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Percentage of requests successfully resolved
          </p>

        </div>

        <span
          class="text-lg font-bold text-purple-600"
        >
          {{ resolutionRate }}%
        </span>

      </div>


      <div
        class="h-4 overflow-hidden rounded-full bg-slate-100"
      >

        <div
          class="h-full rounded-full bg-purple-600 transition-all duration-500"
          :style="{
            width: `${resolutionRate}%`
          }"
        ></div>

      </div>

    </div>


    <!-- Priority Breakdown -->

    <div
      class="rounded-xl bg-white p-6 shadow-sm"
    >

      <div class="mb-6">

        <h2 class="text-xl font-bold text-slate-800">
          Priority Breakdown
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Detailed request priority distribution
        </p>

      </div>


      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <!-- Urgent -->

        <div
          class="rounded-lg border border-red-100 bg-red-50 p-5"
        >

          <p class="text-sm text-red-600">
            Urgent
          </p>

          <p class="mt-2 text-2xl font-bold text-red-700">
            {{ urgentRequests }}
          </p>

        </div>


        <!-- High -->

        <div
          class="rounded-lg border border-orange-100 bg-orange-50 p-5"
        >

          <p class="text-sm text-orange-600">
            High
          </p>

          <p class="mt-2 text-2xl font-bold text-orange-700">
            {{ highRequests }}
          </p>

        </div>


        <!-- Medium -->

        <div
          class="rounded-lg border border-blue-100 bg-blue-50 p-5"
        >

          <p class="text-sm text-blue-600">
            Medium
          </p>

          <p class="mt-2 text-2xl font-bold text-blue-700">
            {{ mediumRequests }}
          </p>

        </div>


        <!-- Low -->

        <div
          class="rounded-lg border border-green-100 bg-green-50 p-5"
        >

          <p class="text-sm text-green-600">
            Low
          </p>

          <p class="mt-2 text-2xl font-bold text-green-700">
            {{ lowRequests }}
          </p>

        </div>

      </div>

    </div>


    <!-- Department Table -->

    <div
      class="rounded-xl bg-white p-6 shadow-sm"
    >

      <div class="mb-6">

        <h2 class="text-xl font-bold text-slate-800">
          Department Report
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Request volume by department
        </p>

      </div>


      <div
        v-if="departmentStats.length === 0"
        class="rounded-lg bg-slate-50 p-6 text-center text-slate-400"
      >
        No department data available
      </div>


      <div
        v-else
        class="overflow-x-auto"
      >

        <table class="w-full min -w-[500px] text-left">

          <thead>

            <tr
              class="border-b border-slate-100 text-sm text-slate-500"
            >

              <th class="px-4 py-3">
                Department
              </th>

              <th class="px-4 py-3">
                Requests
              </th>

              <th class="px-4 py-3">
                Percentage
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              v-for="department in departmentStats"
              :key="department.name"
              class="border-b border-slate-50 last:border-0"
            >

              <td
                class="px-4 py-4 font-semibold text-slate-800"
              >
                {{ department.name }}
              </td>

              <td
                class="px-4 py-4 text-slate-600"
              >
                {{ department.count }}
              </td>

              <td
                class="px-4 py-4 font-semibold text-purple-600"
              >
                {{
                  totalRequests === 0
                    ? 0
                    : Math.round(
                        (department.count / totalRequests) * 100
                      )
                }}%
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </div>

</template>