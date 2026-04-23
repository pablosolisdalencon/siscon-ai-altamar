const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/database');
const { User, Client, Sale, SaleState, Provider, Purchase, Company, Agent } = require('./models/associations');

const app = express();
const PORT = process.env.PORT || 4000;

// Routes Imports
const salesRoutes = require('./routes/sales');
const collectionsRoutes = require('./routes/collections');
const modulesController = require('./controllers/modulesController');

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'SISCON-AI API is running', version: '1.0.0' });
});

// Routes Registration
app.use('/sales', salesRoutes);
app.use('/collections', collectionsRoutes);

// Module Routes
// Agents
app.get('/agents', modulesController.getAgents);
app.post('/agents', modulesController.createAgent);
app.put('/agents/:id', modulesController.updateAgent);
app.delete('/agents/:id', modulesController.deleteAgent);

// Clients
app.get('/clients', modulesController.getClients);
app.post('/clients', modulesController.createClient);
app.put('/clients/:id', modulesController.updateClient);
app.delete('/clients/:id', modulesController.deleteClient);

// Providers
app.get('/providers', modulesController.getProviders);
app.post('/providers', modulesController.createProvider);
app.put('/providers/:id', modulesController.updateProvider);
app.delete('/providers/:id', modulesController.deleteProvider);

// Users
app.get('/users', modulesController.getUsers);
app.post('/users', modulesController.createUser);
app.put('/users/:id', modulesController.updateUser);
app.delete('/users/:id', modulesController.deleteUser);

// Sale States
app.get('/sale-states', modulesController.getSaleStates);

// Start Server
const startServer = async () => {
  await connectDB();

  // Test Model Load
  console.log('📦 Models loaded successfully.');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
