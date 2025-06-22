import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxQueueSize = 1000;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    
    this.init();
  }

  async init() {
    // Load persisted queue from storage
    try {
      const storedQueue = await AsyncStorage.getItem('offlineQueue');
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue);
        console.log(`Loaded ${this.queue.length} offline actions from storage`);
      }
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Add action to offline queue
   */
  async addAction(actionType, actionData, priority = 'normal') {
    const action = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: actionType,
      data: actionData,
      priority,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    };

    // Handle priority insertion
    if (priority === 'critical') {
      this.queue.unshift(action);
    } else {
      this.queue.push(action);
    }

    // Trim queue if too large
    if (this.queue.length > this.maxQueueSize) {
      const removedActions = this.queue.splice(this.maxQueueSize);
      console.warn(`Queue exceeded max size, removed ${removedActions.length} oldest actions`);
    }

    // Persist to storage
    await this.persistQueue();

    console.log(`Added ${actionType} action to offline queue (${this.queue.length} total)`);
    
    return action.id;
  }

  /**
   * Remove action from queue
   */
  async removeAction(actionId) {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(action => action.id !== actionId);
    
    if (this.queue.length < initialLength) {
      await this.persistQueue();
      return true;
    }
    
    return false;
  }

  /**
   * Get all actions of a specific type
   */
  getActionsByType(actionType) {
    return this.queue.filter(action => action.type === actionType);
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    const stats = {
      total: this.queue.length,
      pending: 0,
      processing: 0,
      failed: 0,
      byType: {}
    };

    this.queue.forEach(action => {
      stats[action.status]++;
      stats.byType[action.type] = (stats.byType[action.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear all actions from queue
   */
  async clearQueue() {
    this.queue = [];
    await this.persistQueue();
    console.log('Offline queue cleared');
  }

  /**
   * Clear completed actions from queue
   */
  async clearCompletedActions() {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(action => action.status !== 'completed');
    
    if (this.queue.length < initialLength) {
      await this.persistQueue();
      console.log(`Cleared ${initialLength - this.queue.length} completed actions`);
    }
  }

  /**
   * Process queue with provided processor function
   */
  async processQueue(processor) {
    if (this.isProcessing) {
      console.log('Queue processing already in progress');
      return { processed: 0, failed: 0, remaining: this.queue.length };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;

    console.log(`Processing ${this.queue.length} queued actions...`);

    // Process critical actions first
    const criticalActions = this.queue.filter(action => 
      action.priority === 'critical' && action.status === 'pending'
    );
    
    const normalActions = this.queue.filter(action => 
      action.priority !== 'critical' && action.status === 'pending'
    );

    const actionsToProcess = [...criticalActions, ...normalActions];

    for (const action of actionsToProcess) {
      if (action.retries >= this.maxRetries) {
        action.status = 'failed';
        failed++;
        continue;
      }

      try {
        action.status = 'processing';
        
        // Call the processor function
        const result = await processor(action);
        
        if (result.success) {
          action.status = 'completed';
          processed++;
          console.log(`✅ Processed ${action.type} action (${action.id})`);
        } else {
          throw new Error(result.error || 'Processing failed');
        }

      } catch (error) {
        action.retries++;
        action.status = 'pending';
        action.lastError = error.message;
        action.lastAttempt = Date.now();
        
        console.warn(`❌ Failed to process ${action.type} action (attempt ${action.retries}/${this.maxRetries}):`, error.message);
        
        if (action.retries >= this.maxRetries) {
          action.status = 'failed';
          failed++;
        }

        // Add delay before next retry
        if (action.retries < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    // Persist updated queue
    await this.persistQueue();

    this.isProcessing = false;

    const result = {
      processed,
      failed,
      remaining: this.queue.filter(action => action.status === 'pending').length
    };

    console.log(`Queue processing complete: ${JSON.stringify(result)}`);
    
    return result;
  }

  /**
   * Specific methods for game actions
   */

  // Coin flip action
  async addCoinFlipAction(result, coinsEarned, streak = 0) {
    return await this.addAction('coin_flip', {
      result,
      coinsEarned,
      streak,
      timestamp: Date.now()
    });
  }

  // Upgrade purchase action
  async addUpgradePurchaseAction(upgradeType, cost, level) {
    return await this.addAction('upgrade_purchase', {
      upgradeType,
      cost,
      level,
      timestamp: Date.now()
    });
  }

  // Generator purchase action
  async addGeneratorPurchaseAction(generatorType, cost, level) {
    return await this.addAction('generator_purchase', {
      generatorType,
      cost,
      level,
      timestamp: Date.now()
    });
  }

  // Achievement unlock action
  async addAchievementUnlockAction(achievementId, reward) {
    return await this.addAction('achievement_unlock', {
      achievementId,
      reward,
      timestamp: Date.now()
    }, 'critical'); // Achievements are critical events
  }

  // Prestige action
  async addPrestigeAction(pointsGained, previousLevel) {
    return await this.addAction('prestige_activation', {
      pointsGained,
      previousLevel,
      timestamp: Date.now()
    }, 'critical'); // Prestige is a critical event
  }

  // Game save action
  async addGameSaveAction(gameData, eventType = 'manual_save') {
    const priority = ['prestige_activation', 'real_money_purchase'].includes(eventType) 
      ? 'critical' 
      : 'normal';
    
    return await this.addAction('game_save', {
      gameData,
      eventType,
      timestamp: Date.now()
    }, priority);
  }

  /**
   * Persist queue to AsyncStorage
   */
  async persistQueue() {
    try {
      await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to persist offline queue:', error);
    }
  }

  /**
   * Get actions that need immediate sync
   */
  getCriticalActions() {
    return this.queue.filter(action => 
      action.priority === 'critical' && action.status === 'pending'
    );
  }

  /**
   * Check if queue has actions older than specified time
   */
  hasStaleActions(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const now = Date.now();
    return this.queue.some(action => 
      action.status === 'pending' && (now - action.timestamp) > maxAge
    );
  }

  /**
   * Remove stale actions from queue
   */
  async removeStaleActions(maxAge = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    const initialLength = this.queue.length;
    
    this.queue = this.queue.filter(action => 
      action.status !== 'pending' || (now - action.timestamp) <= maxAge
    );
    
    if (this.queue.length < initialLength) {
      await this.persistQueue();
      console.log(`Removed ${initialLength - this.queue.length} stale actions`);
    }
  }

  /**
   * Get queue summary for debugging
   */
  getQueueSummary() {
    const stats = this.getQueueStats();
    const oldestAction = this.queue.length > 0 
      ? Math.min(...this.queue.map(a => a.timestamp))
      : null;
    
    return {
      ...stats,
      oldestActionAge: oldestAction ? Date.now() - oldestAction : 0,
      isProcessing: this.isProcessing,
      hasCriticalActions: this.getCriticalActions().length > 0,
      hasStaleActions: this.hasStaleActions()
    };
  }
}

// Create singleton instance
const offlineQueue = new OfflineQueue();

export default offlineQueue;