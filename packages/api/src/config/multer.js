const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = 'docs/';
        const type = req.body.type; // 'COTIZACIONES', 'FACTURAS', 'ORDENES-DE-COMPRA'

        if (type === 'COTIZACION') dest += 'COTIZACIONES';
        else if (type === 'FACTURA') dest += 'FACTURAS';
        else if (type === 'OC') dest += 'ORDENES-DE-COMPRA';

        const fullPath = path.join(process.cwd(), dest);

        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const type = req.body.type;
        const date = req.body.fecha || new Date().toISOString().split('T')[0];
        const number = req.body.numero || 'X';
        const ext = path.extname(file.originalname);

        let prefix = 'DOC';
        if (type === 'FACTURA') prefix = 'FAC';
        else if (type === 'COTIZACION') prefix = 'COT';
        else if (type === 'OC') prefix = 'OC';

        // Legacy format: fecha-DOCnumero.ext (e.g., 2024-04-23-FAC123.pdf)
        const filename = `${date}-${prefix}${number}${ext}`;

        // If file exists, add a small random string to avoid overwrites
        const fullPath = path.join(process.cwd(), 'docs',
            type === 'FACTURA' ? 'FACTURAS' :
                type === 'COTIZACION' ? 'COTIZACIONES' : 'ORDENES-DE-COMPRA',
            filename);

        if (fs.existsSync(fullPath)) {
            const uniqueSuffix = '-' + Math.round(Math.random() * 1E4);
            cb(null, `${date}-${prefix}${number}${uniqueSuffix}${ext}`);
        } else {
            cb(null, filename);
        }
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
