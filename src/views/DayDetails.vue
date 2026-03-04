<template>
  <div class="day-details">
    <div class="header">
      <router-link to="/dashboard" class="back-btn">
        ← Wróć do dashboardu
      </router-link>
        <div class="back" style="width: 50%; margin-left: 25%; max-height: 130px; background: linear-gradient(var(--brown), var(--dark-brown));">
            <h1>📅 Szczegóły dnia</h1>  
            <div class="date-display">{{ formattedDate }}</div>
        </div>
    </div>
    <div class="back">
        <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Ładowanie danych...</p>
        </div>

        <div v-else-if="entry" class="entry-content">
        <!-- Karty z głównymi statystykami -->
        <div class="main-stats-cards">
            <div class="stat-card primary">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
                <div class="stat-value">{{ entry.day_rating }}/10</div>
                <div class="stat-label">Ocena dnia</div>
            </div>
            </div>
            
            <div class="stat-card primary">
            <div class="stat-icon">🎭</div>
            <div class="stat-content">
                <div class="stat-value">{{ getMoodText(entry.mood) }}</div>
                <div class="stat-label">Samopoczucie</div>
            </div>
            </div>
            
            <div class="stat-card primary">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
                <div class="stat-value">{{ calculateTotalExpenses() }} zł</div>
                <div class="stat-label">Wydatki</div>
            </div>
            </div>
        </div>

        <!-- Sekcja aktywności -->
        <div class="activity-section">
            <h2 class="section-title">🏃 Aktywności</h2>
            <div class="activity-grid">
            <div class="activity-card">
                <div class="activity-icon">👣</div>
                <div class="activity-info">
                <div class="activity-value">{{ entry.steps || 0 }}</div>
                <div class="activity-label">Kroki</div>
                </div>
            </div>
            
            <div class="activity-card">
                <div class="activity-icon">🚗</div>
                <div class="activity-info">
                <div class="activity-value">{{ entry.kilometers_traveled || 0 }} km</div>
                <div class="activity-label">Kilometry</div>
                </div>
            </div>
            
            <div class="activity-card">
                <div class="activity-icon">💼</div>
                <div class="activity-info">
                <div class="activity-value">{{ formatTime(entry.work_time) }}</div>
                <div class="activity-label">Praca</div>
                </div>
            </div>
            
            <div class="activity-card">
                <div class="activity-icon">📚</div>
                <div class="activity-info">
                <div class="activity-value">{{ formatTime(entry.study_time) }}</div>
                <div class="activity-label">Nauka</div>
                </div>
            </div>
            
            <div class="activity-card">
                <div class="activity-icon">🎮</div>
                <div class="activity-info">
                <div class="activity-value">{{ formatTime(entry.entertainment_time) }}</div>
                <div class="activity-label">Rozrywka</div>
                </div>
            </div>
            </div>
        </div>

        <!-- Listy szczegółowe -->
        <div class="details-grid">
            <!-- Wydatki -->
            <div v-if="entry.expenses?.length" class="detail-card">
            <div class="card-header">
                <span class="card-icon">💰</span>
                <h3>Wydatki</h3>
                <span class="card-badge">{{ entry.expenses.length }}</span>
            </div>
            <div class="card-content">
                <div v-for="(expense, index) in entry.expenses" :key="index" class="list-item">
                <span class="item-amount">{{ parseFloat(expense.amount).toFixed(2) }} zł &nbsp; &nbsp; &nbsp; &nbsp;</span>
                <span class="item-description" style="padding-left: 20%;">{{ expense.description }}</span>
                </div>
            </div>
            </div>

            <!-- Zadania -->
            <div v-if="entry.tasks_done?.length" class="detail-card">
            <div class="card-header">
                <span class="card-icon">✅</span>
                <h3>Wykonane zadania</h3>
                <span class="card-badge">{{ entry.tasks_done.length }}</span>
            </div>
            <div class="card-content">
                <div v-for="(task, index) in entry.tasks_done" :key="index" class="list-item task">
                <span class="task-check">✓</span>
                <span class="item-description">{{ task.description }}</span>
                </div>
            </div>
            </div>

            <!-- Aktywności fizyczne -->
            <div v-if="entry.physical_activities?.length" class="detail-card">
            <div class="card-header">
                <span class="card-icon">💪</span>
                <h3>Aktywności fizyczne</h3>
                <span class="card-badge">{{ entry.physical_activities.length }}</span>
            </div>
            <div class="card-content">
                <div v-for="(activity, index) in entry.physical_activities" :key="index" class="list-item activity">
                <span class="item-description">{{ activity.activity }}</span>
                <span class="item-duration">{{ activity.duration }} min</span>
                </div>
            </div>
            </div>

            <!-- Osiągnięcia i utwór -->
            <div v-if="hasAdditionalData" class="detail-card">
            <div class="card-header">
                <span class="card-icon">🎵</span>
                <h3>Dodatkowe</h3>
            </div>
            <div class="card-content">
                <div v-if="entry.achievement" class="additional-item">
                <strong>🏆 Osiągnięcie:</strong>
                <p>{{ entry.achievement }}</p>
                </div>
                <div v-if="entry.song_of_the_day" class="additional-item">
                <strong>🎵 Utwór dnia:</strong>
                <p>{{ entry.song_of_the_day }}</p>
                </div>
            </div>
            </div>

            <!-- Dziennik -->
            <div v-if="entry.diary_entry" class="detail-card full-width">
            <div class="card-header">
                <span class="card-icon">📔</span>
                <h3>Kartka z pamiętnika</h3>
            </div>
            <div class="card-content diary">
                <div class="diary-text">{{ entry.diary_entry }}</div>
            </div>
            </div>
        </div>

        <!-- Przyciski akcji -->
        <div class="action-section">
            <router-link 
            :to="{ path: '/daily-entry', query: { date: route.params.date, edit: true } }" 
            class="btn btn-primary"
            >
            <span class="btn-icon">✏️</span>
            Edytuj wpis
            </router-link>
            <button @click="deleteEntry" class="btn btn-danger">
            <span class="btn-icon">🗑️</span>
            Usuń wpis
            </button>
        </div>
        </div>

        <div v-else class="empty-state">
        <div class="empty-icon">📊</div>
        <h2>Brak wpisu dla tego dnia</h2>
        <p>Nie znaleziono danych dla {{ formattedDate }}</p>
        <router-link 
            :to="{ path: '/daily-entry', query: { date: route.params.date } }" 
            class="btn btn-success"
        >
            <span class="btn-icon">➕</span>
            Stwórz wpis dla tego dnia
        </router-link>
        </div>
    </div>
  </div>
</template>

<script>
import { useDailyEntryStore } from '../stores/dailyEntry'
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'DayDetails',
  setup() {
    const dailyEntryStore = useDailyEntryStore()
    const route = useRoute()
    const router = useRouter()
    
    const loading = ref(true)
    const entry = ref(null)

    const formattedDate = computed(() => {
      if (!route.params.date) return ''
      return new Date(route.params.date).toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    const getMoodText = (mood) => {
      const moods = ['Bardzo smutny', 'Smutny', 'Neutralny', 'Dobry', 'Bardzo dobry', 'Fantastyczny']
      return moods[mood - 1] || 'Nieustalone'
    }

    const calculateTotalExpenses = () => {
      if (!entry.value?.expenses) return '0.00'
      const total = entry.value.expenses.reduce((total, expense) => {
        return total + parseFloat(expense.amount || 0)
      }, 0)
      return total.toFixed(2)
    }

    const formatTime = (minutes) => {
      if (!minutes) return '0 min'
      if (minutes < 60) return `${minutes} min`
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }

    const hasAdditionalData = computed(() => {
      return entry.value && (
        entry.value.achievement ||
        entry.value.song_of_the_day
      )
    })

    const loadEntry = async () => {
      loading.value = true
      try {
        await dailyEntryStore.fetchEntries()
        const foundEntry = dailyEntryStore.entries?.find(e => {
          const entryDate = new Date(e.date).toISOString().split('T')[0]
          return entryDate === route.params.date
        })
        entry.value = foundEntry || null
      } catch (error) {
        console.error('Error loading entry:', error)
        entry.value = null
      } finally {
        loading.value = false
      }
    }

    const deleteEntry = async () => {
      if (!entry.value || !confirm('Czy na pewno chcesz usunąć ten wpis? Tej operacji nie można cofnąć.')) {
        return
      }

      try {
        await dailyEntryStore.deleteEntry(entry.value.id)
        router.push('/dashboard')
      } catch (error) {
        console.error('Error deleting entry:', error)
        alert('Błąd podczas usuwania wpisu')
      }
    }

    onMounted(() => {
      loadEntry()
    })

    return {
      loading,
      entry,
      formattedDate,
      route,
      getMoodText,
      calculateTotalExpenses,
      formatTime,
      hasAdditionalData,
      deleteEntry
    }
  }
}
</script>

<style scoped>

.back{
    background-color: var(--dashboard-background);

    transform: scale(1.05);
    border-radius: 25px;
    padding: 20px;
}
.day-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: var(--brown);
  color: white;
  padding: 12px 20px;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.back-btn:hover {
  background: var(--dark-brown);
  transform: translateY(-50%) translateX(-5px);
}

.header h1 {
  color: white;
  margin: 0 0 10px 0;
  font-size: 2.5em;
  font-weight: 700;
}

.date-display {
  color: #bdc3c7;
  font-size: 1.2em;
  font-weight: 500;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--brown);
  border-left: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Main Stats Cards */
.main-stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: linear-gradient(135deg, var(--dark-brown), var(--brown));
  padding: 25px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.3);
}

.stat-card.primary {
  border-left: 5px solid #3498db;
}

.stat-icon {
  font-size: 3em;
  opacity: 0.9;
}

.stat-content {
  flex: 1;
}

.stat-value {
  color: white;
  font-size: 2em;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  color: #bdc3c7;
  font-size: 0.9em;
  font-weight: 500;
}

/* Activity Section */
.activity-section {
  margin-bottom: 40px;
}

.section-title {
  color: white;
  font-size: 1.8em;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 600;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.activity-card {
  background: var(--brown);
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s;
}

.activity-card:hover {
  transform: translateY(-3px);
}

.activity-icon {
  font-size: 2em;
}

.activity-info {
  flex: 1;
}

.activity-value {
  color: white;
  font-size: 1.4em;
  font-weight: 600;
  margin-bottom: 5px;
}

.activity-label {
  color: #bdc3c7;
  font-size: 0.85em;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.detail-card {
  background: var(--dark-brown);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.detail-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  background: var(--brown);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.card-icon {
  font-size: 1.5em;
}

.card-header h3 {
  color: white;
  margin: 0;
  font-size: 1.2em;
  flex: 1;
}

.card-badge {
  background: #3498db;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;
}

.card-content {
  padding: 20px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.list-item:last-child {
  border-bottom: none;
}

.list-item.task {
  justify-content: flex-start;
  gap: 12px;
}

.list-item.activity {
  justify-content: space-between;
}

.item-amount {
  color: #27ae60;
  font-weight: 600;
  font-size: 1.1em;
}

.item-description {
  color: white;
  flex: 1;
}

.item-duration {
  color: #3498db;
  font-weight: 600;
}

.task-check {
  color: #27ae60;
  font-weight: bold;
  font-size: 1.2em;
}

.additional-item {
  margin-bottom: 20px;
}

.additional-item:last-child {
  margin-bottom: 0;
}

.additional-item strong {
  color: #f1c40f;
  display: block;
  margin-bottom: 8px;
  font-size: 1em;
}

.additional-item p {
  color: white;
  margin: 0;
  line-height: 1.5;
}

.diary-text {
  color: white;
  line-height: 1.6;
  font-size: 1.1em;
  white-space: pre-wrap;
}

/* Action Section */
.action-section {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding-top: 30px;
  border-top: 1px solid var(--brown);
}

.btn {
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 1em;
}

.btn-primary {
  background: #27ae60;
  color: white;
}

.btn-primary:hover {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
}

.btn-success {
  background: var(--dark-brown);
  color: white;
}

.btn-success:hover {
  background: var(--brown);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.2em;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: var(--dark-brown);
  border-radius: 16px;
  border: 2px dashed var(--brown);
}

.empty-icon {
  font-size: 5em;
  margin-bottom: 20px;
  display: block;
}

.empty-state h2 {
  color: white;
  margin: 0 0 15px 0;
  font-size: 2em;
}

.empty-state p {
  color: #bdc3c7;
  margin: 0 0 30px 0;
  font-size: 1.1em;
}

/* Responsive */
@media (max-width: 768px) {
  .day-details {
    padding: 15px;
  }
  
  .header {
    text-align: center;
  }
  
  .back-btn {
    position: static;
    transform: none;
    margin-bottom: 20px;
    display: inline-block;
  }
  
  .header h1 {
    font-size: 2em;
  }
  
  .main-stats-cards {
    grid-template-columns: 1fr;
  }
  
  .activity-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    font-size: 2.5em;
  }
  
  .stat-value {
    font-size: 1.6em;
  }
}

@media (max-width: 480px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }
  
  .header h1 {
    font-size: 1.6em;
  }
  
  .btn {
    padding: 12px 20px;
    font-size: 0.9em;
  }
  
  .empty-state {
    padding: 40px 20px;
  }
  
  .empty-icon {
    font-size: 3em;
  }
}
</style>