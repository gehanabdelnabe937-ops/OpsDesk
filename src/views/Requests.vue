<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useRequestStore } from '../stores/requestStore'

const requestStore = useRequestStore()

const route = useRoute()
const router = useRouter()

const search = ref('')
const selectedStatus = ref('All')
const selectedPriority = ref('All')

const team = ref([])

const showForm = ref(false)
const showEditForm = ref(false)

const newRequest = ref({
  title: '',
  department: 'IT',
  priority: 'Medium',
  status: 'New',
  assignee: 'Unassigned',
  description: ''
})

const editRequest = ref({
  id: null,
  title: '',
  department: 'IT',
  priority: 'Medium',
  status: 'New',
  assignee: 'Unassigned',
  description: ''
})

const dashboardFilter = computed(() => {
  return route.query.status || ''
})

const filteredRequests = computed(() => {
  return requestStore.requests.filter(request => {

    const matchesSearch =
      request.title
        .toLowerCase()
        .includes(search.value.toLowerCase())

    const matchesStatus =
      selectedStatus.value === 'All' ||
      request.status === selectedStatus.value

    const matchesPriority =
      selectedPriority.value === 'All' ||
      request.priority === selectedPriority.value

    let matchesDashboard = true

    if (dashboardFilter.value === 'open') {
      matchesDashboard =
        request.status !== 'Resolved'
    }

    if (dashboardFilter.value === 'Resolved') {
      matchesDashboard =
        request.status === 'Resolved'
    }

    if (dashboardFilter.value === 'urgent') {
      matchesDashboard =
        request.priority === 'Urgent' &&
        request.status !== 'Resolved'
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesDashboard
    )
  })
})


async function getTeam() {
  try {

    const response = await axios.get(
      'https://dummyjson.com/users'
    )

    team.value = response.data.users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`
    }))

  } catch (err) {

    requestStore.error = 'Failed to load team'
  }
}


/* =========================
   Auto Assignment
========================= */

function getAutoAssignee() {

  const savedSettings =
    localStorage.getItem('opsdesk-settings')

  if (!savedSettings) {
    return 'Unassigned'
  }

  const settings =
    JSON.parse(savedSettings)

  if (!settings.autoAssignment) {
    return 'Unassigned'
  }

  if (team.value.length === 0) {
    return 'Unassigned'
  }

  const workload = team.value.map(employee => {

    const assignedRequests =
      requestStore.requests.filter(
        request =>
          request.assignee === employee.name &&
          request.status !== 'Resolved'
      )

    return {
      employee,
      count: assignedRequests.length
    }
  })

  workload.sort((a, b) => {
    return a.count - b.count
  })

  return workload[0].employee.name
}


/* =========================
   Add Request
========================= */

async function addRequest() {

  // نتأكد إن الموظفين موجودين
  if (team.value.length === 0) {
    await getTeam()
  }

  // نقرأ إعدادات النظام
  const savedSettings =
    localStorage.getItem('opsdesk-settings')

  const settings = savedSettings
    ? JSON.parse(savedSettings)
    : {}

  // Auto Assignment يشتغل فقط لو ON
  if (settings.autoAssignment) {

    const autoAssignee =
      getAutoAssignee()

    newRequest.value.assignee =
      autoAssignee
  }

  // لو Auto Assignment OFF
  // الموظف اللي اختارناه يدويًا يفضل كما هو

  const success =
    await requestStore.addRequest(
      newRequest.value
    )

  if (success) {

    newRequest.value = {
      title: '',
      department: 'IT',
      priority: 'Medium',
      status: 'New',
      assignee: 'Unassigned',
      description: ''
    }

    showForm.value = false

    clearMessageLater()
  }
}


/* =========================
   Edit
========================= */

function openEditForm(request) {

  editRequest.value = {
    ...request
  }

  showEditForm.value = true
}

async function updateRequest() {

  const success =
    await requestStore.updateRequest(
      editRequest.value
    )

  if (success) {

    showEditForm.value = false

    clearMessageLater()
  }
}


/* =========================
   Change Status
========================= */

async function changeStatus(request, newStatus) {

  if (request.status === newStatus) {
    return
  }

  await requestStore.updateStatus(
    request.id,
    newStatus
  )

  clearMessageLater()
}


/* =========================
   Change Priority
========================= */

async function changePriority(request, newPriority) {

  if (request.priority === newPriority) {
    return
  }

  await requestStore.updatePriority(
    request.id,
    newPriority
  )

  clearMessageLater()
}


/* =========================
   Change Assignee
========================= */

async function changeAssignee(request, newAssignee) {

  if (request.assignee === newAssignee) {
    return
  }

  await requestStore.updateAssignee(
    request.id,
    newAssignee
  )

  clearMessageLater()
}


/* =========================
   Delete
========================= */

async function deleteRequest(id) {

  const success =
    await requestStore.deleteRequest(id)

  if (success) {
    clearMessageLater()
  }
}


/* =========================
   Messages
========================= */

function clearMessageLater() {

  setTimeout(() => {
    requestStore.clearMessages()
  }, 2500)
}


/* =========================
   Status Style
========================= */

function getStatusClass(status) {

  if (status === 'New') {
    return 'bg-blue-100 text-blue-700'
  }

  if (status === 'In Progress') {
    return 'bg-orange-100 text-orange-700'
  }

  if (status === 'Waiting') {
    return 'bg-yellow-100 text-yellow-700'
  }

  if (status === 'Resolved') {
    return 'bg-green-100 text-green-700'
  }

  return 'bg-slate-100 text-slate-700'
}


/* =========================
   Priority Style
========================= */

function getPriorityClass(priority) {

  if (priority === 'Urgent') {
    return 'bg-red-100 text-red-700'
  }

  if (priority === 'High') {
    return 'bg-orange-100 text-orange-700'
  }

  if (priority === 'Medium') {
    return 'bg-yellow-100 text-yellow-700'
  }

  if (priority === 'Low') {
    return 'bg-green-100 text-green-700'
  }

  return 'bg-slate-100 text-slate-700'
}


/* =========================
   Details
========================= */

function goToDetails(id) {
  router.push(`/requests/${id}`)
}


/* =========================
   Load Data
========================= */

onMounted(async () => {

  await Promise.all([

    requestStore.requests.length === 0
      ? requestStore.getRequests()
      : Promise.resolve(),

    getTeam()

  ])

})


/* =========================
   Dashboard Filter
========================= */

watch(
  () => route.query.status,
  () => {
    selectedStatus.value = 'All'
  }
)
</script>


<template>

  <div class="min-h-screen bg-slate-100 p-6">

    <!-- Header -->

    <div
      class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >

      <div>

        <h1 class="text-2xl font-bold text-slate-800">
          Requests
        </h1>

        <p class="mt-1 text-sm text-slate-500">
          Manage company requests and issues
        </p>

      </div>


      <button
        type="button"
        @click="showForm = !showForm"
        class="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        + Add Request
      </button>

    </div>


    <!-- Success -->

    <div
      v-if="requestStore.success"
      class="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
    >
      {{ requestStore.success }}
    </div>


    <!-- Error -->

    <div
      v-if="requestStore.error"
      class="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
    >
      {{ requestStore.error }}
    </div>


    <!-- Add Form -->

    <div
      v-if="showForm"
      class="mb-6 rounded-xl bg-white p-6 shadow-sm"
    >

      <h2 class="mb-5 text-lg font-semibold text-slate-800">
        Add New Request
      </h2>


      <form
        @submit.prevent="addRequest"
        class="grid gap-4 md:grid-cols-2"
      >

        <!-- Title -->

        <div>

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>

          <input
            v-model="newRequest.title"
            type="text"
            required
            placeholder="Enter request title"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          />

        </div>


        <!-- Department -->

        <div>

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Department
          </label>

          <select
            v-model="newRequest.department"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          >

            <option>IT</option>
            <option>HR</option>
            <option>Maintenance</option>
            <option>Accounts</option>

          </select>

        </div>


        <!-- Priority -->

        <div>

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Priority
          </label>

          <select
            v-model="newRequest.priority"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          >

            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>

          </select>

        </div>


        <!-- Status -->

        <div>

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            v-model="newRequest.status"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          >

            <option>New</option>
            <option>In Progress</option>
            <option>Waiting</option>
            <option>Resolved</option>

          </select>

        </div>


        <!-- Assignee -->

        <div>

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Assignee
          </label>

          <select
            v-model="newRequest.assignee"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          >

            <option>Unassigned</option>

            <option
              v-for="member in team"
              :key="member.id"
              :value="member.name"
            >
              {{ member.name }}
            </option>

          </select>

        </div>


        <!-- Description -->

        <div class="md:col-span-2">

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            v-model="newRequest.description"
            rows="4"
            placeholder="Describe the request..."
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          ></textarea>

        </div>


        <!-- Buttons -->

        <div class="flex gap-3 md:col-span-2">

          <button
            type="submit"
            :disabled="requestStore.loading"
            class="rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >

            {{
              requestStore.loading
                ? 'Adding...'
                : 'Add Request'
            }}

          </button>


          <button
            type="button"
            @click="showForm = false"
            class="rounded-lg bg-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>


    <!-- Edit Form -->

    <div
      v-if="showEditForm"
      class="mb-6 rounded-xl bg-white p-6 shadow-sm"
    >

      <h2 class="mb-5 text-lg font-semibold text-slate-800">
        Edit Request
      </h2>


      <form
        @submit.prevent="updateRequest"
        class="grid gap-4 md:grid-cols-2"
      >

        <!-- Title -->

        <div>

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>

          <input
            v-model="editRequest.title"
            type="text"
            required
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          />

        </div>


        <!-- Department -->

        <div>

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Department
          </label>

          <select
            v-model="editRequest.department"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          >

            <option>IT</option>
            <option>HR</option>
            <option>Maintenance</option>
            <option>Accounts</option>

          </select>

        </div>


        <!-- Priority -->

        <div>

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Priority
          </label>

          <select
            v-model="editRequest.priority"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          >

            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>

          </select>

        </div>


        <!-- Status -->

        <div>

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            v-model="editRequest.status"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          >

            <option>New</option>
            <option>In Progress</option>
            <option>Waiting</option>
            <option>Resolved</option>

          </select>

        </div>


        <!-- Assignee -->

        <div>

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Assignee
          </label>

          <select
            v-model="editRequest.assignee"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          >

            <option>Unassigned</option>

            <option
              v-for="member in team"
              :key="member.id"
              :value="member.name"
            >
              {{ member.name }}
            </option>

          </select>

        </div>


        <!-- Description -->

        <div class="md:col-span-2">

          <label class="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            v-model="editRequest.description"
            rows="4"
            class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
          ></textarea>

        </div>


        <!-- Buttons -->

        <div class="flex gap-3 md:col-span-2">

          <button
            type="submit"
            class="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Changes
          </button>


          <button
            type="button"
            @click="showEditForm = false"
            class="rounded-lg bg-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>


    <!-- Filters -->

    <div
      class="mb-6 grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-3"
    >

      <!-- Search -->

      <div>

        <label class="mb-1 block text-sm font-medium text-slate-700">
          Search
        </label>

        <input
          v-model="search"
          type="text"
          placeholder="Search requests..."
          class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
        />

      </div>


      <!-- Status Filter -->

      <div>

        <label class="mb-1 block text-sm font-medium text-slate-700">
          Status
        </label>

        <select
          v-model="selectedStatus"
          class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
        >

          <option>All</option>
          <option>New</option>
          <option>In Progress</option>
          <option>Waiting</option>
          <option>Resolved</option>

        </select>

      </div>


      <!-- Priority Filter -->

      <div>

        <label class="mb-1 block text-sm font-medium text-slate-700">
          Priority
        </label>

        <select
          v-model="selectedPriority"
          class="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
        >

          <option>All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Urgent</option>

        </select>

      </div>

    </div>


    <!-- Loading -->

    <div
      v-if="requestStore.loading && requestStore.requests.length === 0"
      class="rounded-xl bg-white p-10 text-center shadow-sm"
    >

      <p class="text-slate-500">
        Loading requests...
      </p>

    </div>


    <!-- Table -->

    <div
      v-else
      class="overflow-x-auto rounded-xl bg-white shadow-sm"
    >

      <table class="w-full min -w-[1100px] text-left">

        <thead
          class="border-b border-slate-100 bg-slate-50"
        >

          <tr>

            <th class="px-5 py-4 text-sm font-semibold text-slate-700">
              Request
            </th>

            <th class="px-5 py-4 text-sm font-semibold text-slate-700">
              Department
            </th>

            <th class="px-5 py-4 text-sm font-semibold text-slate-700">
              Priority
            </th>

            <th class="px-5 py-4 text-sm font-semibold text-slate-700">
              Status
            </th>

            <th class="px-5 py-4 text-sm font-semibold text-slate-700">
              Assignee
            </th>

            <th class="px-5 py-4 text-sm font-semibold text-slate-700">
              Actions
            </th>

          </tr>

        </thead>


        <tbody>

          <tr
            v-for="request in filteredRequests"
            :key="request.id"
            class="border-b border-slate-100 last:border-0"
          >

            <!-- Request -->

            <td class="px-5 py-4">

              <p class="font-medium text-slate-800">
                {{ request.title }}
              </p>

              <p
                class="mt-1 max-w-xs truncate text-sm text-slate-500"
              >
                {{ request.description }}
              </p>

            </td>


            <!-- Department -->

            <td class="px-5 py-4 text-sm text-slate-600">
              {{ request.department }}
            </td>


            <!-- Priority -->

            <td class="px-5 py-4">

              <select
                :value="request.priority"
                @change="
                  changePriority(
                    request,
                    $event.target.value
                  )
                "
                :class="[
                  'cursor-pointer rounded-full border-0 px-3 py-1 text-xs font-medium outline-none',
                  getPriorityClass(request.priority)
                ]"
              >

                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>

              </select>

            </td>


            <!-- Status -->

            <td class="px-5 py-4">

              <select
                :value="request.status"
                @change="
                  changeStatus(
                    request,
                    $event.target.value
                  )
                "
                :class="[
                  'cursor-pointer rounded-full border-0 px-3 py-1 text-xs font-medium outline-none',
                  getStatusClass(request.status)
                ]"
              >

                <option>New</option>
                <option>In Progress</option>
                <option>Waiting</option>
                <option>Resolved</option>

              </select>

            </td>


            <!-- Assignee -->

            <td class="px-5 py-4">

              <select
                :value="request.assignee"
                @change="
                  changeAssignee(
                    request,
                    $event.target.value
                  )
                "
                class="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
              >

                <option>Unassigned</option>

                <option
                  v-for="member in team"
                  :key="member.id"
                  :value="member.name"
                >
                  {{ member.name }}
                </option>

              </select>

            </td>


            <!-- Actions -->

            <td class="px-5 py-4">

              <div class="flex gap-2">

                <button
                  type="button"
                  @click="goToDetails(request.id)"
                  class="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-800"
                >
                  Details
                </button>


                <button
                  type="button"
                  @click="openEditForm(request)"
                  class="rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 hover:bg-blue-200"
                >
                  Edit
                </button>


                <button
                  type="button"
                  @click="deleteRequest(request.id)"
                  class="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-200"
                >
                  Delete
                </button>

              </div>

            </td>

          </tr>


          <!-- Empty -->

          <tr v-if="filteredRequests.length === 0">

            <td
              colspan="6"
              class="px-5 py-10 text-center text-slate-500"
            >
              No requests found
            </td>

          </tr>

        </tbody>

      </table>

    </div>

  </div>

</template>