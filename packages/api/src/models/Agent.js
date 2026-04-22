const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agent = sequelize.define('Agent', {
  id_agente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rut: DataTypes.STRING,
  mail: DataTypes.STRING,
  fono: DataTypes.STRING,
  comision_default: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'agentes',
  timestamps: false
});

module.exports = Agent;
