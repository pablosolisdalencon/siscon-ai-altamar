const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionsController');

router.get('/dashboard', collectionsController.getCollectionsDashboard);
router.post('/send-email', collectionsController.sendCollectionEmail);

module.exports = router;
