const { Sale, Client, Company, SaleState } = require('../models/associations');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

exports.getCollectionsDashboard = async (req, res) => {
  try {
    const { nFactura, nCot, from, to, clientSearch, pagado } = req.query;

    const saleWhere = {
      n_factura: { [Op.ne]: 0 }
    };

    if (nFactura) saleWhere.n_factura = nFactura;
    if (nCot) saleWhere.n_cot = nCot;
    if (from && to) {
      saleWhere.fecha = { [Op.between]: [from, to] };
    }
    if (pagado && pagado !== 'TODAS') {
      saleWhere.pagado = pagado;
    } else if (!pagado) {
      saleWhere.pagado = 'NO';
    }

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
      ]
    });

    // Process collections logic (Parity with f-cobros.php)
    const dashboard = clients.map(client => {
      let totalMonto = 0;
      let totalIva = 0;
      let totalTotal = 0;

      const items = client.ventas.map(sale => {
        const today = new Date();
        const dueDate = new Date(sale.fecha_pago);
        const diffTime = today - dueDate;
        const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        totalMonto += sale.monto || 0;
        totalIva += sale.iva || 0;
        totalTotal += sale.total || 0;

        return {
          ...sale.toJSON(),
          daysOverdue
        };
      });

      return {
        id: client.id_cliente,
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
