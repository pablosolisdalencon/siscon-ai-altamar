const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Endpoint to receive a .sql file and overwrite relevant tables
router.post('/database', upload.single('file'), importController.importSql);

// Endpoint to export database to SQL
router.get('/export', importController.exportSql);

module.exports = router;
