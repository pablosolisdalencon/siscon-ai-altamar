const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('usuarios', {
  user: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  pass: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mail: {
    type: DataTypes.STRING
  },
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
