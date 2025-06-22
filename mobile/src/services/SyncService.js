import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class SyncService {
  constructor() {
    this.baseURL = __DEV__ ? 'http://localhost:3010/api' : 'https://your-production-api.com/api';
    this.syncInterval = 30 * 60 * 1000; // 30 minutes
    this.isOnline = true;
    this.accessToken = null;
    this.syncInProgress = false;
    this.offlineQueue = [];
    
    // Sync strategy configuration
    this.criticalEvents = [
      'prestige_activation',
      'real_money_purchase',
      'major_achievement_unlock',
      'user_logout'
    ];
    
    this.init();
  }

  async init() {
    // Load stored access token
    this.accessToken = await AsyncStorage.getItem('accessToken');
    
    // Setup sync interval
    this.setupSyncInterval();
    
    // Listen for app state changes
    if (Platform.OS !== 'web') {
      // React Native specific - would need AppState import
      // AppState.addEventListener('change', this.handleAppStateChange);
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.accessToken = token;
    AsyncStorage.setItem('accessToken', token);
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    this.accessToken = null;
    AsyncStorage.removeItem('accessToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.accessToken;
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint, options = {}) {
    if (!this.accessToken && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
      throw new Error('Not authenticated');
    }

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': Platform.OS,
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
      },
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API request failed:', error);
      
      // Handle offline scenarios
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        this.isOnline = false;
        
        // Queue action for later sync if it's a POST request
        if (config.method === 'POST') {
          this.queueOfflineAction(endpoint, config);
        }
        
        throw new Error('OFFLINE');
      }
      
      throw error;
    }
  }

  /**
   * Sync game data with server
   */
  async syncGameData(gameData, sessionData = {}, eventType = null, forceSync = false) {
    if (this.syncInProgress && !forceSync) {
      console.log('Sync already in progress, skipping...');
      return { synced: false, reason: 'sync_in_progress' };
    }

    if (!this.isAuthenticated()) {
      console.log('Not authenticated, skipping sync');
      return { synced: false, reason: 'not_authenticated' };
    }

    this.syncInProgress = true;

    try {
      // Add session metadata
      const sessionMetadata = {
        ...sessionData,
        platform: Platform.OS,
        timestamp: Date.now(),
        appVersion: '1.0.0', // Should come from app config
      };

      // Check if this is a critical event that requires immediate sync
      const isCritical = eventType && this.criticalEvents.includes(eventType);

      const response = await this.apiRequest('/game/sync', {
        method: 'POST',
        body: {
          gameData,
          sessionData: sessionMetadata,
          eventType,
          forceSync: forceSync || isCritical
        }
      });

      this.isOnline = true;

      // Process offline queue if sync was successful
      if (response.synced && this.offlineQueue.length > 0) {
        await this.processOfflineQueue();
      }

      return {
        synced: response.synced,
        syncedAt: response.syncedAt,
        nextSyncIn: response.nextSyncIn,
        validationScore: response.validationScore,
        obsessivePlayerProtected: response.obsessivePlayerProtected,
        requiresManualReview: response.requiresManualReview
      };

    } catch (error) {
      if (error.message === 'OFFLINE') {
        // Queue the sync for later
        this.queueGameDataSync(gameData, sessionMetadata, eventType);
        return { synced: false, reason: 'offline', queued: true };
      }
      
      console.error('Sync failed:', error);
      return { 
        synced: false, 
        error: error.message,
        requiresManualReview: error.message.includes('cheat') || error.message.includes('suspicious')
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Handle reconnection sync after being offline
   */
  async handleReconnectionSync(gameData, offlineTime) {
    if (!this.isAuthenticated()) {
      return { synced: false, reason: 'not_authenticated' };
    }

    try {
      const response = await this.apiRequest('/game/reconnect', {
        method: 'POST',
        body: {
          gameData,
          offlineTime
        }
      });

      this.isOnline = true;

      return {
        synced: response.success,
        conflictDetected: response.conflictDetected,
        backupCreated: response.backupCreated,
        requiresManualReview: response.requiresManualReview
      };

    } catch (error) {
      console.error('Reconnection sync failed:', error);
      return { 
        synced: false, 
        error: error.message 
      };
    }
  }

  /**
   * Load game data from server
   */
  async loadGameData() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await this.apiRequest('/game/load');
      this.isOnline = true;
      
      return {
        gameData: response.data,
        syncStatus: response.syncStatus,
        lastSyncTime: response.lastSyncTime,
        saveVersion: response.saveVersion
      };
    } catch (error) {
      if (error.message === 'OFFLINE') {
        throw new Error('Cannot load game data while offline');
      }
      throw error;
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus() {
    if (!this.isAuthenticated()) {
      return { syncEnabled: false, reason: 'not_authenticated' };
    }

    try {
      const response = await this.apiRequest('/game/sync-status');
      this.isOnline = true;
      return response;
    } catch (error) {
      if (error.message === 'OFFLINE') {
        return { syncEnabled: false, reason: 'offline' };
      }
      throw error;
    }
  }

  /**
   * Validate game data with anti-cheat
   */
  async validateGameData(gameData, sessionData = {}) {
    if (!this.isAuthenticated()) {
      return { isValid: true, reason: 'not_authenticated' };
    }

    try {
      const response = await this.apiRequest('/game/validate', {
        method: 'POST',
        body: {
          gameData,
          sessionData
        }
      });

      return {
        isValid: response.isValid,
        score: response.score,
        violations: response.violations,
        obsessivePlayerProtected: response.obsessivePlayerProtected,
        learningPhase: response.learningPhase
      };
    } catch (error) {
      console.warn('Validation failed:', error);
      return { isValid: true, error: error.message };
    }
  }

  /**
   * Queue offline action
   */
  queueOfflineAction(endpoint, config) {
    const action = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      config,
      timestamp: Date.now(),
      retries: 0
    };

    this.offlineQueue.push(action);
    
    // Persist queue to storage
    AsyncStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
    
    console.log(`Queued offline action: ${endpoint}`);
  }

  /**
   * Queue game data sync for offline processing
   */
  queueGameDataSync(gameData, sessionData, eventType) {
    this.queueOfflineAction('/game/sync', {
      method: 'POST',
      body: {
        gameData,
        sessionData,
        eventType
      }
    });
  }

  /**
   * Process queued offline actions
   */
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    console.log(`Processing ${this.offlineQueue.length} queued actions...`);

    const processedActions = [];
    const failedActions = [];

    for (const action of this.offlineQueue) {
      try {
        const response = await fetch(`${this.baseURL}${action.endpoint}`, action.config);
        
        if (response.ok) {
          processedActions.push(action.id);
          console.log(`Processed queued action: ${action.endpoint}`);
        } else {
          action.retries = (action.retries || 0) + 1;
          if (action.retries >= 3) {
            failedActions.push(action.id);
            console.warn(`Failed to process action after 3 retries: ${action.endpoint}`);
          }
        }
      } catch (error) {
        action.retries = (action.retries || 0) + 1;
        if (action.retries >= 3) {
          failedActions.push(action.id);
          console.warn(`Failed to process action: ${action.endpoint}`, error);
        }
      }
    }

    // Remove processed and failed actions from queue
    this.offlineQueue = this.offlineQueue.filter(
      action => !processedActions.includes(action.id) && !failedActions.includes(action.id)
    );

    // Persist updated queue
    await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));

    console.log(`Processed: ${processedActions.length}, Failed: ${failedActions.length}, Remaining: ${this.offlineQueue.length}`);
  }

  /**
   * Setup automatic sync interval
   */
  setupSyncInterval() {
    // Clear existing interval
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    // Setup new interval
    this.syncIntervalId = setInterval(async () => {
      // Only auto-sync if we have pending changes
      const hasPendingChanges = this.offlineQueue.length > 0;
      
      if (hasPendingChanges && this.isAuthenticated() && this.isOnline) {
        try {
          await this.processOfflineQueue();
        } catch (error) {
          console.warn('Auto-sync failed:', error);
        }
      }
    }, this.syncInterval);
  }

  /**
   * Handle app state changes
   */
  handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App going to background - trigger sync if needed
      if (this.offlineQueue.length > 0) {
        this.processOfflineQueue().catch(console.warn);
      }
    } else if (nextAppState === 'active') {
      // App coming to foreground - check sync status
      this.getSyncStatus().catch(console.warn);
    }
  };

  /**
   * Authentication methods
   */
  async login(emailOrUsername, password) {
    try {
      const response = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: {
          emailOrUsername,
          password
        }
      });

      this.setAuthToken(response.accessToken);
      
      return {
        success: true,
        user: response.user,
        accessToken: response.accessToken
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async register(username, email, password) {
    try {
      const response = await this.apiRequest('/auth/register', {
        method: 'POST',
        body: {
          username,
          email,
          password
        }
      });

      this.setAuthToken(response.accessToken);
      
      return {
        success: true,
        user: response.user,
        accessToken: response.accessToken
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async logout() {
    try {
      await this.apiRequest('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 100, offset = 0) {
    try {
      const response = await this.apiRequest(`/game/leaderboard?limit=${limit}&offset=${offset}`);
      return {
        success: true,
        leaderboard: response.data,
        total: response.total
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
    
    // Remove app state listener if using React Native
    // AppState.removeEventListener('change', this.handleAppStateChange);
  }
}

// Create singleton instance
const syncService = new SyncService();

export default syncService;