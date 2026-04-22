const Sale = require('./Sale');
const Client = require('./Client');
const SaleState = require('./SaleState');
const Agent = require('./Agent');
const Provider = require('./Provider');
const Purchase = require('./Purchase');
const Company = require('./Company');
const User = require('./User');

// Sales Associations
Sale.belongsTo(Client, { foreignKey: 'id_cliente', as: 'client' });
Client.hasMany(Sale, { foreignKey: 'id_cliente' });

Sale.belongsTo(SaleState, { foreignKey: 'estado', as: 'status' });
SaleState.hasMany(Sale, { foreignKey: 'estado' });

Sale.belongsTo(Agent, { foreignKey: 'id_agente', as: 'agent' });
Agent.hasMany(Sale, { foreignKey: 'id_agente' });

// Purchase Associations
Purchase.belongsTo(Provider, { foreignKey: 'id_proveedor', as: 'provider' });
Provider.hasMany(Purchase, { foreignKey: 'id_proveedor' });

module.exports = {
  Sale,
  Client,
  SaleState,
  Agent,
  Provider,
  Purchase,
  Company,
  User
};
