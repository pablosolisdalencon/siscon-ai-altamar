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
// Disabling physical constraints to match the exact SQL schema (no FKs)
Sale.belongsTo(Client, { foreignKey: 'id_cliente', as: 'client', constraints: false });
Client.hasMany(Sale, { foreignKey: 'id_cliente', constraints: false });

Sale.belongsTo(SaleState, { foreignKey: 'estado', as: 'status', constraints: false });
SaleState.hasMany(Sale, { foreignKey: 'estado', constraints: false });

Sale.belongsTo(Agent, { foreignKey: 'id_agente', as: 'agent', constraints: false });
Agent.hasMany(Sale, { foreignKey: 'id_agente', constraints: false });

// Purchase Associations
Purchase.belongsTo(Client, { foreignKey: 'id_cliente', as: 'client', constraints: false });
Client.hasMany(Purchase, { foreignKey: 'id_cliente', constraints: false });

// Cobrobot Associations
Cobrobot.belongsTo(Client, { foreignKey: 'id_cliente', as: 'client', constraints: false });
Client.hasOne(Cobrobot, { foreignKey: 'id_cliente', constraints: false });

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
