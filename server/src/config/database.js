const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Dynamic database configuration based on environment
const databaseConfig = process.env.DB_DIALECT === 'sqlite' ? {
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || './volado_game.db',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
} : {
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'volado_game',
  username: process.env.DB_USER || 'volado_user',
  password: process.env.DB_PASSWORD,
  
  // Connection pool settings
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  
  // Logging
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Timezone
  timezone: '+00:00',
  
  // Security settings
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
  },
  
  // Query options
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
};

const sequelize = new Sequelize(databaseConfig);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    
    // Sync models (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('📋 Database tables synchronized.');
    }
    
    return sequelize;
  } catch (error) {
    console.error('💥 Database initialization failed:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase,
};