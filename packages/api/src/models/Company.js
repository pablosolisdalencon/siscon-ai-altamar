const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('empresa', {
  id_empresa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rut: {
    type: DataTypes.STRING
  },
  razon: {
    type: DataTypes.STRING
  },
  direccion: {
    type: DataTypes.STRING
  },
  giro: {
    type: DataTypes.STRING
  },
  CF: {
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
  pago_firma: {
    type: DataTypes.STRING
  },
  fono: {
    type: DataTypes.STRING
  },
  mail: {
    type: DataTypes.STRING
  },
  contacto_c: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'empresa',
  timestamps: false
});

module.exports = Company;
