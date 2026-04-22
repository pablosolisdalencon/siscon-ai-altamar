const Sale = require('./Sale');
const Client = require('./Client');
const SaleState = require('./SaleState');
const Agent = require('./Agent');
const Provider = require('./Provider');
const User = require('./User');

// Sales Associations
Sale.belongsTo(Client, { foreignKey: 'id_cliente', as: 'client' });
Sale.belongsTo(SaleState, { foreignKey: 'estado', as: 'status' });
Sale.belongsTo(Agent, { foreignKey: 'id_agente', as: 'agent' });

Client.hasMany(Sale, { foreignKey: 'id_cliente' });
Agent.hasMany(Sale, { foreignKey: 'id_agente' });

module.exports = {
  Sale,
  Client,
  SaleState,
  Agent,
  Provider,
  User
};
