import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAME_CONFIG, UPGRADES, GENERATORS, ACHIEVEMENTS } from '../constants/GameConstants';
import soundManager from '../utils/SoundManager';
import syncService from '../services/SyncService';
import offlineQueue from '../utils/OfflineQueue';

const useGameStore = create((set, get) => ({
  // Game State
  coins: 0,
  coinsPerTap: 1, // Base coins per tap
  coinsPerSecond: 0,
  totalCoinsEarned: 0,
  
  // Upgrades
  upgrades: {
    tapMultiplier: 0,
    autoClicker: 0,
    coinMagnet: 0,
    streakMultiplier: 0,
    flipSpeed: 0,
    multiBet: 0,
  },
  
  // Generators
  generators: {
    basic: 0,
    intermediate: 0,
    advanced: 0,
    autoFlipper: 0,
  },
  
  // Generator intervals
  generatorIntervals: {},
  
  // Prestige System
  prestigeLevel: 0,
  prestigePoints: 0,
  totalPrestiges: 0,
  prestigeMultiplier: 1, // Global multiplier from prestige
  prestigeUpgrades: {
    coinMultiplier: 0,
    generatorBoost: 0,
    streakPower: 0,
    betReturns: 0,
  },
  
  // Achievements
  achievements: Object.keys(ACHIEVEMENTS).reduce((acc, key) => {
    acc[key] = { ...ACHIEVEMENTS[key] };
    return acc;
  }, {}),
  achievementMultiplier: 1, // Global multiplier from achievements
  maxStreak: 0, // Track maximum streak achieved
  
  // Coin Flip State
  isFlipping: false,
  lastFlipResult: null,
  headsStreak: 0,
  totalFlips: 0,
  totalHeads: 0,
  headsChance: 0.5, // 50% chance for heads - completely fair
  
  // Betting System
  bettingMode: false,
  currentBet: 0,
  totalBetsWon: 0,
  totalBetsLost: 0,
  biggestWin: 0,
  biggestLoss: 0,
  
  // Stats
  totalTaps: 0,
  totalTimePlayedSeconds: 0,
  lastSaveTime: Date.now(),
  
  // Sound Settings
  soundEnabled: true,
  soundVolume: 0.5,
  
  // Accessibility Settings
  highContrastMode: false,
  reducedMotion: false,
  screenReaderMode: false,

  // Sync Status
  syncEnabled: false,
  lastSyncTime: null,
  nextSyncIn: 0,
  isOnline: true,
  syncInProgress: false,
  pendingActions: 0,
  
  // Actions
  tap: () => {
    const state = get();
    const coinsEarned = state.coinsPerTap || 1;
    
    // Play tap sound
    soundManager.playTap();
    
    set((state) => ({
      coins: (state.coins || 0) + coinsEarned,
      totalCoinsEarned: (state.totalCoinsEarned || 0) + coinsEarned,
      totalTaps: (state.totalTaps || 0) + 1,
    }));
  },
  
  flipCoin: () => {
    const state = get();
    if (state.isFlipping) return;
    
    // Check if betting and validate bet
    if (state.bettingMode && state.currentBet > 0) {
      if (state.currentBet > state.coins) {
        return; // Not enough coins to bet
      }
    }
    
    // Set flipping state
    set({ isFlipping: true });
    
    // Play coin flip sound
    soundManager.playCoinFlip();
    
    // Simulate coin flip delay
    setTimeout(() => {
      const state = get();
      const random = Math.random();
      const isHeads = random < state.headsChance;
      const result = isHeads ? 'heads' : 'tails';
      
      // Handle betting mode
      if (state.bettingMode && state.currentBet > 0) {
        // Process bet result (heads = win)
        get().processBetResult(isHeads, state.currentBet);
        
        // Update stats for betting
        const newHeadsStreak = isHeads ? (state.headsStreak || 0) + 1 : 0;
        const newMaxStreak = Math.max(state.maxStreak || 0, newHeadsStreak);
        
        set((state) => ({
          isFlipping: false,
          lastFlipResult: result,
          totalTaps: (state.totalTaps || 0) + 1,
          totalFlips: (state.totalFlips || 0) + 1,
          totalHeads: (state.totalHeads || 0) + (isHeads ? 1 : 0),
          headsStreak: newHeadsStreak,
          maxStreak: newMaxStreak,
        }));
        
        // Check achievements after state update
        get().checkAchievements();
        
      } else {
        // Normal mode - calculate coins earned
        let coinsEarned = state.coinsPerTap || 1;
        if (isHeads) {
          coinsEarned *= 2; // Double coins for heads
          
          // Play win sound for heads
          soundManager.playCoinWin();
          
          // Enhanced streak bonus with upgrade multiplier and prestige
          const baseStreakBonus = 0.1; // 10% base
          const streakUpgradeBonus = (state.upgrades?.streakMultiplier || 0) * 0.05; // +5% per level
          const prestigeStreakBonus = (state.prestigeUpgrades?.streakPower || 0) * 0.1; // +10% per prestige level
          const totalStreakBonus = baseStreakBonus + streakUpgradeBonus + prestigeStreakBonus;
          const streakMultiplier = 1 + ((state.headsStreak || 0) * totalStreakBonus);
          coinsEarned = Math.floor(coinsEarned * streakMultiplier);
        }
        
        // Update streak
        const newHeadsStreak = isHeads ? state.headsStreak + 1 : 0;
        const newMaxStreak = Math.max(state.maxStreak, newHeadsStreak);
        
        set((state) => ({
          isFlipping: false,
          lastFlipResult: result,
          coins: (state.coins || 0) + coinsEarned,
          totalCoinsEarned: (state.totalCoinsEarned || 0) + coinsEarned,
          totalTaps: (state.totalTaps || 0) + 1,
          totalFlips: (state.totalFlips || 0) + 1,
          totalHeads: (state.totalHeads || 0) + (isHeads ? 1 : 0),
          headsStreak: newHeadsStreak,
          maxStreak: newMaxStreak,
        }));
        
        // Check achievements after state update
        get().checkAchievements();
      }
    }, get().getFlipDuration()); // Dynamic animation duration based on upgrades
  },
  
  // Betting Actions
  setBettingMode: (enabled) => {
    set({ bettingMode: enabled });
    if (!enabled) {
      set({ currentBet: 0 });
    }
  },
  
  setBetAmount: (amount) => {
    const state = get();
    const maxBet = Math.min(amount, state.coins || 0);
    set({ 
      currentBet: maxBet,
      bettingMode: maxBet > 0 // Auto-activate betting mode when amount > 0
    });
  },
  
  processBetResult: (isWin, betAmount) => {
    const state = get();
    
    if (isWin) {
      // Play win sound for betting
      soundManager.playCoinWin();
      
      // Apply prestige bet returns boost
      const baseBetMultiplier = 1.8;
      const prestigeBetBonus = (state.prestigeUpgrades?.betReturns || 0) * 0.05;
      const finalBetMultiplier = baseBetMultiplier + prestigeBetBonus;
      
      const winAmount = Math.floor(betAmount * finalBetMultiplier);
      const profit = winAmount - betAmount;
      
      set((state) => ({
        coins: (state.coins || 0) + profit,
        totalCoinsEarned: (state.totalCoinsEarned || 0) + profit,
        totalBetsWon: (state.totalBetsWon || 0) + 1,
        biggestWin: Math.max(state.biggestWin || 0, profit),
      }));
    } else {
      set((state) => ({
        coins: (state.coins || 0) - betAmount,
        totalBetsLost: (state.totalBetsLost || 0) + 1,
        biggestLoss: Math.max(state.biggestLoss || 0, betAmount),
      }));
    }
    
    // Reset bet and betting mode after processing
    set({ 
      currentBet: 0,
      bettingMode: false 
    });
  },
  
  buyUpgrade: (upgradeType) => {
    const state = get();
    const upgradeLimits = {
      tapMultiplier: 50,
      streakMultiplier: 20,
      flipSpeed: 8,
      multiBet: 5,
    };
    
    const maxLevel = upgradeLimits[upgradeType] || 10;
    
    if (state.upgrades[upgradeType] >= maxLevel) {
      return false;
    }
    
    const cost = get().getUpgradeCost(upgradeType);
    
    if (state.coins >= cost) {
      set((state) => ({
        coins: state.coins - cost,
        upgrades: {
          ...state.upgrades,
          [upgradeType]: state.upgrades[upgradeType] + 1,
        },
      }));
      
      // Recalculate multipliers
      get().updateMultipliers();
      return true;
    }
    return false;
  },
  
  getUpgradeCost: (upgradeType) => {
    const state = get();
    const baseCosts = {
      tapMultiplier: 10,
      streakMultiplier: 25,
      flipSpeed: 50,
      multiBet: 100,
    };
    
    const baseCost = baseCosts[upgradeType] || 10;
    const level = state.upgrades[upgradeType] || 0;
    return Math.floor(baseCost * Math.pow(1.15, level));
  },
  
  buyGenerator: (generatorType) => {
    const state = get();
    const generator = GENERATORS[generatorType];
    
    if (!generator) return false;
    
    const cost = get().getGeneratorCost(generatorType);
    
    if (state.coins >= cost) {
      set((state) => ({
        coins: state.coins - cost,
        generators: {
          ...state.generators,
          [generatorType]: state.generators[generatorType] + 1,
        },
      }));
      
      // Start generator if it's the first one
      if (state.generators[generatorType] === 0) {
        get().startGenerator(generatorType);
      }
      
      get().updateMultipliers();
      return true;
    }
    return false;
  },
  
  getGeneratorCost: (generatorType) => {
    const state = get();
    const baseCosts = {
      basic: 15,
      intermediate: 100,
      advanced: 1000,
      autoFlipper: 5000,
    };
    
    const baseCost = baseCosts[generatorType] || 10;
    const level = state.generators[generatorType] || 0;
    return Math.floor(baseCost * Math.pow(1.15, level));
  },
  
  getFlipDuration: () => {
    const state = get();
    const baseTime = 1200; // 1.2 seconds
    const speedReduction = (state.upgrades.flipSpeed || 0) * 100; // -100ms per level
    const minTime = 400; // Minimum 0.4 seconds
    return Math.max(baseTime - speedReduction, minTime);
  },
  
  updateMultipliers: () => {
    const state = get();
    const tapMultiplier = 1 + ((state.upgrades?.tapMultiplier || 0) * 0.5); // +50% per level
    
    // Calculate total coins per second from all generators
    let totalCPS = 0;
    const generatorData = {
      basic: { baseProduction: 1, interval: 5000 },
      intermediate: { baseProduction: 3, interval: 3000 },
      advanced: { baseProduction: 10, interval: 1000 },
      autoFlipper: { baseProduction: 2, interval: 8000 },
    };
    
    if (state.generators) {
      Object.keys(state.generators).forEach(generatorType => {
        const generator = generatorData[generatorType];
        const count = state.generators[generatorType] || 0;
        if (generator && count > 0) {
          let productionPerSecond = (generator.baseProduction * count) / (generator.interval / 1000);
          
          // Apply prestige generator boost
          const generatorBoost = 1 + ((state.prestigeUpgrades?.generatorBoost || 0) * 0.15);
          productionPerSecond *= generatorBoost;
          
          totalCPS += productionPerSecond;
        }
      });
    }
    
    // Apply achievement and prestige multipliers safely
    const achievementMult = state.achievementMultiplier || 1;
    const prestigeMult = state.prestigeMultiplier || 1;
    const finalTapMultiplier = tapMultiplier * achievementMult * prestigeMult;
    
    // Ensure we don't set NaN values
    const newCoinsPerTap = Math.floor(1 * finalTapMultiplier);
    const newCoinsPerSecond = totalCPS;
    
    set({
      coinsPerTap: isNaN(newCoinsPerTap) ? 1 : newCoinsPerTap,
      coinsPerSecond: isNaN(newCoinsPerSecond) ? 0 : newCoinsPerSecond,
    });
  },
  
  startGenerator: (generatorType) => {
    const state = get();
    
    const generatorData = {
      basic: { baseProduction: 1, interval: 5000 },
      intermediate: { baseProduction: 3, interval: 3000 },
      advanced: { baseProduction: 10, interval: 1000 },
      autoFlipper: { baseProduction: 2, interval: 8000 },
    };
    
    const generator = generatorData[generatorType];
    
    if (!generator || state.generatorIntervals[generatorType]) return;
    
    const interval = setInterval(() => {
      const currentState = get();
      const count = currentState.generators[generatorType];
      
      if (count > 0) {
        let coinsGenerated = generator.baseProduction * count;
        
        // Apply prestige generator boost
        const generatorBoost = 1 + ((currentState.prestigeUpgrades?.generatorBoost || 0) * 0.15);
        coinsGenerated *= generatorBoost;
        
        // Special handling for auto-flipper
        if (generatorType === 'autoFlipper') {
          // Simulate coin flip for auto-flipper
          const isHeads = Math.random() < 0.5;
          coinsGenerated = isHeads ? coinsGenerated * 2 : coinsGenerated;
          
          // Play generator sound occasionally (not every time to avoid spam)
          if (Math.random() < 0.1) {
            soundManager.playGenerator();
          }
        }
        
        set((state) => ({
          coins: state.coins + coinsGenerated,
          totalCoinsEarned: state.totalCoinsEarned + coinsGenerated,
        }));
      }
    }, generator.interval);
    
    set((state) => ({
      generatorIntervals: {
        ...state.generatorIntervals,
        [generatorType]: interval,
      },
    }));
  },
  
  stopAllGenerators: () => {
    const state = get();
    Object.values(state.generatorIntervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });
    set({ generatorIntervals: {} });
  },
  
  restartGenerators: () => {
    const state = get();
    get().stopAllGenerators();
    
    Object.keys(state.generators).forEach(generatorType => {
      if (state.generators[generatorType] > 0) {
        get().startGenerator(generatorType);
      }
    });
  },
  
  processOfflineEarnings: () => {
    const state = get();
    const now = Date.now();
    const timeDiff = now - state.lastSaveTime;
    const hoursOffline = Math.min(timeDiff / (1000 * 60 * 60), 24); // 24 hour max
    
    if (hoursOffline > 0.1 && state.coinsPerSecond > 0) {
      // Calculate base offline earnings
      let offlineCoins = Math.floor(state.coinsPerSecond * hoursOffline * 3600);
      
      // Apply prestige multipliers to offline earnings
      const prestigeMult = state.prestigeMultiplier || 1;
      const generatorBoost = 1 + ((state.prestigeUpgrades?.generatorBoost || 0) * 0.15);
      
      offlineCoins = Math.floor(offlineCoins * prestigeMult * generatorBoost);
      
      set((state) => ({
        coins: state.coins + offlineCoins,
        totalCoinsEarned: state.totalCoinsEarned + offlineCoins,
        lastSaveTime: now,
      }));
      
      return { 
        coins: offlineCoins, 
        hours: hoursOffline,
        coinsPerSecond: state.coinsPerSecond,
        multiplier: prestigeMult * generatorBoost
      };
    }
    
    set({ lastSaveTime: now });
    return null;
  },
  
  saveGame: async () => {
    const state = get();
    const gameData = {
      coins: state.coins,
      coinsPerTap: state.coinsPerTap,
      coinsPerSecond: state.coinsPerSecond,
      totalCoinsEarned: state.totalCoinsEarned,
      upgrades: state.upgrades,
      generators: state.generators,
      prestigeLevel: state.prestigeLevel,
      prestigePoints: state.prestigePoints,
      totalPrestiges: state.totalPrestiges,
      prestigeUpgrades: state.prestigeUpgrades,
      totalTaps: state.totalTaps,
      totalTimePlayedSeconds: state.totalTimePlayedSeconds,
      lastSaveTime: Date.now(),
    };
    
    try {
      await AsyncStorage.setItem('gameData', JSON.stringify(gameData));
    } catch (error) {
      console.error('Error saving game:', error);
    }
  },
  
  loadGame: async () => {
    try {
      const gameData = await AsyncStorage.getItem('gameData');
      if (gameData) {
        const parsedData = JSON.parse(gameData);
        set(parsedData);
        get().updatePrestigeMultiplier();
        get().updateMultipliers();
        get().restartGenerators();
        return get().processOfflineEarnings();
      } else {
        // First time load - ensure defaults are set
        get().updateMultipliers();
      }
    } catch (error) {
      console.error('Error loading game:', error);
      // On error, ensure we have safe defaults
      get().updateMultipliers();
    }
    return null;
  },
  
  resetGame: async () => {
    get().stopAllGenerators();
    
    set({
      coins: 0,
      coinsPerTap: 1, // Base coins per tap
      coinsPerSecond: 0,
      totalCoinsEarned: 0,
      upgrades: { 
        tapMultiplier: 0, 
        autoClicker: 0, 
        coinMagnet: 0,
        streakMultiplier: 0,
        flipSpeed: 0,
        multiBet: 0,
      },
      generators: { 
        basic: 0, 
        intermediate: 0, 
        advanced: 0,
        autoFlipper: 0,
      },
      generatorIntervals: {},
      achievements: Object.keys(ACHIEVEMENTS).reduce((acc, key) => {
        acc[key] = { ...ACHIEVEMENTS[key] };
        return acc;
      }, {}),
      achievementMultiplier: 1,
      maxStreak: 0,
      isFlipping: false,
      lastFlipResult: null,
      headsStreak: 0,
      totalFlips: 0,
      totalHeads: 0,
      bettingMode: false,
      currentBet: 0,
      totalBetsWon: 0,
      totalBetsLost: 0,
      biggestWin: 0,
      biggestLoss: 0,
      totalTaps: 0,
      totalTimePlayedSeconds: 0,
      lastSaveTime: Date.now(),
      prestigeLevel: 0,
      prestigePoints: 0,
      totalPrestiges: 0,
      prestigeMultiplier: 1,
      prestigeUpgrades: {
        coinMultiplier: 0,
        generatorBoost: 0,
        streakPower: 0,
        betReturns: 0,
      },
    });
    
    await AsyncStorage.removeItem('gameData');
    get().updateMultipliers();
  },

  // Achievement System
  checkAchievements: () => {
    const state = get();
    const newUnlockedAchievements = [];

    Object.keys(state.achievements).forEach(achievementKey => {
      const achievement = state.achievements[achievementKey];
      
      if (!achievement.unlocked) {
        let currentValue = 0;
        
        switch (achievement.type) {
          case 'totalFlips':
            currentValue = state.totalFlips;
            break;
          case 'maxStreak':
            currentValue = state.maxStreak;
            break;
          case 'totalCoinsEarned':
            currentValue = state.totalCoinsEarned;
            break;
          case 'totalBetsWon':
            currentValue = state.totalBetsWon;
            break;
          case 'biggestWin':
            currentValue = state.biggestWin;
            break;
          case 'totalPrestiges':
            currentValue = state.totalPrestiges;
            break;
        }

        if (currentValue >= achievement.requirement) {
          newUnlockedAchievements.push(achievementKey);
          get().unlockAchievement(achievementKey);
        }
      }
    });

    return newUnlockedAchievements;
  },

  unlockAchievement: (achievementKey) => {
    const state = get();
    const achievement = state.achievements[achievementKey];
    
    if (!achievement || achievement.unlocked) return;

    // Mark as unlocked
    set((state) => ({
      achievements: {
        ...state.achievements,
        [achievementKey]: {
          ...state.achievements[achievementKey],
          unlocked: true,
        },
      },
    }));

    // Apply reward
    get().applyAchievementReward(achievement.reward);

    // Play achievement sound and show notification
    soundManager.playAchievement();
    console.log(`🏆 Achievement Unlocked: ${achievement.name}!`);
  },

  applyAchievementReward: (reward) => {
    if (reward.type === 'coins') {
      set((state) => ({
        coins: state.coins + reward.amount,
        totalCoinsEarned: state.totalCoinsEarned + reward.amount,
      }));
    } else if (reward.type === 'multiplier') {
      const state = get();
      const newMultiplier = state.achievementMultiplier * reward.amount;
      set({ achievementMultiplier: newMultiplier });
      get().updateMultipliers(); // Recalculate with new multiplier
    }
  },

  getUnlockedAchievements: () => {
    const state = get();
    return Object.values(state.achievements).filter(achievement => achievement.unlocked);
  },

  getProgressTowardsAchievement: (achievementKey) => {
    const state = get();
    const achievement = state.achievements[achievementKey];
    
    if (!achievement) return 0;
    
    let currentValue = 0;
    
    switch (achievement.type) {
      case 'totalFlips':
        currentValue = state.totalFlips;
        break;
      case 'maxStreak':
        currentValue = state.maxStreak;
        break;
      case 'totalCoinsEarned':
        currentValue = state.totalCoinsEarned;
        break;
      case 'totalBetsWon':
        currentValue = state.totalBetsWon;
        break;
      case 'biggestWin':
        currentValue = state.biggestWin;
        break;
      case 'totalPrestiges':
        currentValue = state.totalPrestiges;
        break;
    }
    
    return Math.min(currentValue / achievement.requirement, 1);
  },

  // Prestige System
  canPrestige: () => {
    const state = get();
    const cost = get().getPrestigeCost();
    return state.totalCoinsEarned >= cost;
  },

  getPrestigeCost: () => {
    const state = get();
    const baseCost = 1000000; // 1M coins
    return Math.floor(baseCost * Math.pow(2.5, state.prestigeLevel));
  },

  getPrestigePoints: () => {
    const state = get();
    const cost = get().getPrestigeCost();
    if (state.totalCoinsEarned < cost) return 0;
    
    // Calculate prestige points based on total coins earned vs cost
    const multiplier = Math.floor(state.totalCoinsEarned / cost);
    return Math.max(1, Math.floor(Math.log2(multiplier) + 1));
  },

  performPrestige: () => {
    const state = get();
    if (!get().canPrestige()) return false;

    const pointsGained = get().getPrestigePoints();
    
    // Keep prestige-related stats only
    const keepStats = {
      prestigeLevel: state.prestigeLevel + 1,
      prestigePoints: state.prestigePoints + pointsGained,
      totalPrestiges: state.totalPrestiges + 1,
      prestigeUpgrades: { ...state.prestigeUpgrades },
    };

    // Reset everything else to initial state
    get().stopAllGenerators();
    
    set({
      coins: 0,
      coinsPerTap: 1,
      coinsPerSecond: 0,
      totalCoinsEarned: 0,
      upgrades: { 
        tapMultiplier: 0, 
        autoClicker: 0, 
        coinMagnet: 0,
        streakMultiplier: 0,
        flipSpeed: 0,
        multiBet: 0,
      },
      generators: { 
        basic: 0, 
        intermediate: 0, 
        advanced: 0,
        autoFlipper: 0,
      },
      generatorIntervals: {},
      achievements: Object.keys(ACHIEVEMENTS).reduce((acc, key) => {
        acc[key] = { ...ACHIEVEMENTS[key] };
        return acc;
      }, {}),
      achievementMultiplier: 1,
      maxStreak: 0,
      isFlipping: false,
      lastFlipResult: null,
      headsStreak: 0,
      totalFlips: 0,
      totalHeads: 0,
      bettingMode: false,
      currentBet: 0,
      totalBetsWon: 0,
      totalBetsLost: 0,
      biggestWin: 0,
      biggestLoss: 0,
      totalTaps: 0,
      totalTimePlayedSeconds: 0,
      lastSaveTime: Date.now(),
      ...keepStats,
    });
    
    // Play prestige sound
    soundManager.playPrestige();
    
    // Recalculate prestige multiplier and update
    get().updatePrestigeMultiplier();
    get().updateMultipliers();
    get().checkAchievements();
    
    return pointsGained;
  },

  buyPrestigeUpgrade: (upgradeType) => {
    const state = get();
    const cost = get().getPrestigeUpgradeCost(upgradeType);
    const maxLevel = get().getPrestigeUpgradeMaxLevel(upgradeType);
    const currentLevel = state.prestigeUpgrades[upgradeType] || 0;
    
    if (state.prestigePoints >= cost && currentLevel < maxLevel) {
      set((state) => ({
        prestigePoints: state.prestigePoints - cost,
        prestigeUpgrades: {
          ...state.prestigeUpgrades,
          [upgradeType]: currentLevel + 1,
        },
      }));
      
      get().updatePrestigeMultiplier();
      get().updateMultipliers();
      return true;
    }
    return false;
  },

  getPrestigeUpgradeCost: (upgradeType) => {
    const state = get();
    const baseCosts = {
      coinMultiplier: 1,
      generatorBoost: 2,
      streakPower: 3,
      betReturns: 5,
    };
    
    const baseCost = baseCosts[upgradeType] || 1;
    const level = state.prestigeUpgrades[upgradeType] || 0;
    return baseCost + Math.floor(level * 1.5);
  },

  getPrestigeUpgradeMaxLevel: (upgradeType) => {
    const maxLevels = {
      coinMultiplier: 50,
      generatorBoost: 25,
      streakPower: 20,
      betReturns: 10,
    };
    return maxLevels[upgradeType] || 10;
  },

  updatePrestigeMultiplier: () => {
    const state = get();
    let multiplier = 1;
    
    // Base prestige multiplier (1% per prestige level)
    multiplier += state.prestigeLevel * 0.01;
    
    // Coin multiplier upgrade (20% per level)
    multiplier += (state.prestigeUpgrades.coinMultiplier || 0) * 0.2;
    
    set({ prestigeMultiplier: multiplier });
  },

  // Sound Management
  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    soundManager.setEnabled(enabled);
  },

  setSoundVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ soundVolume: clampedVolume });
    soundManager.setVolume(clampedVolume);
  },

  // Accessibility Management
  setHighContrastMode: (enabled) => {
    set({ highContrastMode: enabled });
  },

  setReducedMotion: (enabled) => {
    set({ reducedMotion: enabled });
  },

  setScreenReaderMode: (enabled) => {
    set({ screenReaderMode: enabled });
  },

  // Visual Effects Management
  showFloatingNumber: null, // Will be set by GameScreen
  showParticleEffect: null, // Will be set by GameScreen

  setFloatingNumberHandler: (handler) => {
    set({ showFloatingNumber: handler });
  },

  setParticleHandler: (handler) => {
    set({ showParticleEffect: handler });
  },

  // Game Event Effects
  triggerCoinWinEffect: (amount, x = null, y = null) => {
    const state = get();
    
    // Show floating number
    if (state.showFloatingNumber && x !== null && y !== null) {
      state.showFloatingNumber(amount, x, y, 'coin');
    }
    
    // Show particle effect for big wins
    if (state.showParticleEffect && amount > 50 && x !== null && y !== null) {
      state.showParticleEffect('coinExplosion', x, y);
    }
  },

  triggerStreakEffect: (streakLength, x = null, y = null) => {
    const state = get();
    
    if (streakLength >= 3) {
      // Show streak floating text
      if (state.showFloatingNumber && x !== null && y !== null) {
        state.showFloatingNumber(streakLength, x, y, 'streak');
      }
      
      // Show particle effect for good streaks
      if (state.showParticleEffect && streakLength >= 5 && x !== null && y !== null) {
        state.showParticleEffect('streakCelebration', x, y, streakLength);
      }
    }
  },

  triggerAchievementEffect: (achievementId, x = null, y = null) => {
    const state = get();
    
    // Show achievement floating text
    if (state.showFloatingNumber && x !== null && y !== null) {
      state.showFloatingNumber('ACHIEVEMENT!', x, y, 'achievement');
    }
    
    // Show particle celebration
    if (state.showParticleEffect && x !== null && y !== null) {
      state.showParticleEffect('achievementCelebration', x, y);
    }
  },

  triggerPrestigeEffect: (x = null, y = null) => {
    const state = get();
    
    // Show prestige floating text
    if (state.showFloatingNumber && x !== null && y !== null) {
      state.showFloatingNumber('PRESTIGE!', x, y, 'achievement');
    }
    
    // Show epic particle celebration
    if (state.showParticleEffect && x !== null && y !== null) {
      state.showParticleEffect('prestigeCelebration', x, y);
    }
  },

  triggerPurchaseEffect: (isSuccess = true) => {
    // Basic sound feedback only
    if (isSuccess) {
      soundManager.playPurchase();
    } else {
      soundManager.playError();
    }
  },

  // Sync Management
  initializeSync: async () => {
    const state = get();
    
    try {
      // Check if user is authenticated
      if (syncService.isAuthenticated()) {
        // Get sync status
        const syncStatus = await syncService.getSyncStatus();
        set({
          syncEnabled: syncStatus.syncEnabled,
          lastSyncTime: syncStatus.lastSyncTime,
          nextSyncIn: syncStatus.nextSyncIn,
          pendingActions: syncStatus.queuedActions || 0,
        });
        
        // Load game data from server if available
        try {
          const serverData = await syncService.loadGameData();
          
          // Merge server data with local data (server wins on conflicts)
          set({
            ...state,
            ...serverData.gameData,
            lastSyncTime: serverData.lastSyncTime,
          });
          
          // Update multipliers and restart generators
          get().updateMultipliers();
          get().restartGenerators();
          
          console.log('Game data loaded from server');
        } catch (error) {
          console.warn('Failed to load server data, using local data:', error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize sync:', error);
      set({ syncEnabled: false });
    }
  },

  syncGameData: async (eventType = null, forceSync = false) => {
    const state = get();
    
    if (!syncService.isAuthenticated()) {
      console.log('Not authenticated, skipping sync');
      return { synced: false, reason: 'not_authenticated' };
    }

    if (state.syncInProgress && !forceSync) {
      console.log('Sync already in progress');
      return { synced: false, reason: 'sync_in_progress' };
    }

    set({ syncInProgress: true });

    try {
      // Prepare game data for sync
      const gameData = {
        coins: state.coins,
        coinsPerTap: state.coinsPerTap,
        coinsPerSecond: state.coinsPerSecond,
        totalCoinsEarned: state.totalCoinsEarned,
        upgrades: state.upgrades,
        generators: state.generators,
        achievements: state.achievements,
        prestigeLevel: state.prestigeLevel,
        prestigePoints: state.prestigePoints,
        prestigeUpgrades: state.prestigeUpgrades,
        totalTaps: state.totalTaps,
        totalFlips: state.totalFlips,
        totalHeads: state.totalHeads,
        maxStreak: state.maxStreak,
        headsStreak: state.headsStreak,
        totalBetsWon: state.totalBetsWon,
        totalBetsLost: state.totalBetsLost,
        biggestWin: state.biggestWin,
        biggestLoss: state.biggestLoss,
        lastSaveTime: Date.now(),
      };

      // Calculate session data for anti-cheat
      const sessionData = {
        sessionLength: Date.now() - (state.lastSyncTime || state.lastSaveTime),
        efficiency: state.totalFlips > 0 ? state.totalHeads / state.totalFlips : 0,
        coinsPerMinute: state.sessionLength > 0 ? (state.totalCoinsEarned / (state.sessionLength / 60000)) : 0,
        platform: 'mobile', // or detect platform
      };

      // Sync with server
      const syncResult = await syncService.syncGameData(gameData, sessionData, eventType, forceSync);

      if (syncResult.synced) {
        set({
          lastSyncTime: syncResult.syncedAt,
          nextSyncIn: syncResult.nextSyncIn,
          isOnline: true,
        });

        // Clear local offline queue
        await offlineQueue.clearCompletedActions();
      } else if (syncResult.reason === 'offline') {
        set({ isOnline: false });
        
        // Add to offline queue if it's an important action
        if (eventType) {
          await offlineQueue.addGameSaveAction(gameData, eventType);
        }
      }

      return syncResult;

    } catch (error) {
      console.error('Sync failed:', error);
      set({ isOnline: false });
      
      return { 
        synced: false, 
        error: error.message 
      };
    } finally {
      set({ syncInProgress: false });
    }
  },

  // Enhanced action methods with sync integration
  enhancedCoinFlip: async () => {
    // Call original coin flip
    get().flipCoin();
    
    // Add to offline queue for sync
    const state = get();
    await offlineQueue.addCoinFlipAction(
      state.lastFlipResult,
      state.coinsPerTap,
      state.headsStreak
    );
    
    // Trigger sync if critical (long streak)
    if (state.headsStreak >= 10) {
      await get().syncGameData('major_streak');
    }
  },

  enhancedBuyUpgrade: async (upgradeType) => {
    const state = get();
    const cost = get().getUpgradeCost(upgradeType);
    
    // Call original upgrade purchase
    const success = get().buyUpgrade(upgradeType);
    
    if (success) {
      // Add to offline queue
      await offlineQueue.addUpgradePurchaseAction(
        upgradeType,
        cost,
        state.upgrades[upgradeType] + 1
      );
      
      // Sync occasionally for major upgrades
      if (cost > 10000) {
        await get().syncGameData('major_upgrade');
      }
    }
    
    return success;
  },

  enhancedPerformPrestige: async () => {
    const state = get();
    const pointsGained = get().getPrestigePoints();
    const previousLevel = state.prestigeLevel;
    
    // Call original prestige
    const result = get().performPrestige();
    
    if (result) {
      // Add to offline queue as critical action
      await offlineQueue.addPrestigeAction(pointsGained, previousLevel);
      
      // Force immediate sync for prestige
      await get().syncGameData('prestige_activation', true);
    }
    
    return result;
  },

  enhancedUnlockAchievement: async (achievementKey) => {
    const state = get();
    const achievement = state.achievements[achievementKey];
    
    if (!achievement || achievement.unlocked) return;
    
    // Call original unlock
    get().unlockAchievement(achievementKey);
    
    // Add to offline queue as critical action
    await offlineQueue.addAchievementUnlockAction(
      achievementKey,
      achievement.reward
    );
    
    // Force sync for achievements
    await get().syncGameData('major_achievement_unlock', true);
  },

  // Authentication methods
  loginUser: async (emailOrUsername, password) => {
    try {
      const result = await syncService.login(emailOrUsername, password);
      
      if (result.success) {
        // Initialize sync after login
        await get().initializeSync();
        
        set({
          syncEnabled: true,
          isOnline: true,
        });
      }
      
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  },

  registerUser: async (username, email, password) => {
    try {
      const result = await syncService.register(username, email, password);
      
      if (result.success) {
        // Initialize sync after registration
        await get().initializeSync();
        
        set({
          syncEnabled: true,
          isOnline: true,
        });
      }
      
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    }
  },

  logoutUser: async () => {
    try {
      // Sync before logout
      await get().syncGameData('user_logout', true);
      
      // Logout from service
      await syncService.logout();
      
      set({
        syncEnabled: false,
        lastSyncTime: null,
        nextSyncIn: 0,
        isOnline: false,
        pendingActions: 0,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Process offline queue
  processOfflineQueue: async () => {
    const state = get();
    
    if (!state.isOnline || !syncService.isAuthenticated()) {
      return { processed: 0, reason: 'offline_or_not_authenticated' };
    }

    try {
      const result = await offlineQueue.processQueue(async (action) => {
        try {
          switch (action.type) {
            case 'game_save':
              const syncResult = await syncService.syncGameData(
                action.data.gameData,
                {},
                action.data.eventType,
                true
              );
              return { success: syncResult.synced };
              
            case 'coin_flip':
            case 'upgrade_purchase':
            case 'generator_purchase':
            case 'achievement_unlock':
            case 'prestige_activation':
              // These actions are processed as part of game_save sync
              return { success: true };
              
            default:
              console.warn(`Unknown action type: ${action.type}`);
              return { success: false, error: 'Unknown action type' };
          }
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      set({ pendingActions: result.remaining });
      
      return result;
    } catch (error) {
      console.error('Failed to process offline queue:', error);
      return { processed: 0, error: error.message };
    }
  },

  // Get sync status
  getSyncStatus: () => {
    const state = get();
    return {
      enabled: state.syncEnabled,
      lastSync: state.lastSyncTime,
      nextSync: state.nextSyncIn,
      online: state.isOnline,
      inProgress: state.syncInProgress,
      pendingActions: state.pendingActions,
      queueStats: offlineQueue.getQueueStats(),
    };
  },
}));

export default useGameStore;