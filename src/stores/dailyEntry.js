import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useDailyEntryStore = defineStore('dailyEntry', () => {
  const entries = ref([])
  const todayEntry = ref(null)

    const api = axios.create({
    baseURL: 'http://localhost:8000/api/auth/',  // DODAJ /auth/
    })

  // Interceptor do dodawania tokena (możesz użyć tego z auth store)
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  async function fetchTodayEntry() {
    const today = new Date().toISOString().split('T')[0]
    try {
      const response = await api.get(`/daily-entries/by_date/?date=${today}`)
      todayEntry.value = response.data
    } catch (error) {
      if (error.response && error.response.status === 404) {
        todayEntry.value = null
      } else {
        throw error
      }
    }
  }

  async function createOrUpdateEntry(entryData) {
    const today = new Date().toISOString().split('T')[0]
    entryData.date = today

    if (todayEntry.value) {
      // Update
      const response = await api.put(`/daily-entries/${todayEntry.value.id}/`, entryData)
      todayEntry.value = response.data
    } else {
      // Create
      const response = await api.post('/daily-entries/', entryData)
      todayEntry.value = response.data
    }
  }

  async function fetchEntries() {
    const response = await api.get('/daily-entries/')
    entries.value = response.data
  }

  return {
    entries,
    todayEntry,
    fetchTodayEntry,
    createOrUpdateEntry,
    fetchEntries
  }
})

async function fetchTodayEntry() {
  const today = new Date().toISOString().split('T')[0]
  try {
    const response = await api.get(`/daily-entries/by_date/?date=${today}`)
    todayEntry.value = response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      todayEntry.value = null
    } else {
      console.error('Error fetching today entry:', error)
      throw error
    }
  }
}