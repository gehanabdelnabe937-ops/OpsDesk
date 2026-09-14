 <script setup>
import { ref, computed, onMounted } from 'vue'
import { useRequestStore } from '../stores/requestStore'

const requestStore = useRequestStore()

const team = ref([])
const automationActionsCount = ref(0)
const actionLog = ref([])

/* =========================
   Critical Issues Detection
========================= */

const urgentRequests = computed(() => {
  return requestStore.requests.filter(request =>
    request.priority === 'Urgent' &&
    request.status !== 'Resolved'
  )
})

const highPriorityRequests = computed(() => {
  return requestStore.requests.filter(request =>
    request.priority === 'High' &&
    request.status !== 'Resolved'
  )
})

/* =========================
   Unassigned Requests
========================= */

const unassignedRequests = computed(() => {
  return requestStore.requests.filter(request =>
    request.assignee === 'Unassigned' &&
    request.status !== 'Resolved'
  )
})

/* =========================
   Workload Analysis
========================= */

const workloadAnalysis = computed(() => {
  return team.value.map(employee => {

    const activeRequests =
      requestStore.requests.filter(request =>
        request.assignee === employee.name &&
        request.status !== 'Resolved'
      )

    const urgentCount =
      activeRequests.filter(request =>
        request.priority === 'Urgent'
      ).length

    const highCount =
      activeRequests.filter(request =>
        request.priority === 'High'
      ).length

    const mediumCount =
      activeRequests.filter(request =>
        request.priority === 'Medium'
      ).length

    const lowCount =
      activeRequests.filter(request =>
        request.priority === 'Low'
      ).length

    /*
      Workload Score

      Active request = 1 point
      High = +1
      Urgent = +2
    */

    const score =
      activeRequests.length +
      highCount +
      urgentCount * 2

    let status = 'Healthy'

    if (score >= 10 || activeRequests.length >= 7) {
      status = 'Overloaded'
    } else if (score >= 6 || activeRequests.length >= 4) {
      status = 'Busy'
    }

    return {
      id: employee.id,
      name: employee.name,
      activeCount: activeRequests.length,
      urgentCount,
      highCount,
      mediumCount,
      lowCount,
      score,
      status
    }
  })
})

const overloadedEmployees = computed(() => {
  return workloadAnalysis.value
    .filter(employee =>
      employee.status === 'Overloaded'
    )
    .sort((a, b) =>
      b.score - a.score
    )
})

const busyEmployees = computed(() => {
  return workloadAnalysis.value
    .filter(employee =>
      employee.status === 'Busy'
    )
    .sort((a, b) =>
      b.score - a.score
    )
})

const overloadedEmployee = computed(() => {
  return overloadedEmployees.value[0] || null
})

/* =========================
   Best Employee
========================= */

const bestEmployee = computed(() => {
  if (workloadAnalysis.value.length === 0) {
    return null
  }

  return [...workloadAnalysis.value]
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score
      }

      return a.activeCount - b.activeCount
    })[0]
})

/* =========================
   Team Statistics
========================= */

const totalActiveRequests = computed(() => {
  return requestStore.requests.filter(request =>
    request.status !== 'Resolved'
  ).length
})

const totalUrgentRequests = computed(() => {
  return urgentRequests.value.length
})

const totalHighRequests = computed(() => {
  return highPriorityRequests.value.length
})

const healthyEmployees = computed(() => {
  return workloadAnalysis.value.filter(employee =>
    employee.status === 'Healthy'
  ).length
})

/* =========================
   Smart Priority Prediction
========================= */

const priorityLevels = {
  Low: 1,
  Medium: 2,
  High: 3,
  Urgent: 4
}

const urgentKeywords = [
  'متوقف بالكامل',
  'متوقف عن العمل',
  'توقف كامل',
  'لا يعمل نهائيًا',
  'عطل كامل',
  'كل الموظفين',
  'كل المستخدمين',
  'لا احد يستطيع',
  'لا أحد يستطيع',
  'اختراق',
  'تسريب بيانات',
  'ثغرة أمنية',
  'system down',
  'production down',
  'complete outage',
  'not working at all',
  'down for everyone',
  'security breach',
  'data breach',
  'system outage',
  'critical outage'
]

const highKeywords = [
  'عطل',
  'خطأ',
  'فشل',
  'مشكلة',
  'متوقف',
  'لا يعمل',
  'لا استطيع',
  'لا أستطيع',
  'blocked',
  'error',
  'failed',
  'failure',
  'problem',
  'issue',
  'unable',
  'cannot',
  'crash',
  'broken',
  'timeout'
]

const securityKeywords = [
  'اختراق',
  'هجوم',
  'تسريب',
  'بيانات مسربة',
  'سرقة بيانات',
  'security',
  'breach',
  'hacked',
  'attack',
  'leak'
]

function suggestPriority(request) {

  const text =
    `${request.title || ''} ${request.description || ''}`
      .toLowerCase()

  const urgentMatch =
    urgentKeywords.find(keyword =>
      text.includes(keyword.toLowerCase())
    )

  if (
    urgentMatch &&
    priorityLevels[request.priority] <
      priorityLevels.Urgent
  ) {
    return {
      suggested: 'Urgent',
      reason:
        `تم رصد مؤشر خطورة شديد: "${urgentMatch}"`
    }
  }

  const securityMatch =
    securityKeywords.find(keyword =>
      text.includes(keyword.toLowerCase())
    )

  if (
    securityMatch &&
    priorityLevels[request.priority] <
      priorityLevels.Urgent
  ) {
    return {
      suggested: 'Urgent',
      reason:
        `تم رصد مؤشر أمني حساس: "${securityMatch}"`
    }
  }

  const highMatch =
    highKeywords.find(keyword =>
      text.includes(keyword.toLowerCase())
    )

  if (
    highMatch &&
    priorityLevels[request.priority] <
      priorityLevels.High
  ) {
    return {
      suggested: 'High',
      reason:
        `تم رصد مؤشر لمشكلة مؤثرة: "${highMatch}"`
    }
  }

  return null
}

const priorityRecommendations = computed(() => {

  const result = []

  requestStore.requests.forEach(request => {

    if (request.status === 'Resolved') {
      return
    }

    const suggestion =
      suggestPriority(request)

    if (suggestion) {

      result.push({
        request,
        currentPriority: request.priority,
        suggestedPriority: suggestion.suggested,
        reason: suggestion.reason
      })

    }
  })

  return result
})

async function applyRecommendation(
  recommendation
) {

  const success =
    await requestStore.updatePriority(
      recommendation.request.id,
      recommendation.suggestedPriority
    )

  if (!success) {
    return
  }

  automationActionsCount.value++

  addActionLog(
    'Priority',
    `Priority changed for "${recommendation.request.title}"`,
    `${recommendation.currentPriority} → ${recommendation.suggestedPriority}`
  )

  requestStore.success =
    'Priority recommendation applied'

  clearMessagesLater()
}

/* =========================
   System Health
========================= */

const systemHealth = computed(() => {

  const urgentCount =
    urgentRequests.value.length

  const unassignedCount =
    unassignedRequests.value.length

  const overloadedCount =
    overloadedEmployees.value.length

  const priorityRiskCount =
    priorityRecommendations.value.length

  let score = 100

  score -= urgentCount * 15
  score -= unassignedCount * 5
  score -= overloadedCount * 10
  score -= priorityRiskCount * 3

  score = Math.max(0, score)

  let level = 'healthy'
  let label = 'Healthy'
  let icon = '🟢'

  if (score < 50) {
    level = 'critical'
    label = 'Critical'
    icon = '🔴'
  } else if (score < 80) {
    level = 'warning'
    label = 'Needs Attention'
    icon = '🟡'
  }

  return {
    score,
    level,
    label,
    icon
  }
})

/* =========================
   Action Log
========================= */

function addActionLog(
  type,
  title,
  description
) {

  actionLog.value.unshift({
    id: Date.now() + Math.random(),
    type,
    title,
    description,
    time: new Date().toLocaleTimeString()
  })

  if (actionLog.value.length > 30) {
    actionLog.value.pop()
  }
}

function clearActionLog() {
  actionLog.value = []
}

/* =========================
   Messages
========================= */

function clearMessagesLater() {

  setTimeout(() => {
    requestStore.clearMessages()
  }, 2500)
}

/* =========================
   Team
========================= */

async function getTeam() {

  try {

    const response =
      await fetch(
        'https://dummyjson.com/users'
      )

    if (!response.ok) {
      throw new Error('Failed to load team')
    }

    const data =
      await response.json()

    team.value =
      data.users.map(user => ({
        id: user.id,
        name:
          `${user.firstName} ${user.lastName}`
      }))

  } catch (error) {

    requestStore.error =
      'Failed to load team'

  }
}

/* =========================
   Smart Workload Redistribution
   (Overloaded employees — brings them down to 5)
========================= */

const priorityOrder = {
  Urgent: 1,
  High: 2,
  Medium: 3,
  Low: 4
}

async function redistributeEmployeeWorkload(
  employeeName
) {

  const employeeRequests =
    requestStore.requests.filter(request =>
      request.assignee === employeeName &&
      request.status !== 'Resolved'
    )

  const excessCount =
    employeeRequests.length - 5

  if (excessCount <= 0) {
    return 0
  }

  const requestsToMove =
    employeeRequests
      .sort((a, b) =>
        priorityOrder[a.priority] -
        priorityOrder[b.priority]
      )
      .slice(0, excessCount)

  let movedCount = 0

  for (const request of requestsToMove) {

    const workload =
      team.value
        .filter(employee =>
          employee.name !== employeeName
        )
        .map(employee => {

          const assignedRequests =
            requestStore.requests.filter(item =>
              item.assignee === employee.name &&
              item.status !== 'Resolved'
            )

          return {
            employee,
            count: assignedRequests.length
          }

        })

    workload.sort((a, b) =>
      a.count - b.count
    )

    const target = workload[0]

    if (target) {

      const success =
        await requestStore.updateAssignee(
          request.id,
          target.employee.name
        )

      if (success) {

        movedCount++
        automationActionsCount.value++

        addActionLog(
          'Redistribution',
          `Request redistributed`,
          `"${request.title}" moved from ${employeeName} to ${target.employee.name}`
        )

      }

    }

  }

  return movedCount
}

async function redistributeWorkload(
  employeeName
) {

  const targetName =
    employeeName ||
    overloadedEmployee.value?.name

  if (!targetName) {
    return
  }

  await getTeam()

  const moved =
    await redistributeEmployeeWorkload(
      targetName
    )

  requestStore.success =
    moved > 0
      ? `${moved} request(s) redistributed successfully`
      : 'No requests needed redistribution'

  clearMessagesLater()
}

/* =========================
   Optimize Workload
   (Busy employees — moves just one request off them)
========================= */

async function optimizeEmployeeWorkload(
  employeeName
) {

  const employeeRequests =
    requestStore.requests.filter(request =>
      request.assignee === employeeName &&
      request.status !== 'Resolved'
    )

  if (employeeRequests.length === 0) {
    return false
  }

  // ننقل أقل طلب أهمية الأول عشان منأثرش على الطلبات الحرجة
  const requestToMove =
    [...employeeRequests].sort((a, b) => {
      return (
        priorityOrder[b.priority] -
        priorityOrder[a.priority]
      )
    })[0]

  const target =
    workloadAnalysis.value
      .filter(employee =>
        employee.name !== employeeName
      )
      .sort((a, b) =>
        a.score - b.score
      )[0]

  if (!target) {
    return false
  }

  const success =
    await requestStore.updateAssignee(
      requestToMove.id,
      target.name
    )

  if (!success) {
    return false
  }

  automationActionsCount.value++

  addActionLog(
    'Optimization',
    'Workload optimized',
    `"${requestToMove.title}" moved from ${employeeName} to ${target.name}`
  )

  return true
}

async function optimizeWorkload(
  employeeName
) {

  await getTeam()

  const optimized =
    await optimizeEmployeeWorkload(
      employeeName
    )

  requestStore.success =
    optimized
      ? 'Workload optimized successfully'
      : 'No requests available to optimize'

  clearMessagesLater()
}

/* =========================
   Smart Auto Assignment
========================= */

async function autoAssignUrgentRequests() {

  const savedSettings =
    localStorage.getItem(
      'opsdesk-settings'
    )

  if (!savedSettings) {
    return false
  }

  const settings =
    JSON.parse(savedSettings)

  if (!settings.autoAssignment) {
    return false
  }

  let assignedCount = 0

  for (const request of requestStore.requests) {

    if (
      request.status !== 'Resolved' &&
      request.priority === 'Urgent' &&
      request.assignee === 'Unassigned'
    ) {

      const workload =
        workloadAnalysis.value
          .map(employee => ({
            employee,
            count: employee.score
          }))

      workload.sort((a, b) =>
        a.count - b.count
      )

      const target =
        workload[0]

      if (target) {

        const success =
          await requestStore.updateAssignee(
            request.id,
            target.employee.name
          )

        if (success) {

          assignedCount++
          automationActionsCount.value++

          addActionLog(
            'Auto Assignment',
            `Urgent request assigned`,
            `"${request.title}" assigned to ${target.employee.name}`
          )

        }

      }

    }

  }

  return assignedCount
}

async function handleUrgentAction() {

  await getTeam()

  const assigned =
    await autoAssignUrgentRequests()

  if (assigned === false) {

    requestStore.error =
      'Auto Assignment is disabled — enable it in settings first'

    clearMessagesLater()

    return
  }

  requestStore.success =
    assigned > 0
      ? `${assigned} urgent request(s) assigned automatically`
      : 'No unassigned urgent requests to act on'

  clearMessagesLater()
}

/* =========================
   Auto Assign (single unassigned request)
========================= */

async function autoAssignRequest(request) {

  await getTeam()

  if (workloadAnalysis.value.length === 0) {

    requestStore.error =
      'No team data available'

    clearMessagesLater()

    return
  }

  const target =
    [...workloadAnalysis.value].sort((a, b) => {
      return a.score - b.score
    })[0]

  const success =
    await requestStore.updateAssignee(
      request.id,
      target.name
    )

  if (!success) {
    return
  }

  automationActionsCount.value++

  addActionLog(
    'Auto Assignment',
    'Request assigned',
    `"${request.title}" assigned to ${target.name}`
  )

  requestStore.success =
    `Assigned to ${target.name}`

  clearMessagesLater()
}

/* =========================
   Run Automation
========================= */

async function runAutomation() {

  await getTeam()

  const assigned =
    await autoAssignUrgentRequests()

  if (assigned === false) {

    requestStore.error =
      'Auto Assignment is disabled'

    return
  }

  requestStore.success =
    assigned > 0
      ? `${assigned} urgent request(s) assigned automatically`
      : 'No urgent requests needed assignment'

  clearMessagesLater()
}

/* =========================
   Run Smart Automation
========================= */

async function runSmartAutomation() {

  requestStore.clearMessages()

  await getTeam()

  let totalActions = 0

  /* 1. Auto Assignment */

  const savedSettings =
    localStorage.getItem(
      'opsdesk-settings'
    )

  const settings =
    savedSettings
      ? JSON.parse(savedSettings)
      : {}

  if (settings.autoAssignment) {

    const assigned =
      await autoAssignUrgentRequests()

    if (assigned !== false) {
      totalActions += assigned
    }

  }

  /* 2. Workload Redistribution */

  const employeesToRebalance =
    [...overloadedEmployees.value]

  for (
    const employee of employeesToRebalance
  ) {

    const moved =
      await redistributeEmployeeWorkload(
        employee.name
      )

    totalActions += moved
  }

  /* 3. Priority Recommendations */

  const recommendationsToApply =
    [...priorityRecommendations.value]

  for (
    const recommendation
    of recommendationsToApply
  ) {

    const success =
      await requestStore.updatePriority(
        recommendation.request.id,
        recommendation.suggestedPriority
      )

    if (success) {

      totalActions++
      automationActionsCount.value++

      addActionLog(
        'Priority Automation',
        `Priority upgraded`,
        `"${recommendation.request.title}" changed from ${recommendation.currentPriority} to ${recommendation.suggestedPriority}`
      )

    }

  }

  requestStore.success =
    totalActions > 0
      ? `Smart automation completed — ${totalActions} action(s) performed`
      : 'Smart automation completed — no actions were needed'

  clearMessagesLater()
}

/* =========================
   Smart Recommendations
========================= */

const recommendations = computed(() => {

  const result = []

  if (urgentRequests.value.length > 0) {

    result.push({
      type: 'urgent',
      title: 'Urgent requests need attention',
      description:
        `${urgentRequests.value.length} urgent request(s) are still unresolved.`,
      actionLabel: 'Take Action',
      onAction: handleUrgentAction
    })

  }

  if (unassignedRequests.value.length > 0) {

    result.push({
      type: 'warning',
      title: 'Unassigned requests detected',
      description:
        `${unassignedRequests.value.length} request(s) have no assigned employee.`
    })

  }

  if (highPriorityRequests.value.length >= 3) {

    result.push({
      type: 'warning',
      title: 'High priority workload',
      description:
        'There are several high-priority requests that need monitoring.'
    })

  }

  overloadedEmployees.value.forEach(employee => {

    result.push({
      type: 'warning',
      title: `${employee.name} is overloaded`,
      description:
        `${employee.name} has ${employee.activeCount} active requests with a workload score of ${employee.score}.`,
      actionLabel: 'Optimize',
      onAction: () => redistributeWorkload(employee.name)
    })

  })

  if (
    bestEmployee.value &&
    unassignedRequests.value.length > 0
  ) {

    result.push({
      type: 'success',
      title: 'Best employee identified',
      description:
        `${bestEmployee.value.name} currently has the lowest workload score (${bestEmployee.value.score}) and is the best candidate for a new request.`
    })

  }

  priorityRecommendations.value.forEach(
    recommendation => {

      result.push({
        type: 'urgent',
        title:
          `Priority upgrade suggested: ${recommendation.request.title}`,
        description:
          `${recommendation.currentPriority} → ${recommendation.suggestedPriority}. ${recommendation.reason}`,
        actionLabel: 'Apply',
        onAction: () => applyRecommendation(recommendation)
      })

    }
  )

  if (result.length === 0) {

    result.push({
      type: 'success',
      title: 'Operations look healthy',
      description:
        'No critical workload problems were detected.'
    })

  }

  return result
})

/* =========================
   Mounted
========================= */

onMounted(async () => {

  if (
    requestStore.requests.length === 0
  ) {
    await requestStore.getRequests()
  }

  await getTeam()

})
</script>

<template>

  <div class="space-y-8">

    <!-- Header -->

    <div
      class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
    >

      <div>

        <h1
          class="text-3xl font-bold text-slate-800"
        >
          Smart Operations
        </h1>

        <p class="mt-1 text-slate-500">
          Intelligent operational monitoring,
          workload analysis and automation
        </p>

      </div>


      <!-- System Health -->

      <div
        class="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-sm"
        :class="{
          'ring-1 ring-red-200':
            systemHealth.level === 'critical',

          'ring-1 ring-yellow-200':
            systemHealth.level === 'warning',

          'ring-1 ring-green-200':
            systemHealth.level === 'healthy'
        }"
      >

        <span>
          {{ systemHealth.icon }}
        </span>

        <div>

          <p
            class="text-sm font-semibold text-slate-700"
          >
            {{ systemHealth.label }}
          </p>

          <p class="text-xs text-slate-400">
            Health Score: {{ systemHealth.score }}/100
          </p>

        </div>

      </div>

    </div>


    <!-- Loading -->

    <div
      v-if="requestStore.loading"
      class="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm"
    >
      Analyzing operations...
    </div>


    <div
      v-else
      class="space-y-8"
    >

      <!-- Statistics -->

      <div
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-5"
      >

        <div
          class="rounded-xl bg-white p-6 shadow-sm"
        >

          <p class="text-sm text-slate-500">
            Critical Requests
          </p>

          <p
            class="mt-2 text-3xl font-bold text-red-600"
          >
            {{ urgentRequests.length }}
          </p>

        </div>


        <div
          class="rounded-xl bg-white p-6 shadow-sm"
        >

          <p class="text-sm text-slate-500">
            Unassigned
          </p>

          <p
            class="mt-2 text-3xl font-bold text-blue-600"
          >
            {{ unassignedRequests.length }}
          </p>

        </div>


        <div
          class="rounded-xl bg-white p-6 shadow-sm"
        >

          <p class="text-sm text-slate-500">
            Overloaded Employees
          </p>

          <p
            class="mt-2 text-3xl font-bold text-orange-500"
          >
            {{ overloadedEmployees.length }}
          </p>

        </div>


        <div
          class="rounded-xl bg-white p-6 shadow-sm"
        >

          <p class="text-sm text-slate-500">
            Priority Recommendations
          </p>

          <p
            class="mt-2 text-3xl font-bold text-purple-600"
          >
            {{ priorityRecommendations.length }}
          </p>

        </div>


        <div
          class="rounded-xl bg-white p-6 shadow-sm"
        >

          <p class="text-sm text-slate-500">
            Automation Actions
          </p>

          <p
            class="mt-2 text-3xl font-bold text-slate-800"
          >
            {{ automationActionsCount }}
          </p>

        </div>

      </div>


      <!-- Team Overview -->

      <div
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >

        <div
          class="rounded-xl bg-white p-6 shadow-sm"
        >

          <p class="text-sm text-slate-500">
            Active Requests
          </p>

          <p
            class="mt-2 text-2xl font-bold text-slate-800"
          >
            {{ totalActiveRequests }}
          </p>

        </div>


        <div
          class="rounded-xl bg-white p-6 shadow-sm"
        >

          <p class="text-sm text-slate-500">
            Urgent
          </p>

          <p
            class="mt-2 text-2xl font-bold text-red-600"
          >
            {{ totalUrgentRequests }}
          </p>

        </div>


        <div
          class="rounded-xl bg-white p-6 shadow-sm"
        >

          <p class="text-sm text-slate-500">
            High Priority
          </p>

          <p
            class="mt-2 text-2xl font-bold text-orange-500"
          >
            {{ totalHighRequests }}
          </p>

        </div>


        <div
          class="rounded-xl bg-white p-6 shadow-sm"
        >

          <p class="text-sm text-slate-500">
            Healthy Employees
          </p>

          <p
            class="mt-2 text-2xl font-bold text-green-600"
          >
            {{ healthyEmployees }}
          </p>

        </div>

      </div>


      <!-- Automation -->

      <div
        class="flex flex-col justify-between gap-4 rounded-xl bg-slate-900 p-6 sm:flex-row sm:items-center"
      >

        <div>

          <h2
            class="text-lg font-bold text-white"
          >
            Smart Automation
          </h2>

          <p
            class="mt-1 text-sm text-slate-400"
          >
            Automatically assign, redistribute and optimize requests.
          </p>

        </div>


        <button
          @click="runSmartAutomation"
          class="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          ⚡ Run Smart Automation
        </button>

      </div>


      <!-- Messages -->

      <div
        v-if="requestStore.success"
        class="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700"
      >
        {{ requestStore.success }}
      </div>


      <div
        v-if="requestStore.error"
        class="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700"
      >
        {{ requestStore.error }}
      </div>


      <!-- Workload Analysis -->

      <div
        class="rounded-xl bg-white p-6 shadow-sm"
      >

        <div
          class="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
        >

          <div>

            <h2
              class="text-xl font-bold text-slate-800"
            >
              Smart Workload Analysis
            </h2>

            <p
              class="mt-1 text-sm text-slate-500"
            >
              AI-style rule-based workload evaluation for every employee
            </p>

          </div>


          <div
            v-if="bestEmployee"
            class="rounded-lg bg-green-50 px-4 py-3"
          >

            <p
              class="text-xs font-semibold text-green-600"
            >
              Best Candidate
            </p>

            <p
              class="mt-1 font-bold text-green-700"
            >
              {{ bestEmployee.name }}
            </p>

          </div>

        </div>


        <div
          v-if="workloadAnalysis.length === 0"
          class="rounded-lg bg-slate-50 p-6 text-center text-slate-400"
        >
          No team data available
        </div>


        <div
          v-else
          class="overflow-x-auto"
        >

          <table
            class="w-full min -w-[950px] text-left"
          >

            <thead>

              <tr
                class="border-b border-slate-100 text-sm text-slate-500"
              >

                <th class="px-4 py-3">
                  Employee
                </th>

                <th class="px-4 py-3">
                  Active
                </th>

                <th class="px-4 py-3">
                  Urgent
                </th>

                <th class="px-4 py-3">
                  High
                </th>

                <th class="px-4 py-3">
                  Score
                </th>

                <th class="px-4 py-3">
                  Status
                </th>

                <th class="px-4 py-3">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              <tr
                v-for="employee in workloadAnalysis"
                :key="employee.id"
                class="border-b border-slate-50 last:border-0"
              >

                <td
                  class="px-4 py-4 font-semibold text-slate-800"
                >
                  {{ employee.name }}
                </td>


                <td
                  class="px-4 py-4 text-slate-600"
                >
                  {{ employee.activeCount }}
                </td>


                <td
                  class="px-4 py-4 font-semibold text-red-600"
                >
                  {{ employee.urgentCount }}
                </td>


                <td
                  class="px-4 py-4 font-semibold text-orange-500"
                >
                  {{ employee.highCount }}
                </td>


                <td
                  class="px-4 py-4 font-bold text-slate-800"
                >
                  {{ employee.score }}
                </td>


                <td class="px-4 py-4">

                  <span
                    v-if="employee.status === 'Overloaded'"
                    class="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                  >
                    Overloaded
                  </span>

                  <span
                    v-else-if="employee.status === 'Busy'"
                    class="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"
                  >
                    Busy
                  </span>

                  <span
                    v-else
                    class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                  >
                    Healthy
                  </span>

                </td>


                <td class="px-4 py-4">

                  <button
                    v-if="employee.status === 'Overloaded'"
                    @click="redistributeWorkload(employee.name)"
                    class="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700"
                  >
                    Redistribute
                  </button>

                  <button
                    v-else-if="employee.status === 'Busy'"
                    @click="optimizeWorkload(employee.name)"
                    class="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-yellow-600"
                  >
                    Optimize Workload
                  </button>

                  <span
                    v-else
                    class="text-xs text-slate-300"
                  >
                    —
                  </span>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <!-- Overloaded Employees -->

      <div
        v-if="overloadedEmployees.length > 0"
        class="space-y-4"
      >

        <div
          v-for="employee in overloadedEmployees"
          :key="employee.id"
          class="rounded-xl border border-orange-200 bg-orange-50 p-6 shadow-sm"
        >

          <div
            class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >

            <div>

              <p
                class="text-sm font-semibold text-orange-600"
              >
                Overloaded Employee
              </p>

              <h2
                class="mt-2 text-xl font-bold text-slate-800"
              >
                {{ employee.name }}
              </h2>

              <p
                class="mt-1 text-sm text-slate-500"
              >
                {{ employee.activeCount }} active requests ·
                Workload Score {{ employee.score }}
              </p>

            </div>


            <div
              class="flex flex-col items-center gap-2 rounded-lg bg-white px-5 py-4 text-center shadow-sm"
            >

              <p
                class="text-2xl font-bold text-orange-600"
              >
                {{ employee.activeCount }}
              </p>

              <p
                class="text-xs text-slate-500"
              >
                Active Requests
              </p>

              <button
                @click="redistributeWorkload(employee.name)"
                class="mt-2 rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-700"
              >
                Redistribute
              </button>

            </div>

          </div>

        </div>

      </div>


      <!-- No Overloaded Employees -->

      <div
        v-else
        class="rounded-xl bg-white p-6 text-center shadow-sm"
      >

        <p
          class="font-semibold text-green-600"
        >
          No overloaded employees detected
        </p>

        <p
          class="mt-1 text-sm text-slate-500"
        >
          Team workload is currently within the normal range.
        </p>

      </div>


      <!-- Unassigned Requests -->

      <div
        class="rounded-xl bg-white p-6 shadow-sm"
      >

        <div class="mb-5">

          <h2
            class="text-xl font-bold text-slate-800"
          >
            Unassigned Requests
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Requests waiting for an owner
          </p>

        </div>


        <div
          v-if="unassignedRequests.length === 0"
          class="rounded-lg bg-slate-50 p-6 text-center text-slate-400"
        >
          No unassigned requests
        </div>


        <div
          v-else
          class="space-y-3"
        >

          <div
            v-for="request in unassignedRequests"
            :key="request.id"
            class="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-4"
          >

            <div>

              <p
                class="font-semibold text-slate-800"
              >
                {{ request.title }}
              </p>

              <p
                class="mt-1 text-sm text-slate-500"
              >
                {{ request.department }}
                ·
                {{ request.priority }}
              </p>

            </div>


            <button
              @click="autoAssignRequest(request)"
              class="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Auto Assign
            </button>

          </div>

        </div>

      </div>


      <!-- Smart Priority Prediction -->

      <div
        v-if="priorityRecommendations.length > 0"
        class="rounded-xl bg-white p-6 shadow-sm"
      >

        <div class="mb-5">

          <h2
            class="text-xl font-bold text-slate-800"
          >
            Smart Priority Prediction
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Rule-based analysis of request title and description
          </p>

        </div>


        <div class="space-y-3">

          <div
            v-for="recommendation in priorityRecommendations"
            :key="recommendation.request.id"
            class="flex flex-col gap-3 rounded-lg border border-purple-100 bg-purple-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >

            <div>

              <p
                class="font-semibold text-slate-800"
              >
                {{ recommendation.request.title }}
              </p>

              <p
                class="mt-1 text-sm text-slate-600"
              >
                {{ recommendation.currentPriority }}
                →
                {{ recommendation.suggestedPriority }}
              </p>

              <p
                class="mt-1 text-xs text-slate-500"
              >
                {{ recommendation.reason }}
              </p>

            </div>


            <button
              @click="applyRecommendation(recommendation)"
              class="shrink-0 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
            >
              Apply Recommendation
            </button>

          </div>

        </div>

      </div>


      <!-- Smart Recommendations -->

      <div
        class="rounded-xl bg-white p-6 shadow-sm"
      >

        <div class="mb-6">

          <h2
            class="text-xl font-bold text-slate-800"
          >
            Smart Recommendations
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Automated operational insights
          </p>

        </div>


        <div class="space-y-4">

          <div
            v-for="(recommendation, index) in recommendations"
            :key="`${recommendation.title}-${index}`"
            class="flex flex-col gap-4 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
          >

            <div class="flex items-start gap-4">

              <div
                v-if="recommendation.type === 'urgent'"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"
              >
                !
              </div>


              <div
                v-else-if="recommendation.type === 'warning'"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600"
              >
                !
              </div>


              <div
                v-else
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600"
              >
                ✓
              </div>


              <div>

                <h3
                  class="font-semibold text-slate-800"
                >
                  {{ recommendation.title }}
                </h3>

                <p
                  class="mt-1 text-sm text-slate-500"
                >
                  {{ recommendation.description }}
                </p>

              </div>

            </div>


            <button
              v-if="recommendation.actionLabel"
              @click="recommendation.onAction"
              class="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              {{ recommendation.actionLabel }}
            </button>

          </div>

        </div>

      </div>


      <!-- Action Log -->

      <div
        class="rounded-xl bg-white p-6 shadow-sm"
      >

        <div
          class="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
        >

          <div>

            <h2
              class="text-xl font-bold text-slate-800"
            >
              Smart Action Log
            </h2>

            <p
              class="mt-1 text-sm text-slate-500"
            >
              History of automated operational actions
            </p>

          </div>


          <button
            v-if="actionLog.length > 0"
            @click="clearActionLog"
            class="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Clear Log
          </button>

        </div>


        <div
          v-if="actionLog.length === 0"
          class="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-400"
        >
          No automation actions have been performed yet.
        </div>


        <div
          v-else
          class="space-y-3"
        >

          <div
            v-for="action in actionLog"
            :key="action.id"
            class="flex flex-col gap-2 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
          >

            <div>

              <div
                class="flex flex-wrap items-center gap-2"
              >

                <span
                  class="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600"
                >
                  {{ action.type }}
                </span>

                <span
                  class="text-xs text-slate-400"
                >
                  {{ action.time }}
                </span>

              </div>


              <p
                class="mt-2 font-semibold text-slate-800"
              >
                {{ action.title }}
              </p>

              <p
                class="mt-1 text-sm text-slate-500"
              >
                {{ action.description }}
              </p>

            </div>

          </div>

        </div>

      </div>


      <!-- Requests Requiring Attention -->

      <div
        class="rounded-xl bg-white p-6 shadow-sm"
      >

        <div class="mb-5">

          <h2
            class="text-xl font-bold text-slate-800"
          >
            Requests Requiring Attention
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Critical requests that are still unresolved
          </p>

        </div>


        <div
          v-if="urgentRequests.length === 0"
          class="rounded-lg bg-slate-50 p-6 text-center text-slate-400"
        >
          No urgent requests
        </div>


        <div
          v-else
          class="space-y-3"
        >

          <div
            v-for="request in urgentRequests"
            :key="request.id"
            class="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-4"
          >

            <div>

              <p
                class="font-semibold text-slate-800"
              >
                {{ request.title }}
              </p>

              <p
                class="mt-1 text-sm text-slate-500"
              >
                {{ request.department }}
                ·
                {{ request.assignee }}
              </p>

            </div>


            <span
              class="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
            >
              Urgent
            </span>

          </div>

        </div>

      </div>

    </div>

  </div>

</template>