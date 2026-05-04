const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Specialized storage for company signature/logo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../../docs/FIRMAS');
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `firma_cobro${ext}`); // Single file for signature, we can overwrite or add timestamp
  }
});

const upload = multer({ storage: storage });

router.get('/', companyController.getCompany);
router.put('/', upload.single('firma'), companyController.updateCompany);

module.exports = router;
