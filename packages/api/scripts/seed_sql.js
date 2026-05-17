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

    // 0. Eliminar tabla legacy 'agentes' (si existe)
    try {
      await sequelize.query('DROP TABLE IF EXISTS agentes');
      console.log('✅ Tabla legacy "agentes" eliminada (los agentes ahora son un rol en "usuarios").');
    } catch (err) {
      console.log('ℹ️ Error al intentar eliminar la tabla "agentes" o ya no existía.');
    }

    // 1. Limpieza estricta de usuarios (Prod manda)
    try {
      await sequelize.query("DELETE FROM usuarios WHERE user NOT IN ('carlos', 'psolis')");
      console.log('✅ Usuarios no deseados eliminados.');
    } catch (err) {
      console.log('ℹ️ Error limpiando usuarios:', err);
    }

    // 2. Crear o asegurar usuario carlos como admin
    const [[carlosExists]] = await sequelize.query("SELECT * FROM usuarios WHERE user = 'carlos'");
    if (!carlosExists) {
      await sequelize.query("INSERT INTO usuarios (user, pass, mail, role, comicion) VALUES ('carlos', 'tiburonblanco', 'czuniga@surfotos.cl', 'admin', 0)");
      console.log('✅ Usuario "carlos" (admin) creado.');
    } else {
      await sequelize.query("UPDATE usuarios SET role = 'admin', comicion = 0 WHERE user = 'carlos'");
      console.log('ℹ️ El usuario "carlos" ya existe, asegurado como admin.');
    }

    // 3. Crear usuario psolis si no existe (agente)
    const [[userExists]] = await sequelize.query("SELECT * FROM usuarios WHERE user = 'psolis'");
    let userId;
    if (!userExists) {
      const [insertUser] = await sequelize.query("INSERT INTO usuarios (user, pass, mail, role, comicion) VALUES ('psolis', 'CometaHalley.,2026', 'pablo.solis.dalencon@gmail.com', 'agente', 25)");
      userId = insertUser;
      console.log('✅ Usuario "psolis" (agente) creado.');
    } else {
      userId = userExists.id_user;
      console.log('ℹ️ El usuario "psolis" ya existe.');
    }

    // 4. Crear cliente genérico si no existe (ya que ventas requiere id_cliente)
    const [[clientExists]] = await sequelize.query("SELECT * FROM clientes WHERE razon = 'Cliente Generico'");
    let clientId;
    if (!clientExists) {
      const [insertClient] = await sequelize.query("INSERT INTO clientes (rut, razon) VALUES ('1-9', 'Cliente Generico')");
      clientId = insertClient;
      console.log('✅ Cliente "Cliente Generico" creado.');
    } else {
      clientId = clientExists.id_cliente;
      console.log('ℹ️ El cliente "Cliente Generico" ya existe.');
    }

    // 5. Crear venta de muestra si no existe
    const [[saleExists]] = await sequelize.query(`SELECT * FROM ventas WHERE id_agente = ${userId} AND total = 1000000`);
    if (!saleExists) {
      const sqlSale = `INSERT INTO ventas (fecha, n_factura, n_cot, n_oc, id_cliente, id_agente, item, detalle, monto, iva, total, estado, pagado, comicion) VALUES ('${new Date().toISOString().split('T')[0]}', 9999, 0, 0, ${clientId}, ${userId}, 'Servicio de Prueba', 'Venta de muestra para dashboard', 840336, 159664, 1000000, 1, 'NO', 250000)`;
      await sequelize.query(sqlSale);
      console.log('✅ Venta de muestra creada para agente psolis.');
    } else {
      console.log('ℹ️ La venta de muestra ya existe.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar el comando SQL:', error);
    process.exit(1);
  }
}

run();
