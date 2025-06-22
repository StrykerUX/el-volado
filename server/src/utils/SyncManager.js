const GameSave = require('../models/GameSave');
const User = require('../models/User');
const AntiCheatValidator = require('./AntiCheatValidator');

class SyncManager {
  constructor() {
    this.syncInterval = parseInt(process.env.SYNC_INTERVAL_MS) || 1800000; // 30 minutes
    this.batchSizeLimit = parseInt(process.env.BATCH_SIZE_LIMIT) || 500;
    this.compressionEnabled = process.env.COMPRESSION_ENABLED === 'true';
    this.obsessivePlayerProtection = process.env.OBSESSIVE_PLAYER_PROTECTION === 'true';
    
    this.criticalEvents = [
      'prestige_activation',
      'real_money_purchase',
      'major_achievement_unlock',
      'user_logout',
      'account_security_change'
    ];
    
    this.antiCheatValidator = new AntiCheatValidator();
  }

  /**
   * Determines if a sync should be triggered
   */
  shouldTriggerSync(gameSave, eventType = null, forceSync = false) {
    if (forceSync) return true;
    
    // Critical events trigger immediate sync
    if (eventType && this.criticalEvents.includes(eventType)) {
      return true;
    }
    
    // Time-based sync check
    if (gameSave.shouldSync()) {
      return true;
    }
    
    // Threshold-based sync triggers
    const queueSize = gameSave.offline_actions_queue?.length || 0;
    if (queueSize >= this.batchSizeLimit) {
      return true;
    }
    
    // Check if critical events count is high
    if (gameSave.critical_events_count >= 5) {
      return true;
    }
    
    return false;
  }

  /**
   * Process batch sync for a user
   */
  async processBatchSync(userId, gameData, sessionData = {}, eventType = null) {
    try {
      const gameSave = await GameSave.findByUser(userId);
      if (!gameSave) {
        throw new Error('Game save not found for user');
      }

      // Check if sync is needed
      if (!this.shouldTriggerSync(gameSave, eventType)) {
        return {
          success: true,
          synced: false,
          message: 'Sync not required yet',
          nextSyncIn: gameSave.sync_interval - (Date.now() - gameSave.last_sync_time)
        };
      }

      // Anti-cheat validation
      const validationResult = await this.antiCheatValidator.validateGameData(
        gameData, 
        gameSave, 
        sessionData
      );

      if (!validationResult.isValid) {
        return {
          success: false,
          error: 'Anti-cheat validation failed',
          details: validationResult.violations,
          requiresManualReview: validationResult.requiresManualReview
        };
      }

      // Process offline actions queue
      await this.processOfflineActions(gameSave, gameData);

      // Update game data with compression
      const compressedData = this.compressionEnabled ? 
        this.compressGameData(gameData) : gameData;

      // Update the game save
      gameSave.game_data = compressedData;
      gameSave.updateMetadata(sessionData.platform);
      gameSave.updateSyncMetrics();

      // Update personal baselines if session data provided
      if (Object.keys(sessionData).length > 0) {
        gameSave.updatePersonalBaseline(sessionData);
      }

      // Update user statistics
      await this.updateUserStatistics(userId, gameData);

      // Save changes
      await gameSave.save();

      return {
        success: true,
        synced: true,
        message: 'Game data synchronized successfully',
        syncedAt: gameSave.last_sync_time,
        nextSyncIn: gameSave.sync_interval,
        validationScore: validationResult.score,
        obsessivePlayerProtected: gameSave.isObsessivePlayerProtected(),
        actionsProcessed: gameSave.offline_actions_queue?.length || 0
      };

    } catch (error) {
      console.error('Batch sync error:', error);
      return {
        success: false,
        error: error.message,
        requiresManualReview: error.message.includes('suspicious') || error.message.includes('cheat')
      };
    }
  }

  /**
   * Process queued offline actions
   */
  async processOfflineActions(gameSave, gameData) {
    const queue = gameSave.offline_actions_queue || [];
    let processedActions = 0;
    
    for (const action of queue) {
      try {
        switch (action.type) {
          case 'coin_flip':
            await this.processOfflineCoinFlip(action, gameData);
            break;
          case 'upgrade_purchase':
            await this.processOfflineUpgrade(action, gameData);
            break;
          case 'generator_purchase':
            await this.processOfflineGenerator(action, gameData);
            break;
          case 'achievement_unlock':
            await this.processOfflineAchievement(action, gameData);
            break;
          default:
            console.warn(`Unknown offline action type: ${action.type}`);
        }
        processedActions++;
      } catch (error) {
        console.error(`Failed to process offline action:`, error);
        // Continue processing other actions
      }
    }
    
    // Clear processed actions
    gameSave.clearOfflineQueue();
    
    return processedActions;
  }

  /**
   * Process offline coin flip action
   */
  async processOfflineCoinFlip(action, gameData) {
    // Validate coin flip is within reasonable limits
    const timeDiff = Date.now() - new Date(action.timestamp);
    const maxOfflineTime = 24 * 60 * 60 * 1000; // 24 hours
    
    if (timeDiff > maxOfflineTime) {
      throw new Error('Offline action too old');
    }
    
    // Apply coin flip result to game data
    if (action.result === 'heads') {
      gameData.totalHeads = (gameData.totalHeads || 0) + 1;
      gameData.headsStreak = (action.streak || 0);
      gameData.maxStreak = Math.max(gameData.maxStreak || 0, action.streak || 0);
    } else {
      gameData.headsStreak = 0;
    }
    
    gameData.totalFlips = (gameData.totalFlips || 0) + 1;
    gameData.coins = (gameData.coins || 0) + (action.coinsEarned || 0);
    gameData.totalCoinsEarned = (gameData.totalCoinsEarned || 0) + (action.coinsEarned || 0);
  }

  /**
   * Process offline upgrade purchase
   */
  async processOfflineUpgrade(action, gameData) {
    if (!gameData.upgrades) gameData.upgrades = {};
    
    const upgradeType = action.upgradeType;
    const cost = action.cost || 0;
    
    // Validate user had enough coins
    if (gameData.coins < cost) {
      throw new Error('Insufficient coins for offline upgrade');
    }
    
    gameData.upgrades[upgradeType] = (gameData.upgrades[upgradeType] || 0) + 1;
    gameData.coins -= cost;
  }

  /**
   * Process offline generator purchase
   */
  async processOfflineGenerator(action, gameData) {
    if (!gameData.generators) gameData.generators = {};
    
    const generatorType = action.generatorType;
    const cost = action.cost || 0;
    
    // Validate user had enough coins
    if (gameData.coins < cost) {
      throw new Error('Insufficient coins for offline generator');
    }
    
    gameData.generators[generatorType] = (gameData.generators[generatorType] || 0) + 1;
    gameData.coins -= cost;
  }

  /**
   * Process offline achievement unlock
   */
  async processOfflineAchievement(action, gameData) {
    if (!gameData.achievements) gameData.achievements = {};
    
    const achievementId = action.achievementId;
    if (gameData.achievements[achievementId]) {
      gameData.achievements[achievementId].unlocked = true;
      
      // Apply achievement rewards
      const reward = action.reward || {};
      if (reward.type === 'coins') {
        gameData.coins = (gameData.coins || 0) + (reward.amount || 0);
        gameData.totalCoinsEarned = (gameData.totalCoinsEarned || 0) + (reward.amount || 0);
      }
    }
  }

  /**
   * Compress game data for bandwidth optimization
   */
  compressGameData(gameData) {
    // Simple compression: remove unnecessary fields and round numbers
    const compressed = { ...gameData };
    
    // Round decimal values to reduce precision
    if (typeof compressed.coins === 'number') {
      compressed.coins = Math.floor(compressed.coins);
    }
    if (typeof compressed.totalCoinsEarned === 'number') {
      compressed.totalCoinsEarned = Math.floor(compressed.totalCoinsEarned);
    }
    
    // Remove empty objects and arrays
    Object.keys(compressed).forEach(key => {
      if (compressed[key] === null || compressed[key] === undefined) {
        delete compressed[key];
      } else if (Array.isArray(compressed[key]) && compressed[key].length === 0) {
        delete compressed[key];
      } else if (typeof compressed[key] === 'object' && Object.keys(compressed[key]).length === 0) {
        delete compressed[key];
      }
    });
    
    return compressed;
  }

  /**
   * Update user statistics based on game data
   */
  async updateUserStatistics(userId, gameData) {
    const user = await User.findByPk(userId);
    if (!user) return;

    // Update user stats from game data
    user.total_coins_earned = Math.max(user.total_coins_earned, gameData.totalCoinsEarned || 0);
    user.total_flips = Math.max(user.total_flips, gameData.totalFlips || 0);
    user.max_streak = Math.max(user.max_streak, gameData.maxStreak || 0);
    user.prestige_level = Math.max(user.prestige_level, gameData.prestigeLevel || 0);
    
    // Count achievements
    const achievementsUnlocked = Object.values(gameData.achievements || {})
      .filter(achievement => achievement.unlocked).length;
    user.achievements_unlocked = Math.max(user.achievements_unlocked, achievementsUnlocked);
    
    await user.save();
  }

  /**
   * Handle reconnection sync after extended offline period
   */
  async handleReconnectionSync(userId, gameData, offlineTime) {
    try {
      // Special handling for extended offline periods
      if (offlineTime > 30 * 60 * 1000) { // 30+ minutes offline
        const gameSave = await GameSave.findByUser(userId);
        if (!gameSave) {
          throw new Error('Game save not found');
        }

        // Perform full validation for reconnection
        const validationResult = await this.antiCheatValidator.validateReconnectionData(
          gameData, 
          gameSave, 
          offlineTime
        );

        if (!validationResult.isValid && !gameSave.isObsessivePlayerProtected()) {
          // Flag for manual review but don't block obsessive players
          return {
            success: false,
            error: 'Reconnection validation failed',
            requiresManualReview: true,
            backupCreated: true
          };
        }

        // Create backup of local state before sync
        await this.createConflictBackup(userId, gameData, 'reconnection_conflict');
      }

      // Process normal batch sync
      return await this.processBatchSync(userId, gameData, {}, 'reconnection_sync');

    } catch (error) {
      console.error('Reconnection sync error:', error);
      return {
        success: false,
        error: error.message,
        requiresManualReview: true
      };
    }
  }

  /**
   * Create backup for conflict resolution
   */
  async createConflictBackup(userId, localGameData, conflictType) {
    // Store local state backup for manual review
    const backup = {
      userId,
      conflictType,
      localGameData,
      timestamp: new Date(),
      resolved: false
    };
    
    // In a real implementation, you'd store this in a ConflictBackup table
    console.log('Conflict backup created:', backup);
  }

  /**
   * Get sync status for a user
   */
  async getSyncStatus(userId) {
    try {
      const gameSave = await GameSave.findByUser(userId);
      if (!gameSave) {
        return {
          syncEnabled: false,
          message: 'No game save found'
        };
      }

      const now = Date.now();
      const timeSinceLastSync = now - gameSave.last_sync_time;
      const nextSyncIn = Math.max(0, gameSave.sync_interval - timeSinceLastSync);

      return {
        syncEnabled: true,
        lastSyncTime: gameSave.last_sync_time,
        nextSyncIn,
        queuedActions: gameSave.offline_actions_queue?.length || 0,
        batchSyncEnabled: gameSave.batch_sync_enabled,
        obsessivePlayerProtected: gameSave.isObsessivePlayerProtected(),
        learningPhase: gameSave.personal_baselines?.learningPhase || false,
        criticalEventsCount: gameSave.critical_events_count
      };
    } catch (error) {
      console.error('Get sync status error:', error);
      return {
        syncEnabled: false,
        error: error.message
      };
    }
  }
}

module.exports = SyncManager;