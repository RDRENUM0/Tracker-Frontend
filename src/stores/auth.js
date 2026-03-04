import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))

  const isAuthenticated = computed(() => !!accessToken.value)

  // Konfiguracja axios z interceptorem dla tokena
  const api = axios.create({
    baseURL: API_URL,
  })

  api.interceptors.request.use((config) => {
    if (accessToken.value) {
      config.headers.Authorization = `Bearer ${accessToken.value}`
    }
    return config
  })

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response.status === 401 && refreshToken.value) {
        try {
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken.value
          })
          accessToken.value = response.data.access
          localStorage.setItem('accessToken', response.data.access)
          error.config.headers.Authorization = `Bearer ${response.data.access}`
          return api.request(error.config)
        } catch (refreshError) {
          logout()
          return Promise.reject(refreshError)
        }
      }
      return Promise.reject(error)
    }
  )

  async function login(credentials) {
    try {
      const response = await api.post('/login/', credentials)
      user.value = response.data.user
      accessToken.value = response.data.tokens.access
      refreshToken.value = response.data.tokens.refresh
      
      localStorage.setItem('accessToken', response.data.tokens.access)
      localStorage.setItem('refreshToken', response.data.tokens.refresh)
      
      return response.data
    } catch (error) {
      throw error.response.data
    }
  }

  async function register(userData) {
    try {
      const response = await api.post('/register/', userData)
      user.value = response.data.user
      accessToken.value = response.data.tokens.access
      refreshToken.value = response.data.tokens.refresh
      
      localStorage.setItem('accessToken', response.data.tokens.access)
      localStorage.setItem('refreshToken', response.data.tokens.refresh)
      
      return response.data
    } catch (error) {
      throw error.response.data
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await api.post('/logout/', { refresh_token: refreshToken.value })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  async function fetchProfile() {
    try {
      const response = await api.get('/profile/')
      user.value = response.data
      return response.data
    } catch (error) {
      throw error.response.data
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    register,
    logout,
    fetchProfile
  }
})