const { Sale, Client, SaleState, Agent, SaleRecord } = require('../models/associations');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

exports.getSales = async (req, res) => {
  try {
    const { from, to, clientId, status, nFactura, nCot, pagado, clientSearch, page = 1, limit: queryLimit, sortBy = 'id_venta', sortOrder = 'DESC' } = req.query;
    
    // Fetch default limit from SaleRecord if not provided in query
    let limit = parseInt(queryLimit);
    if (!limit || isNaN(limit)) {
      try {
        const config = await SaleRecord.findOne();
        limit = config ? parseInt(config.cantidad) : 50;
      } catch (e) {
        console.error('Error fetching SaleRecord:', e.message);
        limit = 50;
      }
    }
    if (isNaN(limit)) limit = 50;

    const where = {
      fecha: { [Op.gt]: '1000-01-01' }
    };
    
    const pageNum = parseInt(page) || 1;
    const offset = (pageNum - 1) * limit;

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

    console.log('Final Where:', JSON.stringify(where));
    console.log('Limit:', limit, 'Offset:', offset, 'Sort:', sortBy, sortOrder);

    const include = [
        { model: SaleState, as: 'status' },
        { model: Agent, as: 'agent' }
    ];

    const clientInclude = {
        model: Client,
        as: 'client',
        attributes: ['razon', 'rut']
    };
    if (clientSearch) {
        clientInclude.where = { razon: { [Op.like]: `%${clientSearch}%` } };
    }
    include.push(clientInclude);

    // Sorting Logic
    let order = [['id_venta', 'DESC']];
    if (sortBy) {
      const direction = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      switch (sortBy) {
        case 'cliente':
          order = [[{ model: Client, as: 'client' }, 'razon', direction]];
          break;
        case 'rut':
          order = [[{ model: Client, as: 'client' }, 'rut', direction]];
          break;
        case 'estado':
          order = [[{ model: SaleState, as: 'status' }, 'estado', direction]];
          break;
        case 'dias':
        case 'dias_pago':
          order = [[sequelize.literal(sortBy), direction]];
          break;
        default:
          // Whitelist of columns in main model
          const validColumns = ['id_venta', 'fecha', 'n_cot', 'n_oc', 'n_factura', 'item', 'detalle', 'monto', 'iva', 'total', 'fecha_entrega', 'fecha_pago', 'pagado'];
          if (validColumns.includes(sortBy)) {
            order = [[sortBy, direction]];
          }
      }
    }

    const { count, rows: sales } = await Sale.findAndCountAll({
      attributes: {
        include: [
          [sequelize.literal("CASE WHEN fecha_entrega > '1000-01-01' THEN TO_DAYS(fecha_entrega) - TO_DAYS(CURDATE()) ELSE NULL END"), 'dias'],
          [sequelize.literal("CASE WHEN fecha_pago > '1000-01-01' THEN TO_DAYS(CURDATE()) - TO_DAYS(fecha_pago) ELSE NULL END"), 'dias_pago']
        ]
      },
      where,
      include,
      order,
      limit: limit,
      offset: offset
    });

    console.log('Query completed. Count:', count);

    return successResponse(res, {
      data: sales,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('CRITICAL ERROR in getSales:', error);
    return errorResponse(res, 'Error fetching sales: ' + error.message);
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

    let monthlySales = await Sale.sum('total', {
      where: {
        fecha: { [Op.gte]: firstDayOfMonth }
      }
    }) || 0;

    let monthlyLabel = today.toLocaleString('es-CL', { month: 'long', year: 'numeric' });

    // Fallback logic for "Full Epico": if current month is empty, show latest month with activity
    if (monthlySales === 0) {
      const lastSale = await Sale.findOne({ order: [['fecha', 'DESC']] });
      if (lastSale) {
        const lastDate = new Date(lastSale.fecha);
        const startOfLastMonth = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
        const endOfLastMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0);

        monthlySales = await Sale.sum('total', {
          where: {
            fecha: { [Op.between]: [startOfLastMonth, endOfLastMonth] }
          }
        }) || 0;
        monthlyLabel = lastDate.toLocaleString('es-CL', { month: 'long', year: 'numeric' }) + ' (Última)';
      }
    }

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
      monthlyLabel,
      pendingCollections,
      activeClients: activeClientsCount
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return errorResponse(res, 'Error fetching dashboard stats');
  }
};
