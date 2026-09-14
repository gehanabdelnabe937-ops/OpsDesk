<template>
  <aside
    class="hidden min-h-screen w-64 shrink-0 flex-col bg-slate-900 p-5 text-white md:flex"
  >

    <!-- Logo -->
    <div class="mb-10">
      <h1 class="text-2xl font-bold">
        OpsDesk
      </h1>

      <p class="mt-1 text-sm text-slate-400">
        Operations Management
      </p>
    </div>


    <!-- Main -->
    <div>
      <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Main
      </p>

      <nav class="space-y-2">

        <RouterLink
          to="/dashboard"
          class="block rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Dashboard
        </RouterLink>

        <RouterLink
          to="/requests"
          class="block rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Requests
        </RouterLink>

        <RouterLink
          to="/team"
          class="block rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Team
        </RouterLink>

      </nav>
    </div>


    <!-- Management -->
    <div class="mt-8">

      <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Management
      </p>

      <nav class="space-y-2">

        <RouterLink
          to="/smart-operations"
          class="block rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Smart Operations
        </RouterLink>

        <RouterLink
          to="/reports"
          class="block rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Reports
        </RouterLink>

      </nav>

    </div>


    <!-- System -->
    <div class="mt-8">

      <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        System
      </p>

      <nav class="space-y-2">

        <RouterLink
          to="/settings"
          class="block rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Settings
        </RouterLink>

      </nav>

    </div>


    <!-- Bottom -->
    <div class="mt-auto border-t border-slate-800 pt-5">

      <div class="rounded-lg bg-slate-800 p-4">

        <p class="text-sm font-medium">
          OpsDesk
        </p>

        <p class="mt-1 text-xs text-slate-400">
          Company Operations
        </p>

      </div>

    </div>

  </aside>
</template>