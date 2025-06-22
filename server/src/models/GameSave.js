const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GameSave = sequelize.define('GameSave', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  
  // Game state data
  game_data: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidGameData(value) {
        if (typeof value !== 'object' || value === null) {
          throw new Error('Game data must be a valid object');
        }
        
        // Validate required fields
        const requiredFields = ['coins', 'totalCoinsEarned', 'totalFlips'];
        for (const field of requiredFields) {
          if (!(field in value)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
        // Validate data types and ranges
        if (typeof value.coins !== 'number' || value.coins < 0) {
          throw new Error('Coins must be a non-negative number');
        }
        
        if (typeof value.totalCoinsEarned !== 'number' || value.totalCoinsEarned < 0) {
          throw new Error('Total coins earned must be a non-negative number');
        }
        
        if (typeof value.totalFlips !== 'number' || value.totalFlips < 0) {
          throw new Error('Total flips must be a non-negative number');
        }
        
        // Check for suspicious values (anti-cheat)
        const maxReasonableCoins = value.totalFlips * 1000; // Max 1000 coins per flip
        if (value.totalCoinsEarned > maxReasonableCoins) {
          throw new Error('Suspicious coin values detected');
        }
      }
    },
  },
  
  // Metadata
  save_version: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0.0',
  },
  
  platform: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      isIn: [['ios', 'android', 'web', 'unknown']],
    },
  },
  
  // Anti-cheat data
  checksum: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  
  save_frequency: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },
  
  // Sync Strategy Fields
  last_sync_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  
  sync_interval: {
    type: DataTypes.INTEGER,
    defaultValue: 1800000, // 30 minutes in ms
    validate: {
      min: 60000, // Minimum 1 minute
      max: 86400000, // Maximum 24 hours
    },
  },
  
  offline_actions_queue: {
    type: DataTypes.JSONB,
    defaultValue: [],
    validate: {
      isValidQueue(value) {
        if (!Array.isArray(value)) {
          throw new Error('Actions queue must be an array');
        }
        if (value.length > 1000) {
          throw new Error('Actions queue too large (max 1000 items)');
        }
      }
    },
  },

  // Anti-Cheat Personal Baselines
  personal_baselines: {
    type: DataTypes.JSONB,
    defaultValue: {
      learningPhase: true,
      learningStarted: new Date(),
      maxEfficiency: 0,
      playPatterns: {},
      skillCeiling: 0,
      averageSessionLength: 0,
      peakHours: [],
      consecutiveDays: 0,
    },
  },
  
  // Performance tracking
  compressed_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  
  load_time_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 30000, // 30 seconds max
    },
  },

  // Sync optimization metrics
  batch_sync_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  critical_events_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
}, {
  tableName: 'game_saves',
  indexes: [
    {
      unique: true,
      fields: ['user_id'],
    },
    {
      fields: ['updated_at'],
    },
    {
      fields: ['save_version'],
    },
  ],
});

// Instance methods
GameSave.prototype.calculateChecksum = function() {
  const crypto = require('crypto');
  const dataString = JSON.stringify(this.game_data);
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

GameSave.prototype.validateChecksum = function() {
  if (!this.checksum) return true; // No checksum to validate
  return this.checksum === this.calculateChecksum();
};

GameSave.prototype.updateMetadata = function(platform) {
  const dataSize = JSON.stringify(this.game_data).length;
  
  this.compressed_size = dataSize;
  this.platform = platform || 'unknown';
  this.checksum = this.calculateChecksum();
  this.save_frequency += 1;
};

GameSave.prototype.getGameStats = function() {
  const data = this.game_data;
  
  return {
    coins: data.coins || 0,
    totalCoinsEarned: data.totalCoinsEarned || 0,
    totalFlips: data.totalFlips || 0,
    maxStreak: data.maxStreak || 0,
    prestigeLevel: data.prestigeLevel || 0,
    totalPrestiges: data.totalPrestiges || 0,
    achievementsUnlocked: Object.values(data.achievements || {}).filter(a => a.unlocked).length,
    lastSaveTime: this.updated_at,
    saveVersion: this.save_version,
  };
};

// Class methods
GameSave.createForUser = async function(userId, gameData, platform = 'unknown') {
  const save = await this.create({
    user_id: userId,
    game_data: gameData,
    platform: platform,
  });
  
  save.updateMetadata(platform);
  await save.save();
  
  return save;
};

GameSave.findByUser = async function(userId) {
  return this.findOne({
    where: { user_id: userId }
  });
};

// Sync Strategy Methods
GameSave.prototype.shouldSync = function() {
  const now = new Date();
  const timeSinceLastSync = now - this.last_sync_time;
  return timeSinceLastSync >= this.sync_interval;
};

GameSave.prototype.addOfflineAction = function(action) {
  if (!this.offline_actions_queue) {
    this.offline_actions_queue = [];
  }
  
  this.offline_actions_queue.push({
    ...action,
    timestamp: new Date(),
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });
  
  // Trim queue if too large
  if (this.offline_actions_queue.length > 1000) {
    this.offline_actions_queue = this.offline_actions_queue.slice(-1000);
  }
};

GameSave.prototype.clearOfflineQueue = function() {
  this.offline_actions_queue = [];
};

GameSave.prototype.updatePersonalBaseline = function(sessionData) {
  if (!this.personal_baselines) {
    this.personal_baselines = {
      learningPhase: true,
      learningStarted: new Date(),
      maxEfficiency: 0,
      playPatterns: {},
      skillCeiling: 0,
      averageSessionLength: 0,
      peakHours: [],
      consecutiveDays: 0,
    };
  }
  
  const baselines = this.personal_baselines;
  const now = new Date();
  
  // Check if still in 30-day learning phase
  const daysSinceLearning = (now - new Date(baselines.learningStarted)) / (1000 * 60 * 60 * 24);
  baselines.learningPhase = daysSinceLearning < 30;
  
  // Update efficiency metrics
  if (sessionData.efficiency > baselines.maxEfficiency) {
    baselines.maxEfficiency = sessionData.efficiency;
  }
  
  if (sessionData.coinsPerMinute > baselines.skillCeiling) {
    baselines.skillCeiling = sessionData.coinsPerMinute;
  }
  
  // Update session length average
  const currentAvg = baselines.averageSessionLength || 0;
  baselines.averageSessionLength = (currentAvg * 0.9) + (sessionData.sessionLength * 0.1);
  
  // Track peak hours
  const hour = now.getHours();
  if (!baselines.peakHours.includes(hour) && sessionData.efficiency > baselines.maxEfficiency * 0.8) {
    baselines.peakHours.push(hour);
    // Keep only top 8 peak hours
    if (baselines.peakHours.length > 8) {
      baselines.peakHours = baselines.peakHours.slice(-8);
    }
  }
  
  this.personal_baselines = baselines;
};

GameSave.prototype.isObsessivePlayerProtected = function() {
  // Check if player has earned obsessive player protection
  const baselines = this.personal_baselines;
  if (!baselines) return false;
  
  // Must be out of learning phase
  if (baselines.learningPhase) return false;
  
  // Must have high dedication metrics
  const highDedication = (
    (baselines.averageSessionLength > 7200000) || // 2+ hour sessions
    (baselines.consecutiveDays > 7) || // 7+ consecutive days
    (baselines.peakHours.length >= 6) // 6+ peak hours
  );
  
  return highDedication;
};

GameSave.prototype.getAntiCheatThreshold = function(metric) {
  const baselines = this.personal_baselines;
  if (!baselines || baselines.learningPhase) {
    // During learning phase, use global thresholds
    return this.getGlobalThreshold(metric);
  }
  
  const isObsessive = this.isObsessivePlayerProtected();
  const multiplier = isObsessive ? 5.0 : 2.5; // Higher thresholds for obsessive players
  
  switch (metric) {
    case 'efficiency':
      return baselines.maxEfficiency * multiplier;
    case 'coinsPerMinute':
      return baselines.skillCeiling * multiplier;
    case 'sessionLength':
      return baselines.averageSessionLength * multiplier;
    default:
      return this.getGlobalThreshold(metric);
  }
};

GameSave.prototype.getGlobalThreshold = function(metric) {
  // Fallback global thresholds
  const thresholds = {
    efficiency: 0.95,
    coinsPerMinute: 1000,
    sessionLength: 8 * 60 * 60 * 1000, // 8 hours
    flipsPerMinute: 3,
    maxCoinsPerFlip: 500,
  };
  
  return thresholds[metric] || 100;
};

GameSave.prototype.updateSyncMetrics = function() {
  this.last_sync_time = new Date();
  this.critical_events_count = 0;
};

// Hooks
GameSave.beforeSave(async (save) => {
  // Validate game data integrity
  if (!save.validateChecksum()) {
    throw new Error('Game data checksum validation failed');
  }
  
  // Check save size limits
  const maxSize = parseInt(process.env.MAX_SAVE_SIZE_BYTES) || 10240; // 10KB default
  const saveSize = JSON.stringify(save.game_data).length;
  
  if (saveSize > maxSize) {
    throw new Error(`Save data too large: ${saveSize} bytes (max: ${maxSize})`);
  }
});

module.exports = GameSave;