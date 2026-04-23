const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cobrobot = sequelize.define('cobrobot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    max: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    frecuencia: {
        type: DataTypes.STRING,
        defaultValue: '1m'
    },
    dia_inicio: {
        type: DataTypes.STRING,
        defaultValue: 'l'
    },
    mes_inicio: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    hora_inicio: {
        type: DataTypes.TIME,
        defaultValue: '12:00:00'
    },
    def: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    otro: {
        type: DataTypes.INTEGER
    },
    otro2: {
        type: DataTypes.INTEGER
    },
    cobrobot: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'cobrobot',
    timestamps: false
});

module.exports = Cobrobot;
