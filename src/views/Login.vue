

<template>


  <head><link rel="stylesheet" href="/src/assets/base.css"></head>
  
  <div class="auth-container">

    <div class="auth-card">
      <h2>Logowanie</h2>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">Nazwa użytkownika:</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            required
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Hasło:</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            class="form-input"
          >
        </div>

        <button type="submit" :disabled="loading" class="auth-btn">
          {{ loading ? 'Logowanie...' : 'Zaloguj się' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <p class="auth-link">
        Nie masz konta? 
        <router-link to="/register">Zarejestruj się</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Login',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const form = ref({
      username: '',
      password: ''
    })
    
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      loading.value = true
      error.value = ''
      
      try {
        await authStore.login(form.value)
        router.push('/dashboard')
      } catch (err) {
        error.value = err.error || 'Wystąpił błąd podczas logowania'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleLogin
    }
  }
}

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.login(form.value)
    // Sprawdź czy użytkownik ma już dzisiejszy wpis
    await authStore.fetchProfile()
    router.push('/dashboard') // Przekieruj do dashboardu zamiast bezpośrednio do formularza
  } catch (err) {
    error.value = err.error || 'Wystąpił błąd podczas logowania'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  border-radius: 50px;

  background: linear-gradient(
    135deg,
    var(--standard-background),
    var(--darken-background)
  );

  animation: fadeIn 0.7s ease-out;
}

/* Elegancka karta */
.auth-card {
  background: rgba(75, 53, 42, 0.95);
  backdrop-filter: blur(6px);
  margin-top: -10%;

  color: var(--white);
  padding: 2.5rem;
  border-radius: 22px;

  border: 2px solid rgba(255, 255, 255, 0.08);

  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.4),
    0 0 0 6px rgba(255, 255, 255, 0.03);

  width: 100%;
  max-width: 420px;

  transform: translateY(20px);
  animation: slideUp 0.6s ease-out forwards;
}

/* Tytuł */
h2 {
  text-align: center;
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 2.2rem;
  letter-spacing: 1.2px;

  color: var(--standard-background);
}

/* FORMULARZ */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.4rem;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: var(--standard-background);
}

/* INPUTY */
.form-input {
  padding: 0.9rem;
  border: 2px solid var(--dark-brown);
  background: var(--brown);

  border-radius: 14px;
  font-size: 1rem;
  transition: 0.25s;

  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.25);
}

.form-input:focus {
  outline: none;
  border-color: var(--standard-background);
  box-shadow: 0 0 6px var(--standard-background);
}

/* PRZYCISK */
.auth-btn {
  background: var(--dark-brown);
  color: white;
  padding: 0.85rem;
  border: none;
  border-radius: 16px;

  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;

  transition: 0.25s ease;
}

.auth-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ERROR */
.error-message {
  background: #ff4d5e;
  color: white;
  padding: 0.8rem;
  border-radius: 10px;
  text-align: center;
  margin-top: 0.8rem;

  animation: shake 0.2s;
}

/* LINK */
.auth-link {
  margin-top: 1.7rem;
  text-align: center;
  color: var(--standard-background);
  font-size: 0.95rem;
}

.auth-link a {
  font-weight: 700;
  color: var(--standard-background);
}

.auth-link a:hover {
  text-decoration: underline;
}

/* ANIMACJE */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  to { transform: translateY(0); }
}

@keyframes shake {
  0% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}
</style>
