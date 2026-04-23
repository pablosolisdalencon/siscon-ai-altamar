const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('ventas', {
  id_venta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  n_factura: {
    type: DataTypes.INTEGER
  },
  n_cot: {
    type: DataTypes.INTEGER
  },
  n_oc: {
    type: DataTypes.INTEGER
  },
  f_factura: {
    type: DataTypes.STRING
  },
  f_cot: {
    type: DataTypes.STRING
  },
  f_oc: {
    type: DataTypes.STRING
  },
  fecha: {
    type: DataTypes.DATEONLY
  },
  fecha_entrega: {
    type: DataTypes.DATEONLY
  },
  fecha_pago: {
    type: DataTypes.DATEONLY
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pagado: {
    type: DataTypes.STRING,
    defaultValue: 'NO'
  },
  entregado: {
    type: DataTypes.STRING,
    defaultValue: 'NO'
  },
  item: {
    type: DataTypes.STRING
  },
  detalle: {
    type: DataTypes.TEXT
  },
  monto: {
    type: DataTypes.INTEGER
  },
  iva: {
    type: DataTypes.INTEGER
  },
  total: {
    type: DataTypes.INTEGER
  },
  estado: {
    type: DataTypes.STRING
  },
  n_cheque: {
    type: DataTypes.STRING
  },
  razon: {
    type: DataTypes.STRING
  },
  cobros: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fecha_cobro: {
    type: DataTypes.DATEONLY
  },
  comicion: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  id_agente: {
    type: DataTypes.INTEGER,
    defaultValue: null
  }
}, {
  tableName: 'ventas',
  timestamps: false
});

module.exports = Sale;
