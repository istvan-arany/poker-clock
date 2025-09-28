<template>
  <div id="app" :style="{ background: dynamicBackground }">
    <nav class="navbar">
      <div class="nav-brand">
        <i class="fas fa-clock"></i>
        <span>Poker Clock</span>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          <i class="fas fa-play"></i>
          Clock
        </router-link>
        <router-link to="/setup" class="nav-link" :class="{ active: $route.path === '/setup' }">
          <i class="fas fa-users"></i>
          Players
        </router-link>
        <router-link to="/settings" class="nav-link" :class="{ active: $route.path === '/settings' }">
          <i class="fas fa-cog"></i>
          Settings
        </router-link>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed } from 'vue'
import { usePokerStore } from './stores/pokerStore'

export default {
  name: 'App',
  setup() {
    const store = usePokerStore()
    
    const dynamicBackground = computed(() => {
      const gradient = store.settings.backgroundGradient
      return `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`
    })
    
    return {
      dynamicBackground
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
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>
