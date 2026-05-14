const { sequelize } = require('../src/config/database');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos.');

    // Verificar si la columna ya existe para no fallar
    const [columns] = await sequelize.query('SHOW COLUMNS FROM usuarios');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('comicion')) {
      const sql = 'ALTER TABLE usuarios ADD COLUMN comicion FLOAT DEFAULT 0;';
      console.log(`Ejecutando: ${sql}`);
      await sequelize.query(sql);
      console.log('✅ Columna "comicion" añadida con éxito a la tabla "usuarios".');
    } else {
      console.log('ℹ️ La columna "comicion" ya existe en la tabla "usuarios".');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar el comando SQL:', error);
    process.exit(1);
  }
}

run();
