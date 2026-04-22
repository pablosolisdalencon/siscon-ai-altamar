const { Agent, Client, Provider, User, SaleState } = require('../models/associations');

const crudFactory = (Model) => ({
  getAll: async (req, res) => {
    try {
      const items = await Model.findAll();
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
      await item.update(req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
      await item.destroy();
      res.json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// Implementations
const agentsCRUD = crudFactory(Agent);
const clientsCRUD = crudFactory(Client);
const providersCRUD = crudFactory(Provider);
const usersCRUD = crudFactory(User);

module.exports = {
  // Agents
  getAgents: agentsCRUD.getAll,
  createAgent: agentsCRUD.create,
  updateAgent: agentsCRUD.update,
  deleteAgent: agentsCRUD.delete,
  
  // Clients
  getClients: clientsCRUD.getAll,
  createClient: clientsCRUD.create,
  updateClient: clientsCRUD.update,
  deleteClient: clientsCRUD.delete,

  // Providers
  getProviders: providersCRUD.getAll,
  createProvider: providersCRUD.create,
  updateProvider: providersCRUD.update,
  deleteProvider: providersCRUD.delete,

  // Users
  getUsers: usersCRUD.getAll,
  createUser: usersCRUD.create,
  updateUser: usersCRUD.update,
  deleteUser: usersCRUD.delete,

  // Sale States
  getSaleStates: crudFactory(SaleState).getAll
};
