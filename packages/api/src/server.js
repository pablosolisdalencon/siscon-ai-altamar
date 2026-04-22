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
app.use('/api/sales', salesRoutes);
app.use('/api/collections', collectionsRoutes);

// Module Routes
// Agents
app.get('/api/agents', modulesController.getAgents);
app.post('/api/agents', modulesController.createAgent);
app.put('/api/agents/:id', modulesController.updateAgent);
app.delete('/api/agents/:id', modulesController.deleteAgent);

// Clients
app.get('/api/clients', modulesController.getClients);
app.post('/api/clients', modulesController.createClient);
app.put('/api/clients/:id', modulesController.updateClient);
app.delete('/api/clients/:id', modulesController.deleteClient);

// Providers
app.get('/api/providers', modulesController.getProviders);
app.post('/api/providers', modulesController.createProvider);
app.put('/api/providers/:id', modulesController.updateProvider);
app.delete('/api/providers/:id', modulesController.deleteProvider);

// Users
app.get('/api/users', modulesController.getUsers);
app.post('/api/users', modulesController.createUser);
app.put('/api/users/:id', modulesController.updateUser);
app.delete('/api/users/:id', modulesController.deleteUser);

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
