const { Sale, Client, Company, SaleState } = require('../models/associations');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

exports.getCollectionsDashboard = async (req, res) => {
  try {
    const { nFactura, nCot, from, to, clientSearch, pagado, estado, sort } = req.query;

    const saleWhere = {
      [Op.and]: [
        { n_factura: { [Op.ne]: '0' } }
      ]
    };

    if (nFactura) saleWhere[Op.and].push({ n_factura: nFactura });
    if (nCot) saleWhere[Op.and].push({ n_cot: nCot });
    if (estado) saleWhere[Op.and].push({ estado: estado });

    // Dates (Full parity with legacy logic)
    if (from && to) {
      saleWhere.fecha = { [Op.between]: [from, to] };
    } else if (from) {
      saleWhere.fecha = from;
    } else if (to) {
      saleWhere.fecha = to;
    }

    if (pagado && pagado !== 'TODAS') {
      saleWhere.pagado = pagado;
    } else if (!pagado) {
      // Default to unpaid if not specified, though legacy seems to default based on radio buttons
      // We'll keep the current default 'NO' if not specified for UX consistency
      saleWhere.pagado = 'NO';
    }

    // Sort mapping (Legacy parity)
    let order = [['id_venta', 'DESC']]; // Default
    if (sort === 'fecha_pago') order = [['fecha_pago', 'DESC']];
    if (sort === 'fecha_entrega') order = [['fecha_entrega', 'DESC']];

    const clientWhere = {};
    if (clientSearch) {
      clientWhere[Op.or] = [
        { razon: { [Op.like]: `%${clientSearch}%` } },
        { rut: { [Op.like]: `%${clientSearch}%` } }
      ];
    }

    const clients = await Client.findAll({
      where: clientWhere,
      include: [
        {
          model: Sale,
          where: saleWhere,
          required: true,
          include: [{ model: SaleState, as: 'status', constraints: false }]
        }
      ],
      order: [
        ['razon', 'ASC'], // Group by client name
        [{ model: Sale, as: 'ventas' }, ...order[0]] // Sort sales within each client
      ]
    });

    // Process collections logic (Parity with f-cobros.php)
    const dashboard = clients.map(client => {
      let totalMonto = 0;
      let totalIva = 0;
      let totalTotal = 0;

      const items = client.ventas.map(sale => {
        const today = new Date();
        const dueDateStr = sale.fecha_pago;
        let daysOverdue = 0;

        if (dueDateStr && dueDateStr !== '0000-00-00') {
          const dueDate = new Date(dueDateStr);
          if (!isNaN(dueDate.getTime())) {
            const diffTime = today - dueDate;
            daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
          }
        }

        totalMonto += sale.monto || 0;
        totalIva += sale.iva || 0;
        totalTotal += sale.total || 0;

        return {
          ...sale.toJSON(),
          daysOverdue
        };
      });

      return {
        id_cliente: client.id_cliente,
        razon: client.razon,
        rut: client.rut,
        mail: client.pago_mail,
        mensaje: client.mensaje_cobro,
        stats: {
          pendingItems: items.length,
          totalMonto,
          totalIva,
          totalTotal
        },
        items
      };
    });

    return successResponse(res, dashboard);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return errorResponse(res, 'Error fetching collections dashboard');
  }
};

exports.sendCollectionEmail = async (req, res) => {
  // Logic to be implemented in Sprint 4 (as per Sprint Plan)
  // For now, return mock success
  return successResponse(res, null, 'Email engine would be triggered here (Sprint 4)');
};
