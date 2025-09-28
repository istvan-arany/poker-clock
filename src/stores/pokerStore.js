import { defineStore } from 'pinia'

export const usePokerStore = defineStore('poker', {
  state: () => ({
    // Timer state
    isRunning: false,
    currentTime: 0,
    currentLevel: 0,
    isBreak: false,
    breakTime: 0,
    breakDuration: 0,
    
    // Players
    players: [],
    
    // Blind levels
    blindLevels: [
      { level: 1, smallBlind: 25, bigBlind: 50, time: 20 },
      { level: 2, smallBlind: 50, bigBlind: 100, time: 20 },
      { level: 3, smallBlind: 75, bigBlind: 150, time: 20 },
      { level: 4, smallBlind: 100, bigBlind: 200, time: 20 },
      { level: 5, smallBlind: 150, bigBlind: 300, time: 20 },
      { level: 6, smallBlind: 200, bigBlind: 400, time: 20 },
      { level: 7, smallBlind: 300, bigBlind: 600, time: 20 },
      { level: 8, smallBlind: 400, bigBlind: 800, time: 20 },
      { level: 9, smallBlind: 500, bigBlind: 1000, time: 20 },
      { level: 10, smallBlind: 750, bigBlind: 1500, time: 20 }
    ],
    
    // Prize distribution
    prizeSlots: 1,
    prizeDistribution: [
      { position: 1, percentage: 100, amount: 0 }
    ],
    
    // Settings
    settings: {
      breakDuration: 5,
      breakAfterLevels: 3,
      soundEnabled: true,
      autoNextLevel: true,
      currency: '$',
      currencyPosition: 'prefix', // 'prefix' or 'suffix'
      chipRatio: 100, // 1 dollar = 100 chips
      // Color settings
      backgroundGradient: {
        start: '#667eea',
        end: '#764ba2'
      },
      blindColors: {
        smallBlind: '#ffd700',
        bigBlind: '#ff6b6b'
      }
    }
  }),

  getters: {
    currentBlindLevel: (state) => {
      return state.blindLevels[state.currentLevel] || state.blindLevels[0]
    },
    
    timeRemaining: (state) => {
      if (state.isBreak) {
        return state.breakDuration * 60 - state.breakTime
      }
      const currentLevel = state.blindLevels[state.currentLevel]
      return currentLevel ? currentLevel.time * 60 - state.currentTime : 0
    },
    
    formattedTime: (state) => {
      const totalSeconds = state.timeRemaining
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    
    totalPlayers: (state) => state.players.length,
    
    totalBuyIns: (state) => {
      return state.players.reduce((total, player) => total + (player.buyIn || 0), 0)
    },
    
    totalRebuys: (state) => {
      return state.players.reduce((total, player) => total + (player.totalRebuyAmount || 0), 0)
    },
    
    totalTournamentValue: (state) => {
      return state.players.reduce((total, player) => {
        return total + (player.buyIn || 0) + (player.totalRebuyAmount || 0)
      }, 0)
    },
    
    calculatedPrizeDistribution: (state) => {
      const totalValue = state.players.reduce((total, player) => {
        return total + (player.buyIn || 0) + (player.totalRebuyAmount || 0)
      }, 0)
      
      return state.prizeDistribution.map(slot => ({
        ...slot,
        amount: (totalValue * slot.percentage) / 100
      }))
    }
  },

  actions: {
    // Helper method to format currency with proper positioning and spacing
    formatCurrency(amount) {
      const currency = this.settings.currency
      const formattedAmount = amount.toLocaleString()
      
      if (this.settings.currencyPosition === 'prefix') {
        return `${currency} ${formattedAmount}`
      } else {
        return `${formattedAmount} ${currency}`
      }
    },

    // Helper method to renumber all levels
    renumberLevels() {
      this.blindLevels.forEach((level, index) => {
        level.level = index + 1
      })
    },

    // Recalculate all players' chips when chip ratio changes
    recalculatePlayerChips() {
      this.players.forEach(player => {
        // Recalculate chips based on buy-in amount
        const buyInChips = (player.buyIn || 0) * this.settings.chipRatio
        
        // Recalculate re-buy chips
        const rebuyChips = (player.totalRebuyAmount || 0) * this.settings.chipRatio
        
        // Update total chips
        player.chips = buyInChips + rebuyChips
        
        // Update re-buy history with new chip amounts
        if (player.rebuyHistory && player.rebuyHistory.length > 0) {
          player.rebuyHistory.forEach(rebuy => {
            rebuy.chips = rebuy.amount * this.settings.chipRatio
          })
        }
      })
      this.saveToLocalStorage()
    },

    // Sound management
    playSound(type) {
      if (!this.settings.soundEnabled) return
      
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
        if (type === 'countdown') {
          // Beep sound for countdown
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.1)
        } else if (type === 'levelChange') {
          // Bell sound for level change
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1)
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
          
          gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.5)
        } else if (type === 'breakStart') {
          // Different sound for break start
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2)
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.4)
          
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.6)
        }
      } catch (error) {
        console.warn('Audio not supported:', error)
      }
    },

    // localStorage persistence
    saveToLocalStorage() {
      const dataToSave = {
        players: this.players,
        blindLevels: this.blindLevels,
        prizeSlots: this.prizeSlots,
        prizeDistribution: this.prizeDistribution,
        settings: this.settings,
        currentLevel: this.currentLevel,
        currentTime: this.currentTime,
        isBreak: this.isBreak,
        breakTime: this.breakTime,
        breakDuration: this.breakDuration
      }
      localStorage.setItem('poker-clock-data', JSON.stringify(dataToSave))
    },

    loadFromLocalStorage() {
      try {
        const savedData = localStorage.getItem('poker-clock-data')
        if (savedData) {
          const data = JSON.parse(savedData)
          
          // Load data if it exists
          if (data.players) this.players = data.players
          if (data.blindLevels) this.blindLevels = data.blindLevels
          if (data.prizeSlots) this.prizeSlots = data.prizeSlots
          if (data.prizeDistribution) this.prizeDistribution = data.prizeDistribution
          if (data.settings) this.settings = { ...this.settings, ...data.settings }
          if (data.currentLevel !== undefined) this.currentLevel = data.currentLevel
          if (data.currentTime !== undefined) this.currentTime = data.currentTime
          if (data.isBreak !== undefined) this.isBreak = data.isBreak
          if (data.breakTime !== undefined) this.breakTime = data.breakTime
          if (data.breakDuration !== undefined) this.breakDuration = data.breakDuration
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error)
      }
    },

    // Timer actions
    startTimer() {
      this.isRunning = true
    },
    
    pauseTimer() {
      this.isRunning = false
    },
    
    resetTimer() {
      this.isRunning = false
      this.currentTime = 0
      this.currentLevel = 0
      this.isBreak = false
      this.breakTime = 0
      this.breakDuration = 0
    },
    
    tick() {
      if (this.isRunning) {
        if (this.isBreak) {
          this.breakTime++
          if (this.breakTime >= this.breakDuration * 60) {
            this.endBreak()
          }
        } else {
          this.currentTime++
          const currentLevel = this.blindLevels[this.currentLevel]
          
          // Play countdown beep for last 5 seconds
          if (currentLevel && this.currentTime >= currentLevel.time * 60 - 5) {
            const timeRemaining = currentLevel.time * 60 - this.currentTime
            if (timeRemaining > 0 && timeRemaining <= 5) {
              this.playSound('countdown')
            }
          }
          
          if (currentLevel && this.currentTime >= currentLevel.time * 60) {
            this.nextLevel()
          }
        }
      }
    },
    
    nextLevel() {
      if (this.currentLevel < this.blindLevels.length - 1) {
        this.currentLevel++
        this.currentTime = 0
        
        // Check if we need a break
        if (this.currentLevel % this.settings.breakAfterLevels === 0) {
          this.startBreak()
        } else {
          this.playSound('levelChange')
        }
      }
    },
    
    previousLevel() {
      if (this.currentLevel > 0) {
        this.currentLevel--
        this.currentTime = 0
        this.isBreak = false
        this.breakTime = 0
        this.breakDuration = 0
      }
    },
    
    startBreak() {
      this.isBreak = true
      this.breakTime = 0
      this.breakDuration = this.settings.breakDuration
      this.playSound('breakStart')
    },
    
    endBreak() {
      this.isBreak = false
      this.breakTime = 0
      this.breakDuration = 0
      this.playSound('levelChange')
    },
    
    // Player management
    addPlayer(player) {
      this.players.push({
        id: Date.now(),
        name: player.name,
        buyIn: player.buyIn || 0,
        chips: player.chips || 0,
        rebuys: 0,
        totalRebuyAmount: 0,
        rebuyHistory: [], // Track individual re-buy amounts
        ...player
      })
      this.saveToLocalStorage()
    },
    
    removePlayer(id) {
      this.players = this.players.filter(player => player.id !== id)
      this.saveToLocalStorage()
    },
    
    updatePlayer(id, updates) {
      const index = this.players.findIndex(player => player.id === id)
      if (index !== -1) {
        this.players[index] = { ...this.players[index], ...updates }
        this.saveToLocalStorage()
      }
    },
    
    // Re-buy functionality
    addRebuy(id, amount) {
      const index = this.players.findIndex(player => player.id === id)
      if (index !== -1) {
        this.players[index].rebuys = (this.players[index].rebuys || 0) + 1
        this.players[index].totalRebuyAmount = (this.players[index].totalRebuyAmount || 0) + amount
        this.players[index].chips = (this.players[index].chips || 0) + (amount * this.settings.chipRatio)
        
        // Add to re-buy history
        if (!this.players[index].rebuyHistory) {
          this.players[index].rebuyHistory = []
        }
        this.players[index].rebuyHistory.push({
          amount: amount,
          chips: amount * this.settings.chipRatio,
          timestamp: new Date().toLocaleTimeString()
        })
        this.saveToLocalStorage()
      }
    },
    
    // Prize distribution management
    updatePrizeSlots(slots) {
      this.prizeSlots = slots
      
      // Default distributions based on number of slots
      if (slots === 1) {
        this.prizeDistribution = [{ position: 1, percentage: 100, amount: 0 }]
      } else if (slots === 2) {
        this.prizeDistribution = [
          { position: 1, percentage: 70, amount: 0 },
          { position: 2, percentage: 30, amount: 0 }
        ]
      } else if (slots === 3) {
        this.prizeDistribution = [
          { position: 1, percentage: 50, amount: 0 },
          { position: 2, percentage: 30, amount: 0 },
          { position: 3, percentage: 20, amount: 0 }
        ]
      } else {
        // For more than 3 slots, create custom distribution
        const percentages = this.calculateCustomDistribution(slots)
        this.prizeDistribution = percentages.map((percentage, index) => ({
          position: index + 1,
          percentage: percentage,
          amount: 0
        }))
      }
      this.saveToLocalStorage()
    },
    
    calculateCustomDistribution(slots) {
      // Custom distribution for more than 3 slots
      const percentages = []
      const basePercentage = 100 / slots
      
      for (let i = 0; i < slots; i++) {
        if (i === 0) {
          percentages.push(Math.round(basePercentage * 1.4)) // Winner gets 40% more
        } else if (i === 1) {
          percentages.push(Math.round(basePercentage * 1.1)) // Second gets 10% more
        } else {
          percentages.push(Math.round(basePercentage * 0.9)) // Others get 10% less
        }
      }
      
      // Adjust to ensure total is 100%
      const total = percentages.reduce((sum, p) => sum + p, 0)
      const adjustment = 100 - total
      percentages[0] += adjustment
      
      return percentages
    },
    
    updatePrizePercentage(position, percentage) {
      const index = this.prizeDistribution.findIndex(slot => slot.position === position)
      if (index !== -1) {
        this.prizeDistribution[index].percentage = percentage
        this.saveToLocalStorage()
      }
    },
    
    // Blind level management
    addBlindLevel(level) {
      const newLevel = {
        level: this.blindLevels.length + 1, // Auto-assign next level number
        smallBlind: level.smallBlind || 100,
        bigBlind: level.bigBlind || 200,
        time: level.time || 20
      }
      this.blindLevels.push(newLevel)
      this.saveToLocalStorage()
    },
    
    updateBlindLevel(index, updates) {
      if (index >= 0 && index < this.blindLevels.length) {
        // Don't allow updating the level number - it's auto-managed
        const { level, ...allowedUpdates } = updates
        this.blindLevels[index] = { ...this.blindLevels[index], ...allowedUpdates }
        this.saveToLocalStorage()
      }
    },
    
    removeBlindLevel(index) {
      if (index >= 0 && index < this.blindLevels.length && this.blindLevels.length > 1) {
        this.blindLevels.splice(index, 1)
        // Renumber all levels after removal
        this.renumberLevels()
        
        // Adjust current level if needed
        if (this.currentLevel >= this.blindLevels.length) {
          this.currentLevel = this.blindLevels.length - 1
        }
        this.saveToLocalStorage()
      }
    },
    
    // Move level up or down
    moveBlindLevel(index, direction) {
      if (direction === 'up' && index > 0) {
        // Swap with previous level
        const temp = this.blindLevels[index]
        this.blindLevels[index] = this.blindLevels[index - 1]
        this.blindLevels[index - 1] = temp
        this.renumberLevels()
        this.saveToLocalStorage()
      } else if (direction === 'down' && index < this.blindLevels.length - 1) {
        // Swap with next level
        const temp = this.blindLevels[index]
        this.blindLevels[index] = this.blindLevels[index + 1]
        this.blindLevels[index + 1] = temp
        this.renumberLevels()
        this.saveToLocalStorage()
      }
    },
    
    // Settings
    updateSettings(newSettings) {
      const oldChipRatio = this.settings.chipRatio
      this.settings = { ...this.settings, ...newSettings }
      
      // If chip ratio changed, recalculate all players' chips
      if (oldChipRatio !== this.settings.chipRatio) {
        this.recalculatePlayerChips()
      } else {
        this.saveToLocalStorage()
      }
    },

    // Color settings
    updateBackgroundGradient(start, end) {
      this.settings.backgroundGradient = { start, end }
      this.saveToLocalStorage()
    },

    updateBlindColors(smallBlind, bigBlind) {
      this.settings.blindColors = { smallBlind, bigBlind }
      this.saveToLocalStorage()
    }
  }
})