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

    // 0. Crear usuario admin por defecto si no existe
    const [[adminExists]] = await sequelize.query("SELECT * FROM usuarios WHERE user = 'admin'");
    if (!adminExists) {
      await sequelize.query("INSERT INTO usuarios (user, pass, mail, role, comicion) VALUES ('admin', 'TiburonBlanco.,2026', 'admin@test.com', 'admin', 0)");
      console.log('✅ Usuario "admin" creado.');
    } else {
      console.log('ℹ️ El usuario "admin" ya existe.');
    }

    // 1. Crear usuario psolis si no existe
    const [[userExists]] = await sequelize.query("SELECT * FROM usuarios WHERE user = 'psolis'");
    let userId;
    if (!userExists) {
      const [insertUser] = await sequelize.query("INSERT INTO usuarios (user, pass, mail, role, comicion) VALUES ('psolis', 'CometaHalley.,2026', 'pablo.solis.dalencon@gmail.com', 'agente', 25)");
      userId = insertUser;
      console.log('✅ Usuario "psolis" creado.');
    } else {
      userId = userExists.id_user;
      console.log('ℹ️ El usuario "psolis" ya existe.');
    }

    // 2. Crear cliente genérico si no existe (ya que ventas requiere id_cliente)
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

    // 3. Crear venta de muestra si no existe
    const [[saleExists]] = await sequelize.query(`SELECT * FROM ventas WHERE id_agente = ${userId} AND total = 1000000`);
    if (!saleExists) {
      const sqlSale = `INSERT INTO ventas (fecha, n_factura, n_cot, n_oc, id_cliente, id_agente, item, detalle, monto, iva, total, estado, pagado, comicion) VALUES ('${new Date().toISOString().split('T')[0]}', 9999, 0, 0, ${clientId}, ${userId}, 'Servicio de Prueba', 'Venta de muestra para dashboard', 840336, 159664, 1000000, 1, 'NO', 250000)`;
      await sequelize.query(sqlSale);
      console.log('✅ Venta de muestra creada.');
    } else {
      console.log('ℹ️ La venta de muestra ya existe.');
    }

    // 4. Crear usuario colaborador1 si no existe
    const [[colabExists]] = await sequelize.query("SELECT * FROM usuarios WHERE user = 'colaborador1'");
    let colabId;
    if (!colabExists) {
      const [insertColab] = await sequelize.query("INSERT INTO usuarios (user, pass, mail, role, comicion) VALUES ('colaborador1', 'CometaHalley.,2026', 'colaborador1@test.com', 'agente', 20)");
      colabId = insertColab;
      console.log('✅ Usuario "colaborador1" creado.');
    } else {
      colabId = colabExists.id_user;
      console.log('ℹ️ El usuario "colaborador1" ya existe.');
    }

    // 5. Crear venta de muestra para colaborador1
    const [[saleColabExists]] = await sequelize.query(`SELECT * FROM ventas WHERE id_agente = ${colabId} AND total = 500000`);
    if (!saleColabExists) {
      const sqlSaleColab = `INSERT INTO ventas (fecha, n_factura, n_cot, n_oc, id_cliente, id_agente, item, detalle, monto, iva, total, estado, pagado, comicion) VALUES ('${new Date().toISOString().split('T')[0]}', 8888, 0, 0, ${clientId}, ${colabId}, 'Servicio Colaborador', 'Venta de muestra para colaborador', 420168, 79832, 500000, 1, 'NO', 100000)`;
      await sequelize.query(sqlSaleColab);
      console.log('✅ Venta de muestra para colaborador creada.');
    } else {
      console.log('ℹ️ La venta de muestra para colaborador ya existe.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar el comando SQL:', error);
    process.exit(1);
  }
}

run();
