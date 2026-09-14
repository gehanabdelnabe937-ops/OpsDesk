<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useRequestStore } from '../stores/requestStore'

const route = useRoute()
const router = useRouter()
const requestStore = useRequestStore()

const selectedStatus = ref('')
const selectedPriority = ref('')
const selectedAssignee = ref('')

const loading = ref(false)
const success = ref('')
const error = ref('')

const newComment = ref('')
const comments = ref([])
const team = ref([])

const showDeleteConfirm = ref(false)

const activities = ref([
  {
    id: 1,
    title: 'Request created',
    description: 'The request was added to the system.',
    time: new Date().toLocaleTimeString(),
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Request assigned',
    description: 'The request was assigned to an employee.',
    time: new Date().toLocaleTimeString(),
    color: 'bg-orange-500'
  }
])

const request = computed(() => {
  return requestStore.requests.find(
    item => item.id === Number(route.params.id)
  )
})

const statusOptions = [
  'New',
  'In Progress',
  'Waiting',
  'Resolved'
]

const priorityOptions = [
  'Low',
  'Medium',
  'High',
  'Urgent'
]

const progressSteps = [
  'New',
  'In Progress',
  'Waiting',
  'Resolved'
]

const progressPercentage = computed(() => {
  if (!request.value) return 0

  const index = progressSteps.indexOf(
    request.value.status
  )

  if (index === -1) return 0

  return (index / (progressSteps.length - 1)) * 100
})

const priorityClass = computed(() => {
  if (!request.value) return ''

  if (request.value.priority === 'Urgent') {
    return 'bg-red-100 text-red-700'
  }

  if (request.value.priority === 'High') {
    return 'bg-orange-100 text-orange-700'
  }

  if (request.value.priority === 'Medium') {
    return 'bg-yellow-100 text-yellow-700'
  }

  return 'bg-green-100 text-green-700'
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
    error.value = 'Failed to load team'
  }
}

function addActivity(title, description, color) {
  activities.value.unshift({
    id: Date.now(),
    title,
    description,
    time: new Date().toLocaleTimeString(),
    color
  })
}

onMounted(async () => {
  if (requestStore.requests.length === 0) {
    await requestStore.getRequests()
  }

  await getTeam()

  if (request.value) {
    selectedStatus.value = request.value.status
    selectedPriority.value = request.value.priority
    selectedAssignee.value = request.value.assignee
  }
})

async function updateStatus() {
  if (!request.value) return

  if (selectedStatus.value === request.value.status) {
    return
  }

  loading.value = true
  success.value = ''
  error.value = ''

  const oldStatus = request.value.status

  const result = await requestStore.updateStatus(
    request.value.id,
    selectedStatus.value
  )

  if (result) {
    addActivity(
      'Status changed',
      `Request status changed to ${selectedStatus.value}.`,
      'bg-green-500'
    )

    success.value = 'Status updated successfully'
  } else {
    selectedStatus.value = oldStatus
    error.value = 'Failed to update status'
  }

  loading.value = false
}

async function updatePriority() {
  if (!request.value) return

  if (selectedPriority.value === request.value.priority) {
    return
  }

  loading.value = true
  success.value = ''
  error.value = ''

  const oldPriority = request.value.priority

  const result = await requestStore.updatePriority(
    request.value.id,
    selectedPriority.value
  )

  if (result) {
    addActivity(
      'Priority changed',
      `Request priority changed to ${selectedPriority.value}.`,
      'bg-red-500'
    )

    success.value = 'Priority updated successfully'
  } else {
    selectedPriority.value = oldPriority
    error.value = 'Failed to update priority'
  }

  loading.value = false
}

async function updateAssignee() {
  if (!request.value) return

  if (selectedAssignee.value === request.value.assignee) {
    return
  }

  loading.value = true
  success.value = ''
  error.value = ''

  const oldAssignee = request.value.assignee

  const result = await requestStore.updateAssignee(
    request.value.id,
    selectedAssignee.value
  )

  if (result) {
    addActivity(
      'Request reassigned',
      `Request assigned to ${selectedAssignee.value}.`,
      'bg-orange-500'
    )

    success.value = 'Assignee updated successfully'
  } else {
    selectedAssignee.value = oldAssignee
    error.value = 'Failed to update assignee'
  }

  loading.value = false
}

async function quickStatus(status) {
  if (!request.value) return

  selectedStatus.value = status

  await updateStatus()
}

function addComment() {
  if (!newComment.value.trim()) {
    return
  }

  comments.value.unshift({
    id: Date.now(),
    text: newComment.value.trim(),
    author: 'You',
    time: new Date().toLocaleTimeString()
  })

  addActivity(
    'New comment added',
    'A new comment was added to this request.',
    'bg-purple-500'
  )

  newComment.value = ''
}

async function deleteRequest() {
  if (!request.value) return

  loading.value = true
  error.value = ''

  const result = await requestStore.deleteRequest(
    request.value.id
  )

  if (result) {
    router.push('/requests')
  } else {
    error.value = 'Failed to delete request'
  }

  loading.value = false
}

function goBack() {
  router.push('/requests')
}
</script>

<template>
  <div class="space-y-8">

    <!-- Header -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >

      <div>

        <button
          @click="goBack"
          class="mb-4 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
        >
          ← Back to Requests
        </button>

        <h1 class="text-3xl font-bold text-slate-800">
          Request Details
        </h1>

        <p class="mt-1 text-slate-500">
          View and manage request information
        </p>

      </div>

      <div
        v-if="request"
        class="flex flex-wrap items-center gap-3"
      >

        <span
          class="rounded-full px-4 py-2 text-sm font-semibold"
          :class="priorityClass"
        >
          {{ request.priority }}
        </span>

        <span
          class="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700"
        >
          {{ request.status }}
        </span>

      </div>

    </div>


    <!-- Loading -->
    <div
      v-if="requestStore.loading"
      class="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm"
    >
      Loading request...
    </div>


    <!-- Error -->
    <div
      v-else-if="requestStore.error"
      class="rounded-xl bg-red-50 p-6 text-center text-red-600"
    >
      {{ requestStore.error }}
    </div>


    <!-- Not Found -->
    <div
      v-else-if="!request"
      class="rounded-xl bg-white p-10 text-center shadow-sm"
    >

      <p class="text-lg font-semibold text-slate-700">
        Request not found
      </p>

      <button
        @click="goBack"
        class="mt-4 rounded-lg bg-slate-900 px-5 py-2 text-white"
      >
        Back to Requests
      </button>

    </div>


    <!-- Main -->
    <div
      v-else
      class="space-y-6"
    >

      <!-- Request Overview -->
      <div class="rounded-xl bg-white p-6 shadow-sm">

        <div class="mb-6">

          <p class="text-sm font-medium text-slate-400">
            Request #{{ request.id }}
          </p>

          <h2 class="mt-2 text-2xl font-bold text-slate-800">
            {{ request.title }}
          </h2>

        </div>

        <div
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >

          <div class="rounded-lg bg-slate-50 p-4">
            <p class="text-sm text-slate-500">
              Department
            </p>

            <p class="mt-2 font-semibold text-slate-800">
              {{ request.department }}
            </p>
          </div>

          <div class="rounded-lg bg-slate-50 p-4">
            <p class="text-sm text-slate-500">
              Priority
            </p>

            <p class="mt-2 font-semibold text-slate-800">
              {{ request.priority }}
            </p>
          </div>

          <div class="rounded-lg bg-slate-50 p-4">
            <p class="text-sm text-slate-500">
              Assignee
            </p>

            <p class="mt-2 font-semibold text-slate-800">
              {{ request.assignee }}
            </p>
          </div>

          <div class="rounded-lg bg-slate-50 p-4">
            <p class="text-sm text-slate-500">
              Status
            </p>

            <p class="mt-2 font-semibold text-slate-800">
              {{ request.status }}
            </p>
          </div>

        </div>

      </div>


      <!-- Progress -->
      <div class="rounded-xl bg-white p-6 shadow-sm">

        <div
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >

          <div>

            <h2 class="text-xl font-bold text-slate-800">
              Request Progress
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Track the current request stage
            </p>

          </div>

          <span class="font-bold text-blue-600">
            {{ Math.round(progressPercentage) }}%
          </span>

        </div>


        <div class="mt-6">

          <div class="h-3 overflow-hidden rounded-full bg-slate-100">

            <div
              class="h-full rounded-full bg-blue-600 transition-all duration-500"
              :style="{
                width: `${progressPercentage}%`
              }"
            ></div>

          </div>


          <div
            class="mt-4 grid grid-cols-4 gap-2 text-center"
          >

            <div
              v-for="step in progressSteps"
              :key="step"
            >

              <div
                class="mx-auto h-3 w-3 rounded-full"
                :class="
                  progressSteps.indexOf(step) <=
                  progressSteps.indexOf(request.status)
                    ? 'bg-blue-600'
                    : 'bg-slate-300'
                "
              ></div>

              <p
                class="mt-2 text-xs font-medium"
                :class="
                  progressSteps.indexOf(step) <=
                  progressSteps.indexOf(request.status)
                    ? 'text-blue-600'
                    : 'text-slate-400'
                "
              >
                {{ step }}
              </p>

            </div>

          </div>

        </div>

      </div>


      <!-- Description + Controls -->
      <div class="grid gap-6 lg:grid-cols-3">

        <!-- Description -->
        <div
          class="rounded-xl bg-white p-6 shadow-sm lg:col-span-2"
        >

          <h2 class="text-xl font-bold text-slate-800">
            Description
          </h2>

          <p class="mt-4 leading-7 text-slate-600">
            {{ request.description }}
          </p>

        </div>


        <!-- Controls -->
        <div class="rounded-xl bg-white p-6 shadow-sm">

          <h2 class="text-xl font-bold text-slate-800">
            Request Controls
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Manage request details
          </p>


          <!-- Quick Actions -->
          <div class="mt-5">

            <p class="text-sm font-medium text-slate-700">
              Quick Status
            </p>

            <div class="mt-2 grid grid-cols-2 gap-2">

              <button
                @click="quickStatus('In Progress')"
                :disabled="loading"
                class="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
              >
                In Progress
              </button>

              <button
                @click="quickStatus('Waiting')"
                :disabled="loading"
                class="rounded-lg bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-100 disabled:opacity-50"
              >
                Waiting
              </button>

              <button
                @click="quickStatus('Resolved')"
                :disabled="loading"
                class="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
              >
                Resolved
              </button>

              <button
                @click="quickStatus('New')"
                :disabled="loading"
                class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                New
              </button>

            </div>

          </div>


          <!-- Status -->
          <div class="mt-6">

            <label class="text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              v-model="selectedStatus"
              class="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >

              <option
                v-for="status in statusOptions"
                :key="status"
                :value="status"
              >
                {{ status }}
              </option>

            </select>

            <button
              @click="updateStatus"
              :disabled="loading"
              class="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading ? 'Updating...' : 'Update Status' }}
            </button>

          </div>


          <!-- Priority -->
          <div class="mt-5">

            <label class="text-sm font-medium text-slate-700">
              Priority
            </label>

            <select
              v-model="selectedPriority"
              class="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >

              <option
                v-for="priority in priorityOptions"
                :key="priority"
                :value="priority"
              >
                {{ priority }}
              </option>

            </select>

            <button
              @click="updatePriority"
              :disabled="loading"
              class="mt-3 w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading ? 'Updating...' : 'Update Priority' }}
            </button>

          </div>


          <!-- Assignee -->
          <div class="mt-5">

            <label class="text-sm font-medium text-slate-700">
              Assignee
            </label>

            <select
              v-model="selectedAssignee"
              class="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >

              <option value="Unassigned">
                Unassigned
              </option>

              <option
                v-for="member in team"
                :key="member.id"
                :value="member.name"
              >
                {{ member.name }}
              </option>

            </select>

            <button
              @click="updateAssignee"
              :disabled="loading"
              class="mt-3 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading ? 'Updating...' : 'Update Assignee' }}
            </button>

          </div>


          <!-- Messages -->
          <p
            v-if="success"
            class="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-600"
          >
            {{ success }}
          </p>

          <p
            v-if="error"
            class="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600"
          >
            {{ error }}
          </p>

        </div>

      </div>


      <!-- Comments -->
      <div class="rounded-xl bg-white p-6 shadow-sm">

        <h2 class="text-xl font-bold text-slate-800">
          Comments
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Discuss this request with your team
        </p>


        <div class="mt-6">

          <textarea
            v-model="newComment"
            rows="4"
            placeholder="Write a comment..."
            class="w-full rounded-lg border border-slate-200 p-4 outline-none focus:border-blue-500"
          ></textarea>

          <div class="mt-3 flex justify-end">

            <button
              @click="addComment"
              class="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800"
            >
              Add Comment
            </button>

          </div>

        </div>


        <div class="mt-6 space-y-4">

          <div
            v-if="comments.length === 0"
            class="rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-400"
          >
            No comments yet
          </div>


          <div
            v-for="comment in comments"
            :key="comment.id"
            class="rounded-lg border border-slate-100 p-4"
          >

            <div class="flex items-center justify-between">

              <p class="font-semibold text-slate-800">
                {{ comment.author }}
              </p>

              <span class="text-xs text-slate-400">
                {{ comment.time }}
              </span>

            </div>

            <p class="mt-2 text-slate-600">
              {{ comment.text }}
            </p>

          </div>

        </div>

      </div>


      <!-- Activity Timeline -->
      <div class="rounded-xl bg-white p-6 shadow-sm">

        <h2 class="text-xl font-bold text-slate-800">
          Activity Timeline
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Recent activity on this request
        </p>


        <div class="mt-6 space-y-6">

          <div
            v-for="activity in activities"
            :key="activity.id"
            class="flex gap-4"
          >

            <div class="flex flex-col items-center">

              <div
                class="mt-1 h-3 w-3 shrink-0 rounded-full"
                :class="activity.color"
              ></div>

            </div>


            <div class="flex-1">

              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
              >

                <p class="font-semibold text-slate-800">
                  {{ activity.title }}
                </p>

                <span class="text-xs text-slate-400">
                  {{ activity.time }}
                </span>

              </div>

              <p class="mt-1 text-sm text-slate-500">
                {{ activity.description }}
              </p>

            </div>

          </div>

        </div>

      </div>


      <!-- Danger Zone -->
      <div
        class="rounded-xl border border-red-100 bg-white p-6 shadow-sm"
      >

        <h2 class="text-xl font-bold text-red-600">
          Danger Zone
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Permanently remove this request from the system.
        </p>

        <button
          @click="showDeleteConfirm = true"
          class="mt-5 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Delete Request
        </button>

      </div>


      <!-- Delete Confirmation -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >

        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

          <h2 class="text-xl font-bold text-slate-800">
            Delete Request?
          </h2>

          <p class="mt-3 leading-6 text-slate-500">
            Are you sure you want to delete this request?
            This action cannot be undone.
          </p>

          <div class="mt-6 flex justify-end gap-3">

            <button
              @click="showDeleteConfirm = false"
              class="rounded-lg bg-slate-100 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              @click="deleteRequest"
              :disabled="loading"
              class="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {{ loading ? 'Deleting...' : 'Delete' }}
            </button>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>