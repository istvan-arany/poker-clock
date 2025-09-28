<template>
  <div 
    class="clock-container"
    :style="{ 
      background: `linear-gradient(135deg, ${settings.backgroundGradient.start} 0%, ${settings.backgroundGradient.end} 100%)` 
    }"
  >
    <div class="clock-header">
      <div v-if="!isBreak" class="current-level">
        <h2>Level {{ currentBlindLevel.level }}</h2>
        <div class="blinds">
          <span 
            class="small-blind"
            :style="{ color: settings.blindColors.smallBlind }"
          >{{ formatCurrency(currentBlindLevel.smallBlind) }}</span>
          <span class="divider">/</span>
          <span 
            class="big-blind"
            :style="{ color: settings.blindColors.bigBlind }"
          >{{ formatCurrency(currentBlindLevel.bigBlind) }}</span>
        </div>
      </div>
      
      <div v-else class="break-info">
        <h2>Break Time</h2>
        <div class="break-message">
          <i class="fas fa-coffee"></i>
          <span>Take a break!</span>
        </div>
      </div>
      
      <div class="timer-display">
        <div class="time">{{ formattedTime }}</div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>
    </div>
    
    <div class="controls">
      <button 
        @click="toggleTimer" 
        class="control-btn primary"
        :class="{ running: isRunning }"
      >
        <i :class="isRunning ? 'fas fa-pause' : 'fas fa-play'"></i>
        <span>{{ isRunning ? 'Pause' : 'Start' }}</span>
      </button>
      
      <button v-if="!isBreak" @click="nextLevel" class="control-btn secondary">
        <i class="fas fa-forward"></i>
        <span>Next</span>
      </button>
      
      <button v-if="!isBreak" @click="previousLevel" class="control-btn secondary">
        <i class="fas fa-backward"></i>
        <span>Prev</span>
      </button>
      
      <button v-if="isBreak" @click="skipBreak" class="control-btn skip">
        <i class="fas fa-fast-forward"></i>
        <span>Skip</span>
      </button>
      
      <button @click="resetTimer" class="control-btn danger">
        <i class="fas fa-stop"></i>
        <span>Reset</span>
      </button>
    </div>
    
    <div class="tournament-info" v-if="players.length > 0">
      <div class="info-section">
        <h3>Players</h3>
        <div class="player-count">{{ totalPlayers }}</div>
      </div>
      
      <div class="info-section">
        <h3>Total Value</h3>
        <div class="total-value">{{ formatCurrency(totalTournamentValue) }}</div>
      </div>
      
      <div class="info-section" v-if="totalRebuys > 0">
        <h3>Re-buys</h3>
        <div class="rebuy-count">{{ totalRebuys }}</div>
      </div>
    </div>
    
    <div class="next-level-preview" v-if="!isBreak && currentLevel < blindLevels.length - 1">
      <h4>Next Level</h4>
      <div class="next-blinds">
        <span 
          class="next-small-blind"
          :style="{ color: settings.blindColors.smallBlind }"
        >{{ formatCurrency(nextBlindLevel.smallBlind) }}</span>
        <span class="divider">/</span>
        <span 
          class="next-big-blind"
          :style="{ color: settings.blindColors.bigBlind }"
        >{{ formatCurrency(nextBlindLevel.bigBlind) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { usePokerStore } from '../stores/pokerStore'
import { computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ClockView',
  setup() {
    const store = usePokerStore()
    
    const isRunning = computed(() => store.isRunning)
    const currentTime = computed(() => store.currentTime)
    const currentLevel = computed(() => store.currentLevel)
    const isBreak = computed(() => store.isBreak)
    const formattedTime = computed(() => store.formattedTime)
    const currentBlindLevel = computed(() => store.currentBlindLevel)
    const blindLevels = computed(() => store.blindLevels)
    const settings = computed(() => store.settings)
    const players = computed(() => store.players)
    const totalPlayers = computed(() => store.totalPlayers)
    const totalTournamentValue = computed(() => store.totalTournamentValue)
    const totalRebuys = computed(() => store.totalRebuys)
    
    const nextBlindLevel = computed(() => {
      if (currentLevel.value < blindLevels.value.length - 1) {
        return blindLevels.value[currentLevel.value + 1]
      }
      return blindLevels.value[currentLevel.value]
    })
    
    const progressPercentage = computed(() => {
      if (isBreak.value) {
        return (store.breakTime / (store.settings.breakDuration * 60)) * 100
      }
      const currentLevelData = blindLevels.value[currentLevel.value]
      if (currentLevelData) {
        return (currentTime.value / (currentLevelData.time * 60)) * 100
      }
      return 0
    })
    
    const toggleTimer = () => {
      if (isRunning.value) {
        store.pauseTimer()
      } else {
        store.startTimer()
      }
    }
    
    const nextLevel = () => {
      store.nextLevel()
    }
    
    const previousLevel = () => {
      store.previousLevel()
    }
    
    const skipBreak = () => {
      store.endBreak()
    }
    
    const resetTimer = () => {
      if (confirm('Are you sure you want to reset the timer?')) {
        store.resetTimer()
      }
    }
    
    const formatCurrency = (amount) => {
      return store.formatCurrency(amount)
    }
    
    let timerInterval = null
    
    onMounted(() => {
      store.loadFromLocalStorage()
      
      // Start the timer interval
      timerInterval = setInterval(() => {
        store.tick()
      }, 1000)
    })
    
    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    })
    
    return {
      isRunning,
      currentTime,
      currentLevel,
      isBreak,
      formattedTime,
      currentBlindLevel,
      blindLevels,
      settings,
      players,
      totalPlayers,
      totalTournamentValue,
      totalRebuys,
      nextBlindLevel,
      progressPercentage,
      toggleTimer,
      nextLevel,
      previousLevel,
      skipBreak,
      resetTimer,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.clock-container {
  min-height: 80vh;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  width: 100%;
  overflow-x: hidden;
}

.clock-header {
  text-align: center;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
}

.current-level h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.blinds {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  flex-wrap: wrap;
}

.divider {
  font-size: 1.5rem;
  color: #ffd700;
  font-weight: 700;
}

.break-info h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.break-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  flex-wrap: wrap;
}

.break-message i {
  font-size: 1.5rem;
  color: #ffd700;
}

.timer-display {
  margin-top: 1.5rem;
}

.time {
  font-size: 3rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  max-width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  transition: width 0.3s ease;
}

.controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 500px;
}

.control-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
  min-width: 80px;
  justify-content: center;
}

.control-btn.primary {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
}

.control-btn.primary.running {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
}

.control-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.control-btn.skip {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #333;
  font-weight: 700;
}

.control-btn.danger {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.tournament-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 400px;
}

.info-section {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 100px;
  flex: 1;
}

.info-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #ffd700;
  font-weight: 600;
}

.player-count,
.total-value,
.rebuy-count {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4ecdc4;
}

.next-level-preview {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 300px;
}

.next-level-preview h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #ffd700;
  font-weight: 600;
}

.next-blinds {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  flex-wrap: wrap;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .clock-container {
    min-height: 70vh;
    padding: 0.75rem;
  }
  
  .clock-header {
    margin-bottom: 1.5rem;
  }
  
  .current-level h2,
  .break-info h2 {
    font-size: 2rem;
  }
  
  .blinds {
    font-size: 1.5rem;
    gap: 0.75rem;
  }
  
  .time {
    font-size: 2.5rem;
  }
  
  .controls {
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .control-btn {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
    min-width: 70px;
  }
  
  .tournament-info {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .info-section {
    padding: 0.75rem;
    min-width: 80px;
  }
  
  .info-section h3 {
    font-size: 0.8rem;
  }
  
  .player-count,
  .total-value,
  .rebuy-count {
    font-size: 1rem;
  }
  
  .progress-bar {
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  .clock-container {
    padding: 0.5rem;
  }
  
  .current-level h2,
  .break-info h2 {
    font-size: 1.75rem;
  }
  
  .blinds {
    font-size: 1.25rem;
    gap: 0.5rem;
  }
  
  .time {
    font-size: 2rem;
  }
  
  .controls {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .control-btn {
    width: 100%;
    max-width: 200px;
    padding: 0.75rem;
  }
  
  .tournament-info {
    flex-direction: column;
    align-items: center;
  }
  
  .info-section {
    width: 100%;
    max-width: 200px;
  }
  
  .progress-bar {
    max-width: 200px;
  }
  
  .break-message {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>