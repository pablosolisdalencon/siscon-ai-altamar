const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/database');
const { User, Client, Sale, SaleState, Provider, Purchase, Company } = require('./models/associations');

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

// ╔═══════════════════════════════════════════════════════════════╗
// ║ DIAGNOSTIC: Primera linea de defensa - captura _diag en     ║
// ║ CUALQUIER posición de la URL, antes de todo middleware.      ║
// ╚═══════════════════════════════════════════════════════════════╝
app.use((req, res, next) => {
  // Log EVERY request for cPanel logs
  console.log(`[SISCON] ${req.method} url="${req.url}" orig="${req.originalUrl}" path="${req.path}"`);
  
  if (req.url.includes('_diag') || req.originalUrl.includes('_diag')) {
    return res.json({
      version: '2.3.0',
      url: req.url,
      originalUrl: req.originalUrl,
      path: req.path,
      baseUrl: req.baseUrl,
      method: req.method,
      host: req.headers.host
    });
  }
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Diagnostic endpoint - verifica qué versión está corriendo y qué URL recibe Node
app.get('/_health', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['user', 'role', 'mail', 'id_user'] });
    res.json({ 
      status: 'ok', 
      version: '2.4.0-diagnostico',
      node_sees: { url: req.url, originalUrl: req.originalUrl, path: req.path, baseUrl: req.baseUrl },
      users: users
    });
  } catch (err) {
    res.json({
      status: 'error',
      message: err.message,
      stack: err.stack
    });
  }
});

const apiRouter = express.Router();

// Routes Registration
// Public routes (no token required)
apiRouter.get('/_health', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['user', 'role', 'mail', 'id_user'] });
    res.json({ 
      status: 'ok', 
      version: '2.4.0-diagnostico',
      node_sees: { url: req.url, originalUrl: req.originalUrl, path: req.path, baseUrl: req.baseUrl },
      users: users
    });
  } catch (err) {
    res.json({
      status: 'error',
      message: err.message,
      stack: err.stack
    });
  }
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

// TEST DIRECTO: ruta sin Router, path completo, para verificar que Express matchea
app.get('/siscon-ai/api/ping', (req, res) => {
  res.json({ pong: true, version: '2.3.0' });
});

// ═══════════════════════════════════════════════════════════════
// STRIP PREFIJO: Sabemos que Passenger pasa la URL COMPLETA
// (ej: /siscon-ai/api/auth/captcha). Stripeamos el prefijo
// conocido para que el router reciba solo /auth/captcha.
// ═══════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  if (req.url.startsWith('/siscon-ai/api')) {
    req.url = req.url.slice('/siscon-ai/api'.length) || '/';
  } else if (req.url.startsWith('/api')) {
    req.url = req.url.slice('/api'.length) || '/';
  }
  next();
});

// Static Files (Legacy Parity for Documents) - Registered BEFORE apiRouter to bypass token authorization
const path = require('path');
app.use('/docs', express.static(path.join(__dirname, '../docs')));

// Montamos el router en raíz — el middleware ya limpió la URL
app.use(apiRouter);

// CATCH-ALL 404: Reemplaza el 'Cannot GET' con info diagnóstica
app.use((req, res) => {
  res.status(404).json({
    error: 'No route matched after strip',
    version: '2.3.0',
    url_after_strip: req.url,
    originalUrl: req.originalUrl,
    path: req.path
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  
  // Sync main tables to automatically add missing columns in production (id_agente, comicion)
  try {
    await User.sync({ alter: true });
    await Sale.sync({ alter: true });
    await Purchase.sync({ alter: true });
    await Client.sync({ alter: true });
    console.log('✅ Database tables synced successfully.');
  } catch (err) {
    console.error('❌ Error syncing database tables:', err);
  }

  // Test Model Load
  console.log('📦 Models loaded successfully.');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
