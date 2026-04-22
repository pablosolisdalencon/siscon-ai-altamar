const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('usuarios', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  pass: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

module.exports = User;
