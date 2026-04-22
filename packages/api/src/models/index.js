const { sequelize } = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Sale = require('./Sale');
const SaleState = require('./SaleState');
const Provider = require('./Provider');
const Purchase = require('./Purchase');
const Company = require('./Company');

// Associations
Sale.belongsTo(Client, { foreignKey: 'id_cliente', as: 'client' });
Client.hasMany(Sale, { foreignKey: 'id_cliente' });

Sale.belongsTo(SaleState, { foreignKey: 'estado', as: 'status' });
SaleState.hasMany(Sale, { foreignKey: 'estado' });

Purchase.belongsTo(Provider, { foreignKey: 'id_proveedor', as: 'provider' });
Provider.hasMany(Purchase, { foreignKey: 'id_proveedor' });

module.exports = {
  sequelize,
  User,
  Client,
  Sale,
  SaleState,
  Provider,
  Purchase,
  Company
};
