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
const purchasesRoutes = require('./routes/purchases');
const companyRoutes = require('./routes/company');
const uploadRoutes = require('./routes/uploadRoutes');
const modulesController = require('./controllers/modulesController');

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'SISCON-AI API is running', version: '1.0.0' });
});

const apiRouter = express.Router();

// Routes Registration
apiRouter.use('/sales', salesRoutes);
apiRouter.use('/collections', collectionsRoutes);
apiRouter.use('/purchases', purchasesRoutes);
apiRouter.use('/company', companyRoutes);
apiRouter.use('/uploads', uploadRoutes);

// Module Routes
// Agents
apiRouter.get('/agents', modulesController.getAgents);
apiRouter.post('/agents', modulesController.createAgent);
apiRouter.put('/agents/:id', modulesController.updateAgent);
apiRouter.delete('/agents/:id', modulesController.deleteAgent);

// Clients
apiRouter.get('/clients', modulesController.getClients);
apiRouter.post('/clients', modulesController.createClient);
apiRouter.put('/clients/:id', modulesController.updateClient);
apiRouter.delete('/clients/:id', modulesController.deleteClient);

// Providers
apiRouter.get('/providers', modulesController.getProviders);
apiRouter.post('/providers', modulesController.createProvider);
apiRouter.put('/providers/:id', modulesController.updateProvider);
apiRouter.delete('/providers/:id', modulesController.deleteProvider);

// Users
apiRouter.get('/users', modulesController.getUsers);
apiRouter.post('/users', modulesController.createUser);
apiRouter.put('/users/:id', modulesController.updateUser);
apiRouter.delete('/users/:id', modulesController.deleteUser);

// Sale States
apiRouter.get('/sale-states', modulesController.getSaleStates);
apiRouter.post('/sale-states', modulesController.createSaleState);
apiRouter.put('/sale-states/:id', modulesController.updateSaleState);
apiRouter.delete('/sale-states/:id', modulesController.deleteSaleState);

// Sale Records
apiRouter.get('/sale-records', modulesController.getSaleRecords);
apiRouter.put('/sale-records/:id', modulesController.updateSaleRecord);

app.use('/api', apiRouter);

// Static Files (Legacy Parity for Documents)
const path = require('path');
app.use('/docs', express.static(path.join(__dirname, '../docs')));

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
