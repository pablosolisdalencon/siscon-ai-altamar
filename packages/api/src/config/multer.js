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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
