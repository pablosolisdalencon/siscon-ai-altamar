const { Sale, Client, SaleState, Agent } = require('../models/associations');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

exports.getSales = async (req, res) => {
  try {
    const { from, to, clientId, status, nFactura, nCot, pagado, clientSearch } = req.query;
    const where = {};

    if (from && to) {
      where.fecha = { [Op.between]: [from, to] };
    } else if (from) {
      where.fecha = { [Op.gte]: from };
    } else if (to) {
      where.fecha = { [Op.lte]: to };
    }

    if (clientId) where.id_cliente = clientId;
    if (status) where.estado = status;
    if (nFactura) where.n_factura = nFactura;
    if (nCot) where.n_cot = nCot;
    if (pagado && pagado !== 'TODAS') where.pagado = pagado;

    const sales = await Sale.findAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['razon', 'rut'],
          where: clientSearch ? { razon: { [Op.like]: `%${clientSearch}%` } } : undefined
        },
        { model: SaleState, as: 'status' },
        { model: Agent, as: 'agent' }
      ],
      order: [['id_venta', 'DESC']]
    });

    return successResponse(res, sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return errorResponse(res, 'Error fetching sales');
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: SaleState, as: 'status' }
      ]
    });
    if (!sale) return errorResponse(res, 'Sale not found', 404);
    return successResponse(res, sale);
  } catch (error) {
    return errorResponse(res, 'Error fetching sale');
  }
};

exports.createSale = async (req, res) => {
  try {
    const { monto, ...rest } = req.body;

    // Auto calculations (Parity with ventas.php)
    const neto = parseFloat(monto) || 0;
    const iva = neto * 0.19;
    const total = neto + iva;

    const sale = await Sale.create({
      ...rest,
      monto: neto,
      iva,
      total
    });

    return successResponse(res, sale, 'Sale created successfully', 211);
  } catch (error) {
    console.error('Error creating sale:', error);
    return errorResponse(res, 'Error creating sale');
  }
};

exports.updateSale = async (req, res) => {
  try {
    const { monto } = req.body;
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return errorResponse(res, 'Sale not found', 404);

    const updateData = { ...req.body };
    if (monto) {
      const neto = parseFloat(monto) || 0;
      updateData.iva = neto * 0.19;
      updateData.total = neto + updateData.iva;
    }

    await sale.update(updateData);
    return successResponse(res, sale, 'Sale updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating sale');
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return errorResponse(res, 'Sale not found', 404);
    await sale.destroy();
    return successResponse(res, null, 'Sale deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting sale');
  }
};

exports.getSalesStats = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Monthly Sales (Current month)
    const monthlySales = await Sale.sum('total', {
      where: {
        fecha: { [Op.gte]: firstDayOfMonth }
      }
    }) || 0;

    // Pending Collections (Pagado = 'NO' and n_factura != '0')
    const pendingCollections = await Sale.sum('total', {
      where: {
        pagado: 'NO',
        n_factura: { [Op.ne]: '0' }
      }
    }) || 0;

    // Active Clients (Unique clients in sales)
    const activeClientsCount = await Sale.count({
      distinct: true,
      col: 'id_cliente'
    });

    return successResponse(res, {
      monthlySales,
      pendingCollections,
      activeClients: activeClientsCount
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return errorResponse(res, 'Error fetching dashboard stats');
  }
};
