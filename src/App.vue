<template>
    <head>
      <link rel="stylesheet" href="/src/assets/base.css">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
    </head>
  <div id="app">
    <nav class="navbar" >
      <div class="nav-container">
        <h1>Daily Tracker</h1>
        <div class="nav-links">
          <router-link to="/dashboard" v-if="authStore.isAuthenticated" class="nav-link">🏠 Dashboard</router-link>
          <router-link to="/daily-entry" v-if="authStore.isAuthenticated" class="nav-link">📝 Dzisiejszy wpis</router-link>
          <span v-if="authStore.isAuthenticated">Witaj, {{ authStore.user?.username }}</span>
          <button @click="handleLogout" v-if="authStore.isAuthenticated" class="logout-btn">Wyloguj</button>
        </div>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/')
    }

    return {
      authStore,
      handleLogout
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

}
/* Dodaj te style do istniejących */
.nav-link {
  color: #ffffff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav-link:hover {
  background: var(--standard-background);
  color: var(--dark-brown)
}

.nav-link.router-link-active {
  background: var(--brown);
  color: white;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 15px;
}
#app {
  min-height: 100vh;
}

.navbar {
  background-color: var(--dark-brown);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

.nav-container {
  color: white;
  font-family: 'Inter', sans-serif;
  max-width: 1200px;
  font-size: 16px;
  background-color: var(--dark-brown);
  font-weight: 900;
  margin: 0 auto;
  display: flex;
  

  justify-content: space-between;
  align-items: center;

}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

h1 {
  font-weight: 900;
}

.logout-btn {
  background: #ff4757;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #ff3742;
}

main {
  padding: 2rem;
}
</style>