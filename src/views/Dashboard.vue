<template>
  <div class="dashboard">
    <div class="header">
      <div class="actions">
        <router-link to="/daily-entry" class="btn-primary">
          📝 Wypełnij dzisiejszy formularz
        </router-link>
      </div>
    </div>
    
    <div class="dashboard-content">
      <!-- Lewa kolumna - Podsumowanie -->
      <div class="summary-column">
        <div class="summary"> 

          <div v-if="dailyEntryStore.todayEntry" class="today-summary">
            <div class="summary-header">
              <h3>Dzisiejszy wpis</h3>
              <span class="date">{{ formatDate(dailyEntryStore.todayEntry.date) }}</span>
            </div>
            
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-icon">🎭</span>
                <div class="stat-info">
                  <span class="stat-label">Samopoczucie</span>
                  <span class="stat-value">{{ getMoodText(dailyEntryStore.todayEntry.mood) }}</span>
                </div>
              </div>
              
              <div class="stat-item">
                <span class="stat-icon">⭐</span>
                <div class="stat-info">
                  <span class="stat-label">Ocena dnia</span>
                  <span class="stat-value">{{ dailyEntryStore.todayEntry.day_rating }}/10</span>
                </div>
              </div>
              
              <div class="stat-item">
                <span class="stat-icon">💰</span>
                <div class="stat-info">
                  <span class="stat-label">Wydatki</span>
                  <span class="stat-value">{{ calculateTotalExpenses() }} zł</span>
                </div>
              </div>
              
              <div class="stat-item">
                <span class="stat-icon">👣</span>
                <div class="stat-info">
                  <span class="stat-label">Kroki</span>
                  <span class="stat-value">{{ dailyEntryStore.todayEntry.steps || 0 }}</span>
                </div>
              </div>
              
              <div class="stat-item">
                <span class="stat-icon">🚗</span>
                <div class="stat-info">
                  <span class="stat-label">Kilometry</span>
                  <span class="stat-value">{{ dailyEntryStore.todayEntry.kilometers_traveled || 0 }} km</span>
                </div>
              </div>
              
              <div class="stat-item">
                <span class="stat-icon">💼</span>
                <div class="stat-info">
                  <span class="stat-label">Czas pracy</span>
                  <span class="stat-value">{{ formatTime(dailyEntryStore.todayEntry.work_time) }}</span>
                </div>
              </div>
            
              <div class="stat-item">
                <span class="stat-icon">📚</span>
                <div class="stat-info">
                  <span class="stat-label">Czas nauki</span>
                  <span class="stat-value">{{ formatTime(dailyEntryStore.todayEntry.study_time) }}</span>
                </div>
              </div>

              <div class="stat-item">
                <span class="stat-icon">🎮</span>
                <div class="stat-info">
                  <span class="stat-label">Czas rozrywki</span>
                  <span class="stat-value">{{ formatTime(dailyEntryStore.todayEntry.entertainment_time) }}</span>
                </div>
              </div>
            </div>

            <!-- Dodatkowe informacje -->
            <div v-if="hasAdditionalData" class="additional-info">
              <div v-if="dailyEntryStore.todayEntry.achievement" class="info-item">
                <strong>🏆 Osiągnięcie:</strong> {{ dailyEntryStore.todayEntry.achievement }}
              </div>
              <div v-if="dailyEntryStore.todayEntry.song_of_the_day" class="info-item">
                <strong>🎵 Utwór dnia:</strong> {{ dailyEntryStore.todayEntry.song_of_the_day }}
              </div>
              <div v-if="dailyEntryStore.todayEntry.tasks_done?.length" class="info-item">
                <strong>✅ Zadania:</strong> {{ dailyEntryStore.todayEntry.tasks_done.length }} wykonane
              </div>
              <div v-if="dailyEntryStore.todayEntry.physical_activities?.length" class="info-item">
                <strong>💪 Aktywności:</strong> {{ dailyEntryStore.todayEntry.physical_activities.length }} rodzaje
              </div>
              <div v-if="dailyEntryStore.todayEntry.diary_entry?.length" class="info-item-diary">
                <strong>📔 Dziennik:<br><br></strong> {{ dailyEntryStore.todayEntry.diary_entry }}
              </div>
            </div>

            <!-- Przycisk edycji -->
            <div class="action-section">
              <router-link to="/daily-entry" class="btn-edit">
                ✏️ Edytuj dzisiejszy wpis
              </router-link>
            </div>
          </div>
        
          <div v-else class="no-entry">
            <div class="no-entry-content">
              <span class="no-entry-icon">📊</span>
              <h3 style="color: white">Brak dzisiejszego wpisu</h3>
              <p style="color: white">Jeszcze nie wypełniłeś/aś dzisiejszego formularza!</p>
              <router-link to="/daily-entry" class="btn-primary">
                <div style="border: 1px solid var(--standard-background); background-color: var(--brown)" class="btn-primary">➕ Stwórz nowy wpis</div>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Prawa kolumna - Kalendarz -->  
      <div class="calendar-column">
        <div class="calendar-section">
          <div class="calendar-header">
            <h2 style="font-size: 15px;">Kalendarz - {{ currentMonthYear }}</h2>
            <div class="calendar-navigation">
              <button @click="previousMonth" class="nav-btn" title="Poprzedni miesiąc">‹</button>
              <button @click="goToToday" class="today-btn" title="Przejdź do dzisiaj">Dziś</button>
              <button @click="nextMonth" class="nav-btn" title="Następny miesiąc">›</button>
            </div>
          </div>
          
          <div class="calendar-weekdays">
            <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
          </div>
          
          <div class="calendar">
            <div 
              v-for="day in calendarDays" 
              :key="day.key"
              class="calendar-day" 
              :class="[
                getDayClass(day),
                { 
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'has-entry': day.hasEntry
                }
              ]"
              @click="goToDay(day)"
              :title="getDayTooltip(day)"
            >
              <span class="day-number">{{ day.number }}</span>
              <div v-if="day.hasEntry" class="day-preview">
                <span class="mood-preview">{{ getMoodEmoji(day.entry.mood) }}</span>
                <span class="rating-preview">{{ day.entry.day_rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDailyEntryStore } from '../stores/dailyEntry'
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Dashboard',
  setup() {
    const dailyEntryStore = useDailyEntryStore()
    const router = useRouter()
    
    const currentDate = ref(new Date())
    const weekdays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

    onMounted(async () => {
      await dailyEntryStore.fetchTodayEntry()
      await dailyEntryStore.fetchEntries()
    })

    const currentMonthYear = computed(() => {
      return currentDate.value.toLocaleDateString('pl-PL', { 
        month: 'long', 
        year: 'numeric' 
      })
    })

    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const firstDayOfWeek = firstDay.getDay()
      const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
      
      const prevMonthLastDay = new Date(year, month, 0).getDate()
      
      const days = []
      const today = new Date()
      const todayString = formatDateForAPI(today)
      
      // Dni z poprzedniego miesiąca
      for (let i = startDay - 1; i >= 0; i--) {
        const dayNumber = prevMonthLastDay - i
        const date = new Date(year, month - 1, dayNumber)
        const dateString = formatDateForAPI(date)
        days.push(createDayObject(dayNumber, date, false, dateString === todayString))
      }
      
      // Dni z bieżącego miesiąca
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day)
        const dateString = formatDateForAPI(date)
        const isToday = dateString === todayString
        days.push(createDayObject(day, date, true, isToday))
      }
      
      // Dni z następnego miesiąca - tylko do uzupełnienia bieżącego tygodnia
      const daysNeeded = 35 - days.length // Tylko 5 tygodni
      for (let day = 1; day <= daysNeeded; day++) {
        const date = new Date(year, month + 1, day)
        const dateString = formatDateForAPI(date)
        days.push(createDayObject(day, date, false, dateString === todayString))
      }
      
      return days
    })

    // POPRAWIONA FUNKCJA - uwzględnia strefę czasową
    const formatDateForAPI = (date) => {
      // Użyj lokalnej daty bez konwersji do UTC
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const createDayObject = (number, date, isCurrentMonth, isToday = false) => {
      const dateString = formatDateForAPI(date)
      
      // POPRAWIONE wyszukiwanie wpisu - używaj tej samej funkcji formatowania
      const entry = dailyEntryStore.entries?.find(entry => {
        const entryDate = new Date(entry.date)
        const entryDateString = formatDateForAPI(entryDate)
        return entryDateString === dateString
      }) || null

      return {
        number,
        date: dateString,
        isCurrentMonth,
        isToday,
        hasEntry: !!entry,
        entry,
        key: `${dateString}-${number}`
      }
    }

    const getMoodText = (mood) => {
      const moods = ['Bardzo smutny', 'Smutny', 'Neutralny', 'Dobry', 'Bardzo dobry', 'Fantastyczny']
      return moods[mood - 1] || 'Nieustalone'
    }

    const getMoodEmoji = (mood) => {
      const emojis = ['😢', '😞', '😐', '😊', '😄', '🤩']
      return emojis[mood - 1] || '❓'
    }

    const calculateTotalExpenses = () => {
      if (!dailyEntryStore.todayEntry?.expenses) return '0.00'
      const total = dailyEntryStore.todayEntry.expenses.reduce((total, expense) => {
        return total + parseFloat(expense.amount || 0)
      }, 0)
      return total.toFixed(2)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatTime = (minutes) => {
      if (!minutes) return '0 min'
      if (minutes < 60) return `${minutes} min`
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }

    const hasAdditionalData = computed(() => {
      const entry = dailyEntryStore.todayEntry
      return entry && (
        entry.achievement ||
        entry.song_of_the_day ||
        entry.tasks_done?.length ||
        entry.physical_activities?.length
      )
    })

    const getDayClass = (day) => {
      if (!day.entry) return ''
      
      if (day.entry.day_rating <= 3) return 'bad-day'
      if (day.entry.day_rating <= 7) return 'average-day'
      return 'good-day'
    }

    const getDayTooltip = (day) => {
      if (!day.isCurrentMonth) return 'Inny miesiąc'
      if (day.hasEntry) {
        return `${formatDisplayDate(day.date)}: ${getMoodText(day.entry.mood)} (${day.entry.day_rating}/10)`
      }
      return `${formatDisplayDate(day.date)}: Kliknij aby dodać wpis`
    }

    const formatDisplayDate = (dateString) => {
      const [year, month, day] = dateString.split('-')
      return `${day}.${month}.${year}`
    }

    const previousMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
      )
    }

    const nextMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
      )
    }

    const goToToday = () => {
      currentDate.value = new Date()
    }

    const goToDay = (day) => {
      if (!day.isCurrentMonth) return
      
      if (day.hasEntry) {
        // Przejdź do widoku szczegółów dnia
        router.push({ 
          name: 'DayDetails', 
          params: { date: day.date }
        })
      } else {
        // Przejdź do tworzenia nowego wpisu z wybraną datą
        router.push({ 
          path: '/daily-entry',
          query: { date: day.date }
        })
      }
    }

    return {
      dailyEntryStore,
      weekdays,
      calendarDays,
      currentMonthYear,
      getMoodText,
      getMoodEmoji,
      calculateTotalExpenses,
      formatDate,
      formatTime,
      hasAdditionalData,
      getDayClass,
      getDayTooltip,
      previousMonth,
      nextMonth,
      goToToday,
      goToDay
    }
  }
}
</script>

<style scoped>
/* Stylowanie pozostaje takie samo jak w poprzednim kodzie */
.dashboard {
  max-width: 1200px;
  font-family: 'Inter', sans-serif;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

@media (min-width: 768px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.actions {
  display: flex;
  gap: 15px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

@media (min-width: 1024px) {
  .dashboard-content {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .summary-column {
    flex: 1;
  }
  
  .calendar-column {
    flex: 0 0 400px;
  }
}

h2 {
  color: white;
  font-weight: 700;
}

.btn-primary {
  background: var(--dark-brown);
  color: white;
  padding: 12px 20px;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 600;
  transition: background 0.3s;
  display: inline-block;
  text-align: center;
}

.decorated {
  margin-bottom: 10px;
  background-color: var(--dark-brown);
  padding: 5px 10px;
  border-radius: 8px;
  max-width: fit-content;
  color: var(--white);
}

.btn-primary:hover {
  background: var(--dark-brown);
  transform: translateY(-2px);
}

/* Today Summary */
.today-summary, .no-entry {
  background: var(--dark-brown);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.summary-header h3 {
  margin: 0;
  font-weight: 700;
  color: #ffffff;
}

.date {
  color: #ffffff;
  font-size: 0.9em;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: var(--brown);
  border-radius: 8px;
  transition: transform 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.5em;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8em;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-value {
  font-weight: 600;
  color: var(--white);
  font-size: 1.1em;
}

strong {
  color: var(--white);
  font-weight: 700;
}

/* Additional Info */
.additional-info {
  background: var(--brown);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.info-item {
  margin-bottom: 8px;
  color: white;
  font-weight: 500;
  padding: 8px 0;
  border-bottom: 1px solid var(--white);
}

.info-item-diary {
  margin-bottom: 8px;
  padding: 8px 0;
  color: white;
  border-bottom: 1px solid var(--white);
  text-align: justify;
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* Action Section */
.action-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #f8f9fa;
  text-align: center;
}

.btn-edit {
  background: #27ae60;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-block;
}

.btn-edit:hover {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
}

/* No Entry State */
.no-entry {
  text-align: center;
  border: 2px dashed #bdc3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.no-entry-content {
  padding: 20px;
}

.no-entry-icon {
  font-size: 3em;
  display: block;
  margin-bottom: 15px;
}

/* Calendar Section - Ulepszony design */
.calendar-section {
  background: var(--dark-brown);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.calendar-navigation {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-btn, .today-btn {
  background: var(--brown);
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 0.9em;
}

.nav-btn {
  font-size: 1.1em;
  padding: 6px 12px;
}

.nav-btn:hover, .today-btn:hover {
  background: var(--dark-brown);
  transform: translateY(-2px);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 8px;
  text-align: center;
}

.weekday {
  font-weight: 600;
  color: var(--white);
  padding: 8px 2px;
  font-size: 0.75em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  border: 1px solid var(--standard-background);
  border-radius: 6px;
  display: flex;
  background-color: var(--brown);
  flex-direction: column;
  color: white;
  align-items: center;
  justify-content: center;
  padding: 4px;
  font-size: 0.8em;
  position: relative;
  transition: all 0.2s;
  cursor: pointer;
  min-height: 40px;
}

.calendar-day:hover {
  transform: scale(1.05);
  z-index: 1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.calendar-day.other-month {
  background-color: var(--standard-background);
  color: #999;
  opacity: 0.4;
  cursor: default;
}

.calendar-day.other-month:hover {
  transform: none;
  box-shadow: none;
}

.calendar-day.today {
  border: 2px solid #3498db;
  background: linear-gradient(135deg, var(--brown), #2980b9);
}

.calendar-day.has-entry {
  border: 2px solid #27ae60;
}

.day-number {
  font-weight: 600;
  margin-bottom: 1px;
  font-size: 0.85em;
}

.day-preview {
  display: flex;
  gap: 2px;
  font-size: 0.7em;
  align-items: center;
  margin-top: 1px;
}

.mood-preview, .rating-preview {
  font-size: 0.75em;
}

.rating-preview {
  font-weight: bold;
}

/* Day rating colors */
.bad-day {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.average-day {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.good-day {
  background: linear-gradient(135deg, #27ae60, #219a52);
  color: white;
}

/* Responsywność */
@media (max-width: 768px) {
  .dashboard {
    padding: 15px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .today-summary, .no-entry, .calendar-section {
    padding: 15px;
  }
  
  .calendar-day {
    font-size: 0.75em;
    min-height: 35px;
  }
  
  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .calendar-navigation {
    align-self: stretch;
    justify-content: center;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .calendar-section {
    padding: 12px;
  }
  
  .calendar-day {
    min-height: 30px;
    font-size: 0.7em;
    padding: 2px;
  }
  
  .btn-primary, .btn-edit {
    padding: 10px 16px;
    font-size: 0.9em;
  }
  
  .calendar-weekdays .weekday {
    font-size: 0.7em;
    padding: 6px 1px;
  }
  
  .nav-btn, .today-btn {
    padding: 5px 8px;
    font-size: 0.8em;
  }
  
  .dashboard-content {
    gap: 20px;
  }
}
</style>