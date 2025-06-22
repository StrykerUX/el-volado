const { sequelize } = require('../config/database');
const User = require('./User');
const GameSave = require('./GameSave');

// Define associations
User.hasOne(GameSave, {
  foreignKey: 'user_id',
  as: 'gameSave',
  onDelete: 'CASCADE',
});

GameSave.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  GameSave,
};