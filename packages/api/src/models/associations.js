const Sale = require('./Sale');
const Client = require('./Client');
const SaleState = require('./SaleState');
const Agent = require('./Agent');
const Provider = require('./Provider');
const Purchase = require('./Purchase');
const Company = require('./Company');
const User = require('./User');
const Cobrobot = require('./Cobrobot');
const SaleRecord = require('./SaleRecord');

// Sales Associations
Sale.belongsTo(Client, { foreignKey: 'id_cliente', as: 'client' });
Client.hasMany(Sale, { foreignKey: 'id_cliente' });

Sale.belongsTo(SaleState, { foreignKey: 'estado', as: 'status' });
SaleState.hasMany(Sale, { foreignKey: 'estado' });

Sale.belongsTo(Agent, { foreignKey: 'id_agente', as: 'agent' });
Agent.hasMany(Sale, { foreignKey: 'id_agente' });

// Purchase Associations
// Note: SQL uses id_cliente in compras. We link it to Client following naming, 
// even if logically it might have been provider in other contexts.
Purchase.belongsTo(Client, { foreignKey: 'id_cliente', as: 'client' });
Client.hasMany(Purchase, { foreignKey: 'id_cliente' });

// Cobrobot Associations
Cobrobot.belongsTo(Client, { foreignKey: 'id_cliente', as: 'client' });
Client.hasOne(Cobrobot, { foreignKey: 'id_cliente' });

module.exports = {
  Sale,
  Client,
  SaleState,
  Agent,
  Provider,
  Purchase,
  Company,
  User,
  Cobrobot,
  SaleRecord
};
