import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import DailyEntryForm from '../views/DailyEntryForm.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/daily-entry',
    name: 'DailyEntry',
    component: DailyEntryForm,
    meta: { requiresAuth: true }
  },

  {
    path: '/day/:date',
    name: 'DayDetails',
    component: () => import('../views/DayDetails.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard chroniący przed dostępem bez logowania
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router