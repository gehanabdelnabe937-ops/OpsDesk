import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Requests from '../views/Requests.vue'
import RequestDetails from '../views/RequestDetails.vue'
import SmartOperations from '../views/SmartOperations.vue'
import Reports from '../views/Reports.vue'
import Team from '../views/Team.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/login',
      component: Login
    },

    {
      path: '/',
      redirect: '/dashboard'
    },

    {
      path: '/dashboard',
      component: Dashboard
    },

    {
      path: '/requests',
      component: Requests
    },

    {
      path: '/requests/:id',
      component: RequestDetails
    },

    {
      path: '/team',
      component: Team
    },

    {
      path: '/smart-operations',
      component: SmartOperations
    },

    {
      path: '/reports',
      component: Reports
    },

    {
      path: '/settings',
      component: Settings
    }
  ]
})

router.beforeEach((to) => {
  const isLoggedIn =
    localStorage.getItem('opsdesk-auth') === 'true'

  if (to.path !== '/login' && !isLoggedIn) {
    return '/login'
  }

  if (to.path === '/login' && isLoggedIn) {
    return '/dashboard'
  }
})

export default router