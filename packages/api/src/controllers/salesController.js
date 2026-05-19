const { Sale, Client, SaleState, User, SaleRecord } = require('../models/associations');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const cleanSaleData = (data) => {
  const cleanInt = (val) => (val === '' || val === undefined) ? null : parseInt(val);
  const cleanFloat = (val) => (val === '' || val === undefined) ? null : parseFloat(val);
  const cleanDate = (val) => (val === '' || val === undefined) ? null : val;
  const result = { ...data };
  
  if ('id_agente' in result) result.id_agente = cleanInt(result.id_agente);
  result.id_cliente = ('id_cliente' in result) ? (cleanInt(result.id_cliente) || 0) : 0;

  if ('n_factura' in result) result.n_factura = cleanInt(result.n_factura) || 0;
  if ('n_cot' in result) result.n_cot = cleanInt(result.n_cot) || 0;
  if ('n_oc' in result) result.n_oc = cleanInt(result.n_oc) || 0;
  if ('estado' in result) result.estado = cleanInt(result.estado) || 1;
  if ('comicion' in result) result.comicion = cleanFloat(result.comicion) || 0;
  
  if ('monto' in result) result.monto = cleanFloat(result.monto) || 0;
  if ('iva' in result) result.iva = cleanFloat(result.iva) || 0;
  if ('total' in result) result.total = cleanFloat(result.total) || 0;

  if ('fecha_entrega' in result) result.fecha_entrega = cleanDate(result.fecha_entrega);
  if ('fecha_pago' in result) result.fecha_pago = cleanDate(result.fecha_pago);
  if ('fecha' in result) result.fecha = cleanDate(result.fecha);

  return result;
};

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
        { model: User, as: 'agent' }
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
    const { monto, iva, total, ...rest } = req.body;

    const neto = parseFloat(monto) || 0;
    const computedIva = iva !== undefined ? parseFloat(iva) : neto * 0.19;
    const computedTotal = total !== undefined ? parseFloat(total) : neto + computedIva;

    const dataToSave = cleanSaleData(rest);

    const sale = await Sale.create({
      ...dataToSave,
      monto: neto,
      iva: computedIva,
      total: computedTotal
    });

    return successResponse(res, sale, 'Sale created successfully', 211);
  } catch (error) {
    console.error('Error creating sale:', error);
    return errorResponse(res, 'Error creating sale: ' + error.message);
  }
};

exports.updateSale = async (req, res) => {
  try {
    const { monto, iva, total } = req.body;
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return errorResponse(res, 'Sale not found', 404);

    const updateData = cleanSaleData(req.body);
    
    if (monto !== undefined) updateData.monto = parseFloat(monto) || 0;
    if (iva !== undefined) updateData.iva = parseFloat(iva) || 0;
    if (total !== undefined) updateData.total = parseFloat(total) || 0;

    await sale.update(updateData);
    return successResponse(res, sale, 'Sale updated successfully');
  } catch (error) {
    console.error('Error updating sale:', error);
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

exports.exportSalesExcel = async (req, res) => {
  try {
    const { from, to, clientId, status, nFactura, nCot, pagado, clientSearch } = req.query;
    
    const where = {
      fecha: { [Op.gt]: '1000-01-01' }
    };
    
    if (from && to) where.fecha = { [Op.between]: [from, to] };
    else if (from) where.fecha = { [Op.gte]: from };
    else if (to) where.fecha = { [Op.lte]: to };

    if (clientId) where.id_cliente = clientId;
    if (status) where.estado = status;
    if (nFactura) where.n_factura = nFactura;
    if (nCot) where.n_cot = nCot;
    if (pagado && pagado !== 'TODAS') where.pagado = pagado;

    const include = [
        { model: SaleState, as: 'status' },
        { model: User, as: 'agent' }
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

    const sales = await Sale.findAll({
      where,
      include,
      order: [['id_venta', 'DESC']]
    });

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ventas');

    worksheet.columns = [
      { header: 'ID', key: 'id_venta', width: 10 },
      { header: 'FECHA', key: 'fecha', width: 15 },
      { header: 'CLIENTE', key: 'cliente', width: 40 },
      { header: 'RUT', key: 'rut', width: 15 },
      { header: 'FACTURA', key: 'n_factura', width: 12 },
      { header: 'COTIZACION', key: 'n_cot', width: 12 },
      { header: 'DETALLE', key: 'detalle', width: 50 },
      { header: 'MONTO', key: 'monto', width: 15 },
      { header: 'IVA', key: 'iva', width: 15 },
      { header: 'TOTAL', key: 'total', width: 15 },
      { header: 'ESTADO', key: 'estado', width: 15 },
      { header: 'PAGADO', key: 'pagado', width: 10 }
    ];

    // Header Styling
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };

    sales.forEach(sale => {
      worksheet.addRow({
        id_venta: sale.id_venta,
        fecha: sale.fecha,
        cliente: sale.client?.razon,
        rut: sale.client?.rut,
        n_factura: sale.n_factura,
        n_cot: sale.n_cot,
        detalle: sale.detalle,
        monto: sale.monto,
        iva: sale.iva,
        total: sale.total,
        estado: sale.status?.estado,
        pagado: sale.pagado
      });
    });

    // Formatting
    worksheet.getColumn('monto').numFmt = '"$"#,##0';
    worksheet.getColumn('iva').numFmt = '"$"#,##0';
    worksheet.getColumn('total').numFmt = '"$"#,##0';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=ventas_export.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).send('Error generating Excel');
  }
};
