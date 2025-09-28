<template>
  <div 
    class="setup-container"
    :style="{ 
      background: `linear-gradient(135deg, ${settings.backgroundGradient.start} 0%, ${settings.backgroundGradient.end} 100%)` 
    }"
  >
    <div class="setup-header">
      <h1>Player Setup</h1>
      <p>Add players and their buy-in information</p>
    </div>
    
    <!-- Prize Distribution -->
    <div class="prize-distribution">
      <h2>Prize Distribution</h2>
      <div class="prize-settings">
        <div class="prize-slots">
          <label for="prizeSlots">Number of Prize Slots</label>
          <select id="prizeSlots" v-model="selectedPrizeSlots" @change="updatePrizeSlots">
            <option value="1">1 Winner (100%)</option>
            <option value="2">2 Winners (70% / 30%)</option>
            <option value="3">3 Winners (50% / 30% / 20%)</option>
          </select>
        </div>
        
        <div class="prize-breakdown" v-if="calculatedPrizeDistribution.length > 0">
          <h3>Prize Breakdown</h3>
          <div class="prize-list">
            <div 
              v-for="slot in calculatedPrizeDistribution" 
              :key="slot.position"
              class="prize-slot"
            >
              <div class="prize-position">
                <span class="position">{{ getPositionText(slot.position) }}</span>
                <span class="percentage">{{ slot.percentage }}%</span>
              </div>
              <div class="prize-amount">
                {{ formatCurrency(slot.amount) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="add-player-form">
      <h2>Add New Player</h2>
      <form @submit.prevent="addPlayer" class="player-form">
        <div class="form-group">
          <label for="playerName">Player Name</label>
          <input 
            type="text" 
            id="playerName"
            v-model="newPlayer.name" 
            placeholder="Enter player name"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="buyIn">Buy-in Amount ({{ newPlayer.buyIn * settings.chipRatio }} chips)</label>
          <div class="input-with-hint">
            <input 
              type="number" 
              id="buyIn"
              v-model.number="newPlayer.buyIn" 
              placeholder="50"
              min="0"
              step="0.01"
              required
            >
          </div>
        </div>
        
        <div class="form-group">
          <button type="submit" class="add-player-btn">
            <i class="fas fa-plus"></i>
            Add Player
          </button>
        </div>
      </form>
    </div>
    
    <div class="players-list" v-if="players.length > 0">
      <h2>Players ({{ totalPlayers }})</h2>
      
      <div class="tournament-summary">
        <div class="summary-item">
          <span class="label">Total Buy-ins:</span>
          <span class="value">{{ formatCurrency(totalBuyIns) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Re-buys:</span>
          <span class="value">{{ formatCurrency(totalRebuys) }}</span>
        </div>
        <div class="summary-item total">
          <span class="label">Tournament Value:</span>
          <span class="value">{{ formatCurrency(totalTournamentValue) }}</span>
        </div>
      </div>
      
      <div class="players-grid">
        <div 
          v-for="player in players" 
          :key="player.id"
          class="player-card"
        >
          <div class="player-header">
            <h3>{{ player.name }}</h3>
            <button 
              @click="removePlayer(player.id)"
              class="remove-btn"
              title="Remove Player"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="player-details">
            <div class="detail-item">
              <span class="label">Buy-in:</span>
              <span class="value">{{ formatCurrency(player.buyIn) }}</span>
            </div>
            
            <div class="detail-item">
              <span class="label">Chips:</span>
              <span class="value">{{ player.chips.toLocaleString() }}</span>
            </div>
            
            <div class="detail-item" v-if="player.rebuys > 0">
              <span class="label">Re-buys:</span>
              <span class="value">{{ player.rebuys }} ({{ formatCurrency(player.totalRebuyAmount) }})</span>
            </div>
          </div>
          
          <div class="player-actions">
            <button 
              @click="showRebuyModal(player)"
              class="rebuy-btn"
            >
              <i class="fas fa-plus"></i>
              Re-buy
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Re-buy Modal -->
    <div v-if="showRebuy" class="modal-overlay" @click="closeRebuyModal">
      <div 
        class="modal" 
        @click.stop
        :style="{ 
          background: `linear-gradient(135deg, ${settings.backgroundGradient.start} 0%, ${settings.backgroundGradient.end} 100%)` 
        }"
      >
        <div class="modal-header">
          <h3>Add Re-buy for {{ selectedPlayer.name }}</h3>
          <button @click="closeRebuyModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="rebuyAmount">Re-buy Amount</label>
            <div class="input-with-hint">
              <input 
                type="number" 
                id="rebuyAmount"
                v-model.number="rebuyAmount" 
                placeholder="25"
                min="0"
                step="0.01"
                required
              >
              <small class="input-hint">Will add {{ rebuyAmount * settings.chipRatio }} chips</small>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeRebuyModal" class="cancel-btn">Cancel</button>
          <button @click="confirmRebuy" class="confirm-btn">Add Re-buy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usePokerStore } from '../stores/pokerStore'
import { computed, ref, onMounted } from 'vue'

export default {
  name: 'SetupView',
  setup() {
    const store = usePokerStore()
    
    const newPlayer = ref({
      name: '',
      buyIn: 50
    })
    
    const showRebuy = ref(false)
    const selectedPlayer = ref(null)
    const rebuyAmount = ref(25)
    
    const players = computed(() => store.players)
    const totalPlayers = computed(() => store.totalPlayers)
    const totalBuyIns = computed(() => store.totalBuyIns)
    const totalRebuys = computed(() => store.totalRebuys)
    const totalTournamentValue = computed(() => store.totalTournamentValue)
    const prizeSlots = computed(() => store.prizeSlots)
    const selectedPrizeSlots = ref(store.prizeSlots)
    const calculatedPrizeDistribution = computed(() => store.calculatedPrizeDistribution)
    const settings = computed(() => store.settings)
    
    const addPlayer = () => {
      if (newPlayer.value.name && newPlayer.value.buyIn > 0) {
        const chips = newPlayer.value.buyIn * store.settings.chipRatio
        store.addPlayer({
          name: newPlayer.value.name,
          buyIn: newPlayer.value.buyIn,
          chips: chips
        })
        
        newPlayer.value = {
          name: '',
          buyIn: 50
        }
      }
    }
    
    const removePlayer = (id) => {
      if (confirm('Are you sure you want to remove this player?')) {
        store.removePlayer(id)
      }
    }
    
    const showRebuyModal = (player) => {
      selectedPlayer.value = player
      rebuyAmount.value = 25
      showRebuy.value = true
    }
    
    const closeRebuyModal = () => {
      showRebuy.value = false
      selectedPlayer.value = null
      rebuyAmount.value = 25
    }
    
    const confirmRebuy = () => {
      if (rebuyAmount.value > 0) {
        store.addRebuy(selectedPlayer.value.id, rebuyAmount.value)
        closeRebuyModal()
      }
    }
    
    const updatePrizeSlots = () => {
      store.updatePrizeSlots(parseInt(selectedPrizeSlots.value))
    }
    
    const formatCurrency = (amount) => {
      return store.formatCurrency(amount)
    }
    
    const getPositionText = (position) => {
      const positions = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th']
      return positions[position - 1] || `${position}th`
    }
    
    onMounted(() => {
      store.loadFromLocalStorage()
      selectedPrizeSlots.value = store.prizeSlots
    })
    
    return {
      newPlayer,
      showRebuy,
      selectedPlayer,
      rebuyAmount,
      players,
      totalPlayers,
      totalBuyIns,
      totalRebuys,
      totalTournamentValue,
      prizeSlots,
      selectedPrizeSlots,
      calculatedPrizeDistribution,
      settings,
      addPlayer,
      removePlayer,
      showRebuyModal,
      closeRebuyModal,
      confirmRebuy,
      updatePrizeSlots,
      formatCurrency,
      getPositionText
    }
  }
}
</script>

<style scoped>
.setup-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.setup-header {
  text-align: center;
  margin-bottom: 30px;
}

.setup-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  font-weight: 700;
}

.setup-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 400;
}

.prize-distribution {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.prize-distribution h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #ffd700;
  font-weight: 600;
}

.prize-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.prize-slots {
  display: flex;
  flex-direction: column;
}

.prize-slots label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #ffd700;
  font-size: 1rem;
}

.prize-slots select {
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1rem;
  font-family: inherit;
}

.prize-breakdown h3 {
  margin-bottom: 15px;
  color: #ffd700;
  font-weight: 600;
  font-size: 1.2rem;
}

.prize-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prize-slot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.prize-position {
  display: flex;
  align-items: center;
  gap: 15px;
}

.position {
  font-weight: 700;
  color: #ffd700;
  font-size: 1.1rem;
}

.percentage {
  color: #ff6b6b;
  font-weight: 600;
  font-size: 1rem;
}

.prize-amount {
  font-weight: 700;
  font-size: 1.1rem;
  color: #4ecdc4;
}

.add-player-form {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.add-player-form h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #ffd700;
  font-weight: 600;
}

.player-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 20px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #ffd700;
  font-size: 1rem;
}

.form-group input {
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1rem;
  font-family: inherit;
}

.input-with-hint {
  display: flex;
  flex-direction: column;
}

.input-hint {
  margin-top: 5px;
  font-size: 0.9rem;
  opacity: 0.8;
  color: #ffd700;
  font-weight: 400;
}

.add-player-btn {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  height: fit-content;
}

.add-player-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.players-list h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #ffd700;
  font-weight: 600;
}

.tournament-summary {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  font-weight: 700;
  font-size: 1.1rem;
  color: #4ecdc4;
  border-top: 2px solid rgba(78, 205, 196, 0.3);
  padding-top: 12px;
  margin-top: 8px;
}

.summary-item .label {
  color: #ffd700;
  font-weight: 600;
}

.summary-item .value {
  font-weight: 600;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.player-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.player-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.player-header h3 {
  margin: 0;
  color: #ffd700;
  font-size: 1.2rem;
  font-weight: 600;
}

.remove-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #ff5252;
  transform: scale(1.1);
}

.player-details {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: #ffd700;
  font-weight: 600;
}

.detail-item .value {
  font-weight: 600;
  color: #4ecdc4;
}

.player-actions {
  display: flex;
  gap: 10px;
}

.rebuy-btn {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-weight: 600;
}

.rebuy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  border-radius: 15px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  color: white;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  font-family: inherit;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header h3 {
  margin: 0;
  color: #ffd700;
  font-weight: 600;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ffd700;
  padding: 5px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #ffed4e;
  transform: scale(1.1);
}

.modal-body {
  padding: 20px;
}

.modal-body .form-group label {
  color: #ffd700;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 8px;
}

.modal-body .form-group input {
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1rem;
  font-family: inherit;
  width: 100%;
}

.modal-body .input-hint {
  margin-top: 5px;
  font-size: 0.9rem;
  opacity: 0.8;
  color: #ffd700;
  font-weight: 400;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  font-weight: 600;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.confirm-btn {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  font-weight: 600;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .player-form {
    grid-template-columns: 1fr;
  }
  
  .players-grid {
    grid-template-columns: 1fr;
  }
}
</style>