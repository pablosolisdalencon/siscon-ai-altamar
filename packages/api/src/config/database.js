const { Sequelize } = require('sequelize');
const path = require('path');
const envMap = {
  'production': '.env.production',
  'preprod': '.env.preprod',
  'development': '.env.development'
};
const envFile = envMap[process.env.NODE_ENV] || '.env.development';
require('dotenv').config({ path: path.resolve(__dirname, `../../${envFile}`) });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        rejectUnauthorized: false
      }
    } : {},
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false, // Legacy DB doesn't have createdAt/updatedAt
      freezeTableName: true
    }
  }
);

console.log(`📡 Attempting to connect to ${process.env.NODE_ENV} database...`);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to legacy database has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
