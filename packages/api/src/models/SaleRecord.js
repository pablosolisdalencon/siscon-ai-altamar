const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SaleRecord = sequelize.define('registros_ventas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    cantidad: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    }
}, {
    tableName: 'registros_ventas',
    timestamps: false
});

module.exports = SaleRecord;
