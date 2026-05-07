const { Sequelize } = require('sequelize');
require('dotenv').config({ path: 'packages/api/.env.development' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

async function checkTables() {
  try {
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('Tables:', JSON.stringify(tables, null, 2));
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      if (['clientes', 'agentes', 'proveedores', 'usuarios', 'vendedores', 'prov'].some(s => tableName.toLowerCase().includes(s))) {
        const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${tableName}`);
        console.log(`Columns for ${tableName}:`, JSON.stringify(columns, null, 2));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
