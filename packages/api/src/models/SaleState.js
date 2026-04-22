const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SaleState = sequelize.define('estados_venta', {
  id_estado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'estados_venta',
  timestamps: false
});

module.exports = SaleState;
