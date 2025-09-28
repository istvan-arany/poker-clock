<template>
  <div 
    class="settings-container"
    :style="{ 
      background: `linear-gradient(135deg, ${settings.backgroundGradient.start} 0%, ${settings.backgroundGradient.end} 100%)` 
    }"
  >
    <div class="settings-header">
      <h1>Tournament Settings</h1>
      <p>Configure blind levels and tournament parameters</p>
    </div>
    
    <div class="settings-sections">
      <!-- Tournament Settings Section -->
      <div class="settings-section">
        <div class="section-header">
          <h2>Tournament Settings</h2>
        </div>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label for="breakDuration">Break Duration (minutes)</label>
            <input 
              type="number" 
              id="breakDuration"
              v-model.number="settings.breakDuration" 
              min="1"
              max="60"
              @change="updateSettings"
            >
          </div>
          
          <div class="setting-item">
            <label for="breakAfterLevels">Break After Every N Levels</label>
            <input 
              type="number" 
              id="breakAfterLevels"
              v-model.number="settings.breakAfterLevels" 
              min="1"
              max="10"
              @change="updateSettings"
            >
          </div>
          
          <div class="setting-item">
            <label for="currency">Currency Symbol</label>
            <input 
              type="text" 
              id="currency"
              v-model="settings.currency" 
              placeholder="$"
              maxlength="3"
              @change="updateSettings"
            >
          </div>
          
          <div class="setting-item">
            <label for="currencyPosition">Currency Position</label>
            <select id="currencyPosition" v-model="settings.currencyPosition" @change="updateSettings">
              <option value="prefix">Prefix ($ 100)</option>
              <option value="suffix">Suffix (100 $)</option>
            </select>
          </div>
          
          <div class="setting-item">
            <label for="chipRatio">Money to Chips Ratio</label>
            <input 
              type="number" 
              id="chipRatio"
              v-model.number="settings.chipRatio" 
              min="1"
              @change="updateSettings"
            >
            <small>1 {{ settings.currency }} = {{ settings.chipRatio }} chips</small>
          </div>
        </div>
        
        <!-- Checkbox Settings Row -->
        <div class="checkbox-settings">
          <div class="setting-item checkbox-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="settings.soundEnabled"
                @change="updateSettings"
              >
              <span class="checkmark"></span>
              Enable Sounds
            </label>
          </div>
          
          <div class="setting-item checkbox-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="settings.autoNextLevel"
                @change="updateSettings"
              >
              <span class="checkmark"></span>
              Auto Next Level
            </label>
          </div>
        </div>
      </div>
      
      <!-- Color Settings Section -->
      <div class="settings-section">
        <div class="section-header">
          <h2>Color Customization</h2>
        </div>
        
        <div class="color-settings">
          <div class="color-group">
            <h3>Background Gradient</h3>
            <div class="color-inputs">
              <div class="color-input">
                <label for="gradientStart">Start Color</label>
                <input 
                  type="color" 
                  id="gradientStart"
                  v-model="settings.backgroundGradient.start"
                  @change="updateBackgroundGradient"
                >
                <input 
                  type="text" 
                  v-model="settings.backgroundGradient.start"
                  @change="updateBackgroundGradient"
                  class="color-text"
                >
              </div>
              
              <div class="color-input">
                <label for="gradientEnd">End Color</label>
                <input 
                  type="color" 
                  id="gradientEnd"
                  v-model="settings.backgroundGradient.end"
                  @change="updateBackgroundGradient"
                >
                <input 
                  type="text" 
                  v-model="settings.backgroundGradient.end"
                  @change="updateBackgroundGradient"
                  class="color-text"
                >
              </div>
            </div>
            
            <div class="gradient-preview" :style="{ background: `linear-gradient(135deg, ${settings.backgroundGradient.start} 0%, ${settings.backgroundGradient.end} 100%)` }">
              <span>Preview</span>
            </div>
          </div>
          
          <div class="color-group">
            <h3>Blind Colors</h3>
            <div class="color-inputs">
              <div class="color-input">
                <label for="smallBlindColor">Small Blind Color</label>
                <input 
                  type="color" 
                  id="smallBlindColor"
                  v-model="settings.blindColors.smallBlind"
                  @change="updateBlindColors"
                >
                <input 
                  type="text" 
                  v-model="settings.blindColors.smallBlind"
                  @change="updateBlindColors"
                  class="color-text"
                >
              </div>
              
              <div class="color-input">
                <label for="bigBlindColor">Big Blind Color</label>
                <input 
                  type="color" 
                  id="bigBlindColor"
                  v-model="settings.blindColors.bigBlind"
                  @change="updateBlindColors"
                >
                <input 
                  type="text" 
                  v-model="settings.blindColors.bigBlind"
                  @change="updateBlindColors"
                  class="color-text"
                >
              </div>
            </div>
            
            <div class="blind-preview">
              <div class="blind-sample">
                <span 
                  class="small-blind-preview"
                  :style="{ color: settings.blindColors.smallBlind }"
                >25</span>
                <span class="divider">/</span>
                <span 
                  class="big-blind-preview"
                  :style="{ color: settings.blindColors.bigBlind }"
                >50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Blind Levels Section -->
      <div class="settings-section">
        <div class="section-header">
          <h2>Blind Levels</h2>
          <button @click="addBlindLevel" class="add-level-btn">
            <i class="fas fa-plus"></i>
            Add Level
          </button>
        </div>
        
        <div class="blind-levels">
          <div 
            v-for="(level, index) in blindLevels" 
            :key="level.level"
            class="blind-level"
          >
            <div class="level-number">
              <span>{{ level.level }}</span>
            </div>
            
            <div class="level-inputs">
              <div class="input-group">
                <label>Small Blind</label>
                <input 
                  type="number" 
                  v-model.number="level.smallBlind" 
                  min="1"
                  @change="updateBlindLevel(index, { smallBlind: level.smallBlind })"
                >
              </div>
              
              <div class="input-group">
                <label>Big Blind</label>
                <input 
                  type="number" 
                  v-model.number="level.bigBlind" 
                  min="1"
                  @change="updateBlindLevel(index, { bigBlind: level.bigBlind })"
                >
              </div>
              
              <div class="input-group">
                <label>Time (min)</label>
                <input 
                  type="number" 
                  v-model.number="level.time" 
                  min="1"
                  max="60"
                  @change="updateBlindLevel(index, { time: level.time })"
                >
              </div>
            </div>
            
            <div class="level-actions">
              <button 
                @click="moveBlindLevel(index, 'up')"
                :disabled="index === 0"
                class="move-btn"
                title="Move Up"
              >
                <i class="fas fa-arrow-up"></i>
              </button>
              
              <button 
                @click="moveBlindLevel(index, 'down')"
                :disabled="index === blindLevels.length - 1"
                class="move-btn"
                title="Move Down"
              >
                <i class="fas fa-arrow-down"></i>
              </button>
              
              <button 
                @click="removeBlindLevel(index)"
                :disabled="blindLevels.length <= 1"
                class="remove-btn"
                title="Remove Level"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usePokerStore } from '../stores/pokerStore'
import { computed, onMounted } from 'vue'

export default {
  name: 'SettingsView',
  setup() {
    const store = usePokerStore()
    
    const settings = computed(() => store.settings)
    const blindLevels = computed(() => store.blindLevels)
    
    const updateSettings = () => {
      store.updateSettings({
        breakDuration: settings.value.breakDuration,
        breakAfterLevels: settings.value.breakAfterLevels,
        currency: settings.value.currency,
        currencyPosition: settings.value.currencyPosition,
        chipRatio: settings.value.chipRatio,
        soundEnabled: settings.value.soundEnabled,
        autoNextLevel: settings.value.autoNextLevel
      })
    }
    
    const updateBackgroundGradient = () => {
      store.updateBackgroundGradient(settings.value.backgroundGradient.start, settings.value.backgroundGradient.end)
    }
    
    const updateBlindColors = () => {
      store.updateBlindColors(settings.value.blindColors.smallBlind, settings.value.blindColors.bigBlind)
    }
    
    const addBlindLevel = () => {
      store.addBlindLevel({
        smallBlind: 100,
        bigBlind: 200,
        time: 20
      })
    }
    
    const updateBlindLevel = (index, updates) => {
      store.updateBlindLevel(index, updates)
    }
    
    const removeBlindLevel = (index) => {
      if (confirm('Are you sure you want to remove this blind level?')) {
        store.removeBlindLevel(index)
      }
    }
    
    const moveBlindLevel = (index, direction) => {
      store.moveBlindLevel(index, direction)
    }
    
    onMounted(() => {
      store.loadFromLocalStorage()
    })
    
    return {
      settings,
      blindLevels,
      updateSettings,
      updateBackgroundGradient,
      updateBlindColors,
      addBlindLevel,
      updateBlindLevel,
      removeBlindLevel,
      moveBlindLevel
    }
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.settings-header {
  text-align: center;
  margin-bottom: 30px;
}

.settings-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  font-weight: 700;
}

.settings-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 400;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.settings-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #ffd700;
  font-weight: 600;
}

.add-level-btn {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}

.add-level-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
}

.setting-item label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #ffd700;
  font-size: 1rem;
}

.setting-item input,
.setting-item select {
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1rem;
  font-family: inherit;
}

.setting-item small {
  margin-top: 5px;
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 400;
}

.checkbox-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.checkbox-item {
  display: flex;
  flex-direction: column;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #ffd700;
  font-size: 1rem;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.color-settings {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.color-group h3 {
  margin-bottom: 15px;
  color: #ffd700;
  font-size: 1.2rem;
  font-weight: 600;
}

.color-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.color-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-input label {
  font-weight: 600;
  color: #ffd700;
  font-size: 1rem;
}

.color-input input[type="color"] {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.color-text {
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 0.9rem;
  font-family: inherit;
}

.gradient-preview {
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  font-size: 1rem;
}

.blind-preview {
  margin-top: 15px;
}

.blind-sample {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.divider {
  color: #ffd700;
  font-size: 1.2rem;
  font-weight: 700;
}

.blind-levels {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.blind-level {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.level-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #333;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.2rem;
}

.level-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffd700;
}

.input-group input {
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1rem;
  font-family: inherit;
}

.level-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.move-btn,
.remove-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.move-btn {
  background: #4ecdc4;
  color: white;
}

.move-btn:hover:not(:disabled) {
  background: #44a08d;
  transform: scale(1.1);
}

.move-btn:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.5;
}

.remove-btn {
  background: #ff6b6b;
  color: white;
}

.remove-btn:hover:not(:disabled) {
  background: #ff5252;
  transform: scale(1.1);
}

.remove-btn:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .checkbox-settings {
    grid-template-columns: 1fr;
  }
  
  .color-inputs {
    grid-template-columns: 1fr;
  }
  
  .blind-level {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .level-inputs {
    grid-template-columns: 1fr;
  }
  
  .level-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>