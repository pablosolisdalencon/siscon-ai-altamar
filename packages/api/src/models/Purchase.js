const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Purchase = sequelize.define('compras', {
  id_compra: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  n_oc: {
    type: DataTypes.INTEGER
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
  id_proveedor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  razon: {
    type: DataTypes.STRING
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
    type: DataTypes.FLOAT
  },
  iva: {
    type: DataTypes.FLOAT
  },
  total: {
    type: DataTypes.FLOAT
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
