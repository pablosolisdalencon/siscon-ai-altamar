const { sequelize } = require('../config/database');
const fs = require('fs');
const { successResponse, errorResponse } = require('../utils/response');

exports.importSql = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No se ha subido ningún archivo', 400);
    }

    const sqlPath = req.file.path;
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log(`[Import] Processing SQL file: ${req.file.originalname}`);

    // Disable foreign key checks to prevent issues with order of tables
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    // Execute the SQL content
    // multipleStatements: true in config allows this
    await sequelize.query(sqlContent);

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    // REPAIR SCHEMA (Homologación post-importación)
    try {
      console.log('[Import] Repairing schema for application compatibility...');
      const [columns] = await sequelize.query('SHOW COLUMNS FROM ventas');
      const columnNames = columns.map(c => c.Field);

      if (!columnNames.includes('id_agente')) {
        await sequelize.query('ALTER TABLE ventas ADD COLUMN id_agente INT DEFAULT NULL');
        console.log('[Import] Added missing column id_agente to ventas');
      }
      if (!columnNames.includes('comicion')) {
        await sequelize.query('ALTER TABLE ventas ADD COLUMN comicion FLOAT DEFAULT 0');
        console.log('[Import] Added missing column comicion to ventas');
      }
    } catch (repairError) {
      console.error('[Import] Warning: Schema repair failed:', repairError.message);
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(sqlPath);
    } catch (err) {
      console.warn(`[Import] Could not delete temp file ${sqlPath}:`, err);
    }

    return successResponse(res, null, 'Base de datos importada con éxito. Las tablas se han sobrescrito y el esquema ha sido homologado.');

  } catch (error) {
    console.error('Error importing SQL:', error);
    
    // Try to re-enable FK checks even on error
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    } catch (e) {}

    return errorResponse(res, 'Error al importar la base de datos', 500, {
      detail: error.message,
      code: error.parent?.code || error.code,
      sqlMessage: error.parent?.sqlMessage,
      sqlState: error.parent?.sqlState,
      sql: error.parent?.sql ? error.parent.sql.substring(0, 1000) : null
    });
  }
};
