const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const SyncManager = require('../utils/SyncManager');
const GameSave = require('../models/GameSave');
const User = require('../models/User');

const syncManager = new SyncManager();

// Batch sync game progress with 30-minute intervals
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameData, sessionData = {}, eventType, forceSync = false } = req.body;
    
    // Validate required fields
    if (!gameData || typeof gameData.coins !== 'number') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid game data - missing required fields' 
      });
    }

    // Add platform info from headers
    sessionData.platform = req.headers['x-platform'] || 'unknown';
    sessionData.userAgent = req.headers['user-agent'];

    // Process batch sync through SyncManager
    const syncResult = await syncManager.processBatchSync(
      userId, 
      gameData, 
      sessionData, 
      eventType
    );

    res.json(syncResult);

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to sync game data',
      requiresManualReview: error.message.includes('suspicious')
    });
  }
});

// Legacy save endpoint (redirects to sync)
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const gameData = req.body;
    
    // Process as force sync
    const syncResult = await syncManager.processBatchSync(
      userId, 
      gameData, 
      { platform: req.headers['x-platform'] || 'unknown' }, 
      'manual_save'
    );

    res.json(syncResult);

  } catch (error) {
    console.error('Legacy save error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save game data'
    });
  }
});

// Load game progress
router.get('/load', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find or create game save
    let gameSave = await GameSave.findByUser(userId);
    
    if (!gameSave) {
      // Create new game save with default data
      const defaultGameData = {
        coins: 0,
        coinsPerTap: 1,
        coinsPerSecond: 0,
        totalCoinsEarned: 0,
        upgrades: {
          tapMultiplier: 0,
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
        achievements: {},
        prestigeLevel: 0,
        prestigePoints: 0,
        prestigeUpgrades: {
          coinMultiplier: 0,
          generatorBoost: 0,
          streakPower: 0,
          betReturns: 0,
        },
        totalTaps: 0,
        totalFlips: 0,
        totalHeads: 0,
        maxStreak: 0,
        headsStreak: 0,
        lastSaveTime: Date.now(),
      };
      
      const platform = req.headers['x-platform'] || 'unknown';
      gameSave = await GameSave.createForUser(userId, defaultGameData, platform);
    }
    
    // Get sync status
    const syncStatus = await syncManager.getSyncStatus(userId);
    
    res.json({ 
      success: true, 
      data: gameSave.game_data,
      syncStatus,
      lastSyncTime: gameSave.last_sync_time,
      saveVersion: gameSave.save_version
    });
    
  } catch (error) {
    console.error('Error loading game:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load game' 
    });
  }
});

// Reconnection sync after extended offline period
router.post('/reconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameData, offlineTime } = req.body;
    
    if (!gameData || typeof offlineTime !== 'number') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid reconnection data' 
      });
    }

    const syncResult = await syncManager.handleReconnectionSync(
      userId, 
      gameData, 
      offlineTime
    );

    res.json(syncResult);

  } catch (error) {
    console.error('Reconnection sync error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process reconnection sync',
      requiresManualReview: true
    });
  }
});

// Get sync status
router.get('/sync-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const syncStatus = await syncManager.getSyncStatus(userId);
    
    res.json({
      success: true,
      ...syncStatus
    });

  } catch (error) {
    console.error('Sync status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get sync status' 
    });
  }
});

// Validate game data (anti-cheat endpoint)
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameData, sessionData = {} } = req.body;
    
    if (!gameData) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing game data' 
      });
    }

    const gameSave = await GameSave.findByUser(userId);
    if (!gameSave) {
      return res.status(404).json({ 
        success: false,
        error: 'Game save not found' 
      });
    }

    const antiCheatValidator = syncManager.antiCheatValidator;
    const validationResult = await antiCheatValidator.validateGameData(
      gameData, 
      gameSave, 
      sessionData
    );

    res.json({
      success: true,
      ...validationResult
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to validate game data' 
    });
  }
});

// Add offline action to queue
router.post('/queue-action', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { action } = req.body;
    
    if (!action || !action.type) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid action data' 
      });
    }

    const gameSave = await GameSave.findByUser(userId);
    if (!gameSave) {
      return res.status(404).json({ 
        success: false,
        error: 'Game save not found' 
      });
    }

    gameSave.addOfflineAction(action);
    await gameSave.save();

    res.json({
      success: true,
      message: 'Action queued successfully',
      queueSize: gameSave.offline_actions_queue.length
    });

  } catch (error) {
    console.error('Queue action error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to queue action' 
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    // Get top players by total coins earned
    const users = await User.findAll({
      attributes: ['username', 'display_name', 'total_coins_earned', 'prestige_level', 'max_streak'],
      where: { is_active: true },
      order: [['total_coins_earned', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const leaderboard = users.map((user, index) => ({
      rank: parseInt(offset) + index + 1,
      username: user.username,
      displayName: user.display_name,
      totalCoinsEarned: user.total_coins_earned,
      prestigeLevel: user.prestige_level,
      maxStreak: user.max_streak
    }));
    
    res.json({ 
      success: true, 
      data: leaderboard,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch leaderboard' 
    });
  }
});

module.exports = router;