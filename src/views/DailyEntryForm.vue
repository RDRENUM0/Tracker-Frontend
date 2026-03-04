<template>
  <head><link rel="stylesheet" href="ścieżka/do/base.css"></link></head>
  <div class="daily-entry-form">
    <div class="header">
      <h2>Daily Entry for {{ today }}</h2>
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
    </div>

    <form @submit.prevent="submitForm" class="entry-form">
      <!-- 1. Wydatki -->
      <div class="form-section">
        <h3>💰 Wydatki</h3>
        <div v-for="(expense, index) in form.expenses" :key="index" class="expense-item form-row">
          <input 
            v-model="expense.amount" 
            type="number" 
            placeholder="Kwota" 
            step="1,00" 
            min="0"
            class="form-input"
          >
          <input 
            v-model="expense.description" 
            type="text" 
            placeholder="Na co wydałeś?" 
            class="form-input"
          >
          <button type="button" @click="removeExpense(index)" class="btn-remove">
            X
          </button>
        </div>
        <button type="button" @click="addExpense" class="btn-add">
          ➕ Dodaj wydatek
        </button>
      </div>

      <!-- 2. Samopoczucie -->
      <div class="form-section">
        <h3>😊 Samopoczucie</h3>
        <div class="mood-selector">
          <button 
            v-for="mood in 6" 
            :key="mood" 
            type="button"
            :class="['mood-btn', { 'selected': form.mood === mood }]"
            @click="form.mood = mood"
          >
            {{ getMoodEmoji(mood) }}
          </button>
        </div>
      </div>

      <!-- 3. Kartka z pamiętnika -->
      <div class="form-section">
        <h3>📖 Kartka z pamiętnika</h3>
        <textarea 
          v-model="form.diary_entry" 
          rows="4" 
          placeholder="Opisz swój dzień..."
          class="form-textarea"
        ></textarea>
      </div>

      <!-- 4. Song of the day -->
      <div class="form-section">
        <h3>🎵 Song of the day</h3>
        <input 
          v-model="form.song_of_the_day" 
          type="text" 
          placeholder="Wpisz ulubiony utwór dnia"
          class="centered-form-item form-input"
        >
      </div>

      <!-- 5. Tasks done -->
      <div class="form-section">
        <h3>✅ Tasks done</h3>
        <div v-for="(task, index) in form.tasks_done" :key="index" class="task-item form-row">
          <input 
            v-model="task.description" 
            type="text" 
            placeholder="Co udało Ci się zrobić?"
            class="form-input"
          >
          <button type="button" @click="removeTask(index)" class="btn-remove">
            X
          </button>
        </div>
        <button type="button" @click="addTask" class="btn-add">
          ➕ Dodaj zadanie
        </button>
      </div>

      <!-- 6. Kilometry -->
      <div class="form-section">
        <h3>🚗 Ilość przejechanych kilometrów</h3>
        <input 
          v-model="form.kilometers_traveled" 
          type="number" 
          step="0.1" 
          min="0"
          placeholder="0.0"
          class="centered-form-item form-input"
        >
      </div>

      <!-- 7. Czas spędzony -->
      <div class="form-section">
        <h3>⏰ Czas spędzony (w minutach)</h3>
        <div class="time-grid">
          <div class="time-item">
            <label>💼 Praca:</label>
            <input v-model="form.work_time" type="number" min="0" class="form-input">
          </div>
          <div class="time-item">
            <label>📚 Nauka:</label>
            <input v-model="form.study_time" type="number" min="0" class="form-input">
          </div>
          <div class="time-item">
            <label>🎮 Rozrywka:</label>
            <input v-model="form.entertainment_time" type="number" min="0" class="form-input">
          </div>
        </div>
      </div>

      <!-- 8. Aktywność fizyczna -->
      <div class="form-section">
        <h3>💪 Aktywność fizyczna</h3>
        <div v-for="(activity, index) in form.physical_activities" :key="index" class="activity-item form-row">
          <input 
            v-model="activity.activity" 
            type="text" 
            placeholder="Rodzaj aktywności"
            class="form-input"
          >
          <input 
            v-model="activity.duration" 
            type="number" 
            placeholder="Czas (min)"
            min="0"
            class="form-input"
          >
          <button type="button" @click="removeActivity(index)" class="btn-remove">
            X
          </button>
        </div>
        <button type="button" @click="addActivity" class="btn-add">
          ➕ Dodaj aktywność
        </button>
      </div>

      <!-- 9. Kroki -->
      <div class="form-section">
        <h3>👣 Ilość kroków</h3>
        <input 
          v-model="form.steps" 
          type="number" 
          min="0"
          placeholder="0"
          class="centered-form-item form-input"
        >
      </div>

      <!-- 10. Osiągnięcie dnia -->
      <div class="form-section">
        <h3>🏆 Osiągnięcie dnia</h3>
        <input 
          v-model="form.achievement" 
          type="text" 
          placeholder="Z czego jesteś dziś dumny?"
          class="centered-form-item form-input"
        >
      </div>

      <!-- 11. Ocena dnia -->
      <div class="form-section">
        <h3>⭐ Ocena dnia (1-10)</h3>
        <div class="rating-selector">
          <button 
            v-for="rating in 10" 
            :key="rating" 
            type="button"
            :class="['rating-btn', { 'selected': form.day_rating === rating }]"
            @click="form.day_rating = rating"
          >
            {{ rating }}
          </button>
        </div>
      </div>

      <!-- Przyciski akcji -->
      <div class="form-actions">
        <button type="submit" :disabled="loading" class="btn-submit">
          {{ loading ? 'Zapisywanie...' : '💾 Zapisz wpis' }}
        </button>
        <button type="button" @click="clearForm" class="btn-clear">
          🗑️ Wyczyść formularz
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useDailyEntryStore } from '../stores/dailyEntry'
import { useRouter } from 'vue-router'

export default {
  name: 'DailyEntryForm',
  setup() {
    const dailyEntryStore = useDailyEntryStore()
    const router = useRouter()

    const loading = ref(false)
    const message = ref('')
    const messageType = ref('') // 'success' or 'error'

    const form = ref({
      mood: null,
      diary_entry: '',
      song_of_the_day: '',
      kilometers_traveled: null,
      work_time: null,
      study_time: null,
      entertainment_time: null,
      steps: null,
      achievement: '',
      day_rating: null,
      expenses: [],
      tasks_done: [],
      physical_activities: []
    })

    const today = computed(() => {
      return new Date().toLocaleDateString('pl-PL')
    })

    // Emotki dla nastroju
    const getMoodEmoji = (mood) => {
      const emojis = ['😢', '😞', '😐', '😊', '😄', '🤩']
      return emojis[mood - 1] || '❓'
    }

    const showMessage = (text, type = 'success') => {
      message.value = text
      messageType.value = type
      setTimeout(() => {
        message.value = ''
        messageType.value = ''
      }, 3000)
    }

    const addExpense = () => {
      form.value.expenses.push({ amount: null, description: '' })
    }

    const removeExpense = (index) => {
      form.value.expenses.splice(index, 1)
    }

    const addTask = () => {
      form.value.tasks_done.push({ description: '' })
    }

    const removeTask = (index) => {
      form.value.tasks_done.splice(index, 1)
    }

    const addActivity = () => {
      form.value.physical_activities.push({ activity: '', duration: null })
    }

    const removeActivity = (index) => {
      form.value.physical_activities.splice(index, 1)
    }

    const clearForm = () => {
      form.value = {
        mood: null,
        diary_entry: '',
        song_of_the_day: '',
        kilometers_traveled: null,
        work_time: null,
        study_time: null,
        entertainment_time: null,
        steps: null,
        achievement: '',
        day_rating: null,
        expenses: [],
        tasks_done: [],
        physical_activities: []
      }
      showMessage('Formularz wyczyszczony!')
    }

    const submitForm = async () => {
      loading.value = true
      message.value = ''

      try {
        // Przygotuj dane do wysłania - usuń puste wartości
        const submissionData = {
          ...form.value,
          expenses: form.value.expenses.filter(exp => exp.amount && exp.description),
          tasks_done: form.value.tasks_done.filter(task => task.description),
          physical_activities: form.value.physical_activities.filter(act => act.activity && act.duration)
        }

        await dailyEntryStore.createOrUpdateEntry(submissionData)
        showMessage('✅ Wpis został zapisany pomyślnie!', 'success')
        
        // Przekieruj do dashboardu po 2 sekundach
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)

      } catch (error) {
        console.error('Error saving entry:', error)
        showMessage('❌ Błąd podczas zapisywania wpisu: ' + (error.response?.data?.error || error.message), 'error')
      } finally {
        loading.value = false
      }
    }

onMounted(async () => {
  try {
    // Sprawdź czy jest data w query params
    const urlParams = new URLSearchParams(window.location.search)
    const queryDate = urlParams.get('date')
    const isEdit = urlParams.get('edit') === 'true'
    
    if (queryDate) {
      // Załaduj wpis dla konkretnej daty
      await dailyEntryStore.fetchEntries()
      const existingEntry = dailyEntryStore.entries.find(entry => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0]
        return entryDate === queryDate
      })
      
      if (existingEntry) {
        form.value = { 
          ...existingEntry,
          expenses: existingEntry.expenses || [],
          tasks_done: existingEntry.tasks_done || [],
          physical_activities: existingEntry.physical_activities || []
        }
        if (isEdit) {
          showMessage('📝 Edytujesz istniejący wpis!', 'success')
        } else {
          showMessage('📝 Znaleziono istniejący wpis!', 'success')
        }
      } else {
        // Ustaw datę dla nowego wpisu
        form.value.date = queryDate
      }
    } else {
      // Standardowe ładowanie dzisiejszego wpisu
      await dailyEntryStore.fetchTodayEntry()
      if (dailyEntryStore.todayEntry) {
        form.value = { 
          ...dailyEntryStore.todayEntry,
          expenses: dailyEntryStore.todayEntry.expenses || [],
          tasks_done: dailyEntryStore.todayEntry.tasks_done || [],
          physical_activities: dailyEntryStore.todayEntry.physical_activities || []
        }
        showMessage('📝 Masz już dzisiejszy wpis! Możesz go edytować.', 'success')
      }
    }
  } catch (error) {
    console.error('Error loading entry:', error)
  }
})

    return {
      form,
      today,
      loading,
      message,
      messageType,
      addExpense,
      removeExpense,
      addTask,
      removeTask,
      addActivity,
      removeActivity,
      clearForm,
      submitForm,
      getMoodEmoji
    }
  }
}
</script>

<style scoped>
.daily-entry-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: var(--dark-brown);
  border-radius: 10px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #ffffff;
  margin-bottom: 10px;
  font-size: 32px;
  font-weight: 800;
  padding: 10px;
  border-bottom: 2px solid var(--brown);
}

.message {
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-section {
  background: var(--brown);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-section h3 {
  margin-bottom: 15px;
  color: #ffffff;
  border-bottom: 2px solid var(--dark-brown);
  padding-bottom: 5px;
}

.form-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.form-input {
  flex: 1;
  padding: 8px 12px;

  margin: 0 auto;

  text-align: center;

  color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: var(--place-holder-background);
  font-size: 14px;
}

.centered-form-item {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centruje poziomo wszystkie elementy wewnątrz (w tym input) */
  gap: 10px; /* Dodatkowy odstęp między elementami w sekcji */
}


.form-input:focus {
  outline: none;
  border-color: var(--dark-brown);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  background-color: var(--place-holder-background);
}

.form-textarea {
  width: 100%;
  margin: 0 auto;
  display: block;
  width: 90%;
  text-align: center;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--dark-brown);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Mood selector */
.mood-selector {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.mood-btn {
  width: 50px;
  height: 50px;
  border: 2px solid #bdc3c7;
  border-radius: 50%;
  background: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mood-btn:hover {
  transform: scale(1.1);
  border-color: var(--dark-brown);
}

.mood-btn.selected {
  border-color: #2ecc71;
  background: #2ecc71;
  color: white;
  transform: scale(1.1);
}

/* Rating selector */
.rating-selector {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.rating-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #bdc3c7;
  border-radius: 50%;
  background: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rating-btn:hover {
  transform: scale(1.1);
  border-color: #3498db;
}

.rating-btn.selected {
  border-color: #1d7615;
  background: #2cad48;
  color: white;
  transform: scale(1.1);
}

/* Time grid */
.time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.time-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.time-item label {
  font-weight: 600;
  color: #ffffff;
}

/* Buttons */
.btn-add, .btn-remove, .btn-submit, .btn-clear {
  padding: 8px 16px;
  border-radius: 8px;
  margin: 0 auto;
  max-width: fit-content;
  border: none;

  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-add {
  background: #27ae60;
  color: white;
  display: flex;
  justify-content: center;
}

.btn-add:hover {
  background: #219a52;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  max-width: fit-content;
}

.btn-remove:hover {
  background: #c0392b;
}

.btn-submit {
  background: var(--brown);
  color: white;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
}

.btn-submit:hover:not(:disabled) {
  background: var(--standard-background);
}
.form-textarea{
  color: white;
  background-color: var(--place-holder-background);
}


.btn-submit:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-clear {
  background: #5b5b5b;
  color: white;
  padding: 12px 24px;
  font-size: 16px;
}

.btn-clear:hover {
  background: #7f8c8d;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .daily-entry-form {
    padding: 10px;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .time-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>