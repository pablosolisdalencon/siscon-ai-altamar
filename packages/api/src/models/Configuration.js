const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Configuration = sequelize.define('configuraciones', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    clave: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    valor: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'configuraciones',
    timestamps: false
});

module.exports = Configuration;
