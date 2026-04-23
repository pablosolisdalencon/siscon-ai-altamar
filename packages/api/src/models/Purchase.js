const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Purchase = sequelize.define('compras', {
  id_compra: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY
  },
  n_oc: {
    type: DataTypes.INTEGER
  },
  pagado: {
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
  fecha_entrega: {
    type: DataTypes.DATEONLY
  },
  fecha_pago: {
    type: DataTypes.DATEONLY
  },
  n_cheque: {
    type: DataTypes.STRING
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  entregado: {
    type: DataTypes.STRING,
    defaultValue: 'NO'
  }
}, {
  tableName: 'compras',
  timestamps: false
});

module.exports = Purchase;
