const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { successResponse, errorResponse } = require('../utils/response');

router.post('/sale-document', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No file uploaded', 400);
        }

        // Return the individual filename as stored
        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                path: req.file.path
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return errorResponse(res, 'Error uploading file');
    }
});

module.exports = router;
