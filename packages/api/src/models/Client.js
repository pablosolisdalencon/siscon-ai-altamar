const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('clientes', {
  id_cliente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rut: {
    type: DataTypes.STRING,
    allowNull: false
  },
  razon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  giro: {
    type: DataTypes.STRING
  },
  direccion: {
    type: DataTypes.STRING
  },
  fono: {
    type: DataTypes.STRING
  },
  mail: {
    type: DataTypes.STRING
  },
  comercial_nombre: {
    type: DataTypes.STRING
  },
  comercial_mail: {
    type: DataTypes.STRING
  },
  comercial_fono: {
    type: DataTypes.STRING
  },
  pago_nombre: {
    type: DataTypes.STRING
  },
  pago_mail: {
    type: DataTypes.STRING
  },
  pago_fono: {
    type: DataTypes.STRING
  },
  mensaje_cobro: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'clientes',
  timestamps: false
});

module.exports = Client;
