/**
 * Entry point for cPanel Node.js Selector
 */
console.log('--- Starting SISCON-AI API ---');
try {
  require('./src/server.js');
  console.log('✅ server.js loaded successfully');
} catch (err) {
  console.error('❌ Error loading server.js:', err);
  
  // Fallback for debugging if server.js fails to load
  const express = require('express');
  const app = express();
  app.get('*', (req, res) => {
    res.json({ 
      error: 'API failed to start', 
      message: err.message,
      stack: err.stack 
    });
  });
  app.listen(process.env.PORT || 4000);
}
