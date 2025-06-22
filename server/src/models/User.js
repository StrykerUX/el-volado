const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true,
    },
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  
  display_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [1, 100],
    },
  },
  
  // Profile information
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  
  country: {
    type: DataTypes.STRING(2),
    allowNull: true,
    validate: {
      len: [2, 2],
      isAlpha: true,
    },
  },
  
  // Game statistics
  total_coins_earned: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  
  total_flips: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  
  max_streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  
  prestige_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  
  achievements_unlocked: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  
  // Account status
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Anti-cheat flags
  suspicious_activity: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  cheat_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
    {
      unique: true,
      fields: ['username'],
    },
    {
      fields: ['total_coins_earned'],
    },
    {
      fields: ['prestige_level'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Remove sensitive information
  delete values.password_hash;
  delete values.suspicious_activity;
  delete values.cheat_score;
  
  return values;
};

User.prototype.getPublicProfile = function() {
  return {
    id: this.id,
    username: this.username,
    display_name: this.display_name,
    avatar_url: this.avatar_url,
    country: this.country,
    total_coins_earned: this.total_coins_earned,
    total_flips: this.total_flips,
    max_streak: this.max_streak,
    prestige_level: this.prestige_level,
    achievements_unlocked: this.achievements_unlocked,
    created_at: this.created_at,
  };
};

// Class methods
User.hashPassword = async function(password) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return bcrypt.hash(password, saltRounds);
};

User.findByEmailOrUsername = async function(emailOrUsername) {
  return this.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    }
  });
};

// Hooks
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    user.password_hash = await User.hashPassword(user.password_hash);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password_hash')) {
    user.password_hash = await User.hashPassword(user.password_hash);
  }
});

module.exports = User;