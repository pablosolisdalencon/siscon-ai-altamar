const fs = require('fs');
const path = require('path');

// Robust path resolution for Render and local environments
const associationsPath = path.resolve(__dirname, '..', 'src', 'models', 'associations.js');
const dbPath = path.resolve(__dirname, '..', 'src', 'config', 'database.js');
const SQL_FILE_PATH = path.resolve(__dirname, '..', '..', '..', 'backup_altamarm_contable_2026-04-22_21-05-18.sql');

async function importData() {
    try {
        console.log('🚀 Checking for data import requirement...');

        if (!fs.existsSync(SQL_FILE_PATH)) {
            console.log('ℹ️ SQL backup file not found. Skipping auto-import.');
            return;
        }

        const {
            Client, Sale, Company, Provider, Purchase,
            User, SaleState, Cobrobot, SaleRecord
        } = require(associationsPath);
        const { sequelize } = require(dbPath);

        await sequelize.authenticate();
        console.log('📡 Connected to database.');

        // Ensure tables exist before trying to truncate/import
        console.log('🔄 Syncing database schema...');
        await sequelize.sync({ alter: false });
        console.log('✅ Schema synchronization complete. Starting data import...');

        const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');

        const tables = {
            'clientes': Client,
            'ventas': Sale,
            'empresa': Company,
            'proveedores': Provider,
            'compras': Purchase,
            'usuarios': User,
            'estados_venta': SaleState,
            'cobrobot': Cobrobot,
            'registros_ventas': SaleRecord
        };

        for (const [tableName, Model] of Object.entries(tables)) {
            const insertRegex = new RegExp(`INSERT INTO \`${tableName}\` VALUES ([\\s\\S]*?);`, 'g');
            let match;
            let allDataToInsert = [];

            while ((match = insertRegex.exec(sqlContent)) !== null) {
                const rawValues = match[1].trim();
                const recordMatches = [];
                let depth = 0;
                let start = 0;
                let inQuote = false;

                for (let i = 0; i < rawValues.length; i++) {
                    const char = rawValues[i];
                    if (char === "'" && rawValues[i - 1] !== "\\") inQuote = !inQuote;
                    if (!inQuote) {
                        if (char === '(') {
                            if (depth === 0) start = i + 1;
                            depth++;
                        } else if (char === ')') {
                            depth--;
                            if (depth === 0) recordMatches.push(rawValues.substring(start, i));
                        }
                    }
                }

                const dataToInsert = recordMatches.map(record => {
                    const fields = [];
                    let currentField = "";
                    let innerInQuote = false;
                    let quoteChar = "";

                    for (let i = 0; i < record.length; i++) {
                        const char = record[i];
                        if ((char === "'" || char === '"') && record[i - 1] !== "\\") {
                            if (!innerInQuote) {
                                innerInQuote = true;
                                quoteChar = char;
                            } else if (char === quoteChar) innerInQuote = false;
                            else currentField += char;
                        } else if (char === ',' && !innerInQuote) {
                            fields.push(currentField.trim());
                            currentField = "";
                        } else currentField += char;
                    }
                    fields.push(currentField.trim());

                    const values = fields.map(f => {
                        if (f.toUpperCase() === 'NULL') return null;
                        return f.replace(/\\'/g, "'").replace(/\\"/g, '"');
                    });

                    const obj = {};
                    let mapping = [];
                    if (tableName === 'clientes') mapping = ['id_cliente', 'rut', 'razon', 'direccion', 'giro', 'comercial_nombre', 'comercial_mail', 'comercial_fono', 'pago_nombre', 'pago_mail', 'pago_fono', 'mensaje_cobro', 'fono', 'mail', 'fecha_cobro'];
                    else if (tableName === 'ventas') mapping = ['id_venta', 'fecha', 'n_factura', 'n_cot', 'n_oc', 'f_factura', 'f_cot', 'f_oc', 'pagado', 'item', 'detalle', 'monto', 'iva', 'total', 'fecha_entrega', 'fecha_pago', 'n_cheque', 'id_cliente', 'entregado', 'razon', 'estado', 'cobros', 'fecha_cobro'];
                    else if (tableName === 'empresa') mapping = ['id_empresa', 'rut', 'razon', 'direccion', 'giro', 'CF', 'comercial_nombre', 'comercial_mail', 'comercial_fono', 'pago_nombre', 'pago_mail', 'pago_fono', 'pago_firma', 'fono', 'mail', 'contacto_c'];
                    else if (tableName === 'proveedores') mapping = ['id_proveedor', 'rut', 'razon', 'direccion', 'giro', 'CF', 'comercial_nombre', 'comercial_mail', 'comercial_fono', 'pago_nombre', 'pago_mail', 'pago_fono', 'fono', 'mail', 'contacto_c'];
                    else if (tableName === 'compras') mapping = ['id_compra', 'fecha', 'n_oc', 'pagado', 'item', 'detalle', 'monto', 'iva', 'total', 'fecha_entrega', 'fecha_pago', 'n_cheque', 'id_cliente', 'entregado'];
                    else if (tableName === 'usuarios') mapping = ['user', 'pass', 'mail', 'id_user'];
                    else if (tableName === 'estados_venta') mapping = ['id_estado', 'estado', 'color'];
                    else if (tableName === 'cobrobot') mapping = ['id', 'id_cliente', 'max', 'frecuencia', 'dia_inicio', 'mes_inicio', 'hora_inicio', 'def', 'otro', 'otro2', 'cobrobot'];
                    else if (tableName === 'registros_ventas') mapping = ['id', 'cantidad'];

                    mapping.forEach((key, index) => {
                        let val = values[index];
                        if (val === '0000-00-00') val = null;
                        obj[key] = val;
                    });
                    return obj;
                });
                allDataToInsert = allDataToInsert.concat(dataToInsert);
            }

            if (allDataToInsert.length > 0) {
                await Model.destroy({ where: {}, truncate: true, cascade: false });
                await Model.bulkCreate(allDataToInsert, { ignoreDuplicates: true });
                console.log(`✅ ${tableName}: ${allDataToInsert.length} records imported.`);
            }
        }

        console.log('✨ Data synchronization complete.');
    } catch (error) {
        console.error('❌ Error during auto-import:');
        if (error.errors) {
            error.errors.forEach(err => console.error(`  - ${err.message} (${err.path})`));
        } else {
            console.error(error);
        }
    }
}

importData();
