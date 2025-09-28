<template>
  <div 
    id="app"
    :style="{ 
      background: `linear-gradient(135deg, ${settings.backgroundGradient.start} 0%, ${settings.backgroundGradient.end} 100%)`,
      minHeight: '100vh'
    }"
  >
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Poker Clock</h1>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          <i class="fas fa-clock"></i>
          <span>Clock</span>
        </router-link>
        <router-link to="/setup" class="nav-link" :class="{ active: $route.path === '/setup' }">
          <i class="fas fa-users"></i>
          <span>Players</span>
        </router-link>
        <router-link to="/settings" class="nav-link" :class="{ active: $route.path === '/settings' }">
          <i class="fas fa-cog"></i>
          <span>Settings</span>
        </router-link>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue'
import { usePokerStore } from './stores/pokerStore'

export default {
  name: 'App',
  setup() {
    const store = usePokerStore()
    
    const settings = computed(() => store.settings)
    
    onMounted(() => {
      store.loadFromLocalStorage()
    })
    
    return {
      settings
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
  line-height: 1.6;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: white;
}

.navbar {
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1rem;
  z-index: 100;
  width: 100%;
}

.nav-brand h1 {
  color: #ffd700;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.75rem;
}

.nav-links {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  width: 100%;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 70px;
  font-size: 0.8rem;
  flex: 1;
  max-width: 100px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffd700;
  transform: translateY(-2px);
}

.nav-link.active {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.nav-link i {
  font-size: 1rem;
}

.main-content {
  flex: 1;
  width: 100%;
  overflow-x: hidden;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .navbar {
    padding: 0.5rem 0.75rem;
  }
  
  .nav-brand h1 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .nav-links {
    gap: 0.25rem;
  }
  
  .nav-link {
    padding: 0.4rem 0.5rem;
    min-width: 60px;
    font-size: 0.75rem;
    flex: 1;
    max-width: 80px;
  }
  
  .nav-link i {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.5rem;
  }
  
  .nav-brand h1 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .nav-links {
    gap: 0.2rem;
  }
  
  .nav-link {
    padding: 0.35rem 0.4rem;
    min-width: 50px;
    font-size: 0.7rem;
    flex: 1;
    max-width: 70px;
  }
  
  .nav-link span {
    font-size: 0.65rem;
  }
  
  .nav-link i {
    font-size: 0.8rem;
  }
}

@media (max-width: 360px) {
  .nav-link span {
    display: none;
  }
  
  .nav-link {
    min-width: 40px;
    max-width: 50px;
    padding: 0.4rem 0.3rem;
  }
  
  .nav-link i {
    font-size: 0.9rem;
  }
}
</style>
