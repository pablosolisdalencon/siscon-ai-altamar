const { Sale, Client, SaleState } = require('./models/associations');
const { Op } = require('sequelize');

async function test() {
  try {
    const saleWhere = {
      [Op.and]: [
        { n_factura: { [Op.ne]: '0' } }
      ]
    };
    saleWhere[Op.and].push({ fecha: { [Op.gt]: '1900-01-01' } });
    saleWhere.pagado = 'NO';

    const clientWhere = {};
    const order = [['id_venta', 'DESC']];

    console.log('Running query...');
    const { count, rows: clients } = await Client.findAndCountAll({
      where: clientWhere,
      include: [
        {
          model: Sale,
          as: 'ventas',
          where: saleWhere,
          required: true,
          include: [{ model: SaleState, as: 'status', constraints: false }]
        }
      ],
      order: [
        ['razon', 'ASC'],
        [{ model: Sale, as: 'ventas' }, ...order[0]]
      ],
      limit: 10,
      offset: 0,
      distinct: true
    });
    console.log('Success! Count:', count);
  } catch (err) {
    console.error('FAILED:', err);
  } finally {
    process.exit();
  }
}

test();
