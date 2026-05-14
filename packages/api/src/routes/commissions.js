const express = require('express');
const router = express.Router();
const commissionsController = require('../controllers/commissionsController');

router.get('/', commissionsController.getCommissions);
router.post('/send-report', commissionsController.sendReport);

module.exports = router;
