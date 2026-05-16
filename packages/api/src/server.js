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
const importRoutes = require('./routes/import');
const authRoutes = require('./routes/auth');
const commissionsRoutes = require('./routes/commissions');
const modulesController = require('./controllers/modulesController');

const { authenticateToken, authorizeRole } = require('./utils/authMiddleware');

// Middleware
app.use(cors());
app.use(express.json());

// Diagnostic endpoint - verifica qué versión está corriendo y qué URL recibe Node
app.get('/_health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '2.1.0-blindaje',
    node_sees: { url: req.url, originalUrl: req.originalUrl, path: req.path, baseUrl: req.baseUrl }
  });
});

const apiRouter = express.Router();

// Routes Registration
// Public routes (no token required)
apiRouter.get('/_health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '2.1.0-blindaje',
    node_sees: { url: req.url, originalUrl: req.originalUrl, path: req.path, baseUrl: req.baseUrl }
  });
});
apiRouter.use('/auth', authRoutes);

// Protect all subsequent routes
apiRouter.use(authenticateToken);

// Allow access to commissions for both admin and agent
apiRouter.use('/commissions', authorizeRole(['admin', 'agente']), commissionsRoutes);

// Restrict all other routes to admin only
apiRouter.use((req, res, next) => {
  authorizeRole(['admin'])(req, res, next);
});

apiRouter.use('/sales', salesRoutes);
apiRouter.use('/collections', collectionsRoutes);
apiRouter.use('/purchases', purchasesRoutes);
apiRouter.use('/company', companyRoutes);
apiRouter.use('/uploads', uploadRoutes);
apiRouter.use('/import', importRoutes);

// Module Routes

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

// Global Configurations
apiRouter.get('/configurations', modulesController.getConfigurations);
apiRouter.post('/configurations', modulesController.createConfiguration);
apiRouter.put('/configurations/:id', modulesController.updateConfiguration);

// ═══════════════════════════════════════════════════════════════
// MONTAJE MULTI-PREFIJO: Express maneja el prefix-stripping nativamente.
// Montamos el router en cada prefijo posible que Passenger/cPanel pueda enviar.
// Express prueba cada mount en orden y stripea el prefijo automáticamente.
// ═══════════════════════════════════════════════════════════════
app.use('/siscon-ai/api', apiRouter);  // Si Passenger pasa el path completo
app.use('/api', apiRouter);            // Si Passenger stripea /siscon-ai
app.use('/', apiRouter);               // Si Passenger stripea todo

// Static Files (Legacy Parity for Documents)
const path = require('path');
app.use('/docs', express.static(path.join(__dirname, '../docs')));

// Start Server
const startServer = async () => {
  await connectDB();
  
  // Sync User model to add comicion column if missing
  try {
    await User.sync({ alter: true });
    console.log('✅ User table synced successfully.');
  } catch (err) {
    console.error('❌ Error syncing User table:', err);
  }

  // Test Model Load
  console.log('📦 Models loaded successfully.');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
