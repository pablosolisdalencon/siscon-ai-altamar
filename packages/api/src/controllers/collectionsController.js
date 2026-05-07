const { Sale, Client, Company, SaleState, Agent } = require('../models/associations');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

exports.getCollectionsDashboard = async (req, res) => {
  try {
    const { nFactura, nCot, nOc, from, to, clientSearch, pagado, estado, idAgente, item, detalle, sortBy = 'razon', sortOrder = 'ASC', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Base filter: Parity with Ventas
    const saleWhere = {
      fecha: { [Op.gt]: '1000-01-01' }
    };

    if (nFactura) saleWhere.n_factura = nFactura;
    if (nCot) saleWhere.n_cot = nCot;
    if (nOc) saleWhere.n_oc = nOc;
    if (estado) saleWhere.estado = estado;
    if (idAgente) saleWhere.id_agente = idAgente;
    if (pagado && pagado !== 'TODAS') saleWhere.pagado = pagado;

    if (item) saleWhere.item = { [Op.like]: `%${item}%` };
    if (detalle) saleWhere.detalle = { [Op.like]: `%${detalle}%` };

    if (from && to) {
      saleWhere.fecha = { [Op.between]: [from, to] };
    } else if (from) {
      saleWhere.fecha = { [Op.gte]: from };
    } else if (to) {
      saleWhere.fecha = { [Op.lte]: to };
    }

    // Sort mapping for Clients
    const direction = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    let clientOrder = [['razon', direction]];
    if (sortBy === 'rut') clientOrder = [['rut', direction]];
    if (sortBy === 'mail') clientOrder = [['pago_mail', direction]];

    const clientWhere = {};
    if (clientSearch) {
      clientWhere[Op.or] = [
        { razon: { [Op.like]: `%${clientSearch}%` } },
        { rut: { [Op.like]: `%${clientSearch}%` } }
      ];
    }

    const { count: salesCount, rows: sales } = await Sale.findAndCountAll({
      attributes: {
        include: [
          [
            sequelize.literal("CASE WHEN fecha_entrega > '1000-01-01' THEN TO_DAYS(fecha_entrega) - TO_DAYS(CURDATE()) ELSE NULL END"),
            'dias'
          ],
          [
            sequelize.literal("CASE WHEN fecha_pago > '1000-01-01' THEN TO_DAYS(CURDATE()) - TO_DAYS(fecha_pago) ELSE NULL END"),
            'dias_pago'
          ]
        ]
      },
      where: saleWhere,
      include: [
        { 
          model: Client, 
          as: 'client', 
          where: clientWhere,
          required: clientSearch ? true : false // If searching client, must have one. Otherwise, LEFT JOIN.
        },
        { model: SaleState, as: 'status', constraints: false }
      ],
      order: [['id_venta', 'DESC']]
    });

    // Manual Grouping by Client in JS
    const groups = {};
    sales.forEach(sale => {
      const clientId = sale.id_cliente || 0;
      if (!groups[clientId]) {
        groups[clientId] = {
          id_cliente: clientId,
          razon: sale.client?.razon || "Cliente Generico",
          rut: sale.client?.rut || "---",
          mail: sale.client?.pago_mail || "",
          mensaje: sale.client?.mensaje_cobro || "",
          stats: { pendingItems: 0, totalMonto: 0, totalIva: 0, totalTotal: 0 },
          items: []
        };
      }
      
      const g = groups[clientId];
      g.stats.pendingItems++;
      g.stats.totalMonto += sale.monto || 0;
      g.stats.totalIva += sale.iva || 0;
      g.stats.totalTotal += sale.total || 0;
      
      g.items.push({
        ...sale.toJSON(),
        dias: sale.getDataValue('dias'),
        dias_pago: sale.getDataValue('dias_pago'),
        daysOverdue: sale.getDataValue('dias_pago')
      });
    });

    const allGroups = Object.values(groups);
    
    // Sort groups
    allGroups.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (sortBy === 'razon') {
        valA = a.razon;
        valB = b.razon;
      }
      if (direction === 'ASC') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    // Pagination
    const paginatedGroups = allGroups.slice(offset, offset + parseInt(limit));

    return successResponse(res, {
      data: paginatedGroups,
      total: allGroups.length,
      page: parseInt(page),
      totalPages: Math.ceil(allGroups.length / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return errorResponse(res, 'Error fetching collections dashboard');
  }
};

const { sendEmail } = require('../utils/mailSender');
const { generateCollectionEmail } = require('../utils/mailTemplate');

exports.sendCollectionEmail = async (req, res) => {
  try {
    const { clientId } = req.body;

    // 1. Get Client and Sales data
    const client = await Client.findByPk(clientId, {
      include: [
        {
          model: Sale,
          as: 'ventas',
          where: { pagado: 'NO', n_factura: { [Op.ne]: '0' } },
          required: true,
          include: [{ model: SaleState, as: 'status' }]
        }
      ]
    });

    if (!client) {
      return errorResponse(res, 'No se encontraron cobros pendientes para este cliente', 404);
    }

    // 2. Get Company info for the signature (Parity with f-cobros: $e = mysql_fetch_array(mysql_query("SELECT * FROM empresa WHERE id_empresa=1")))
    const company = await Company.findOne({ where: { id_empresa: 1 } });
    if (!company) {
      console.warn('Company info not found, using defaults for email');
    }

    // 3. Process items and days overdue (Same logic as dashboard)
    const today = new Date();
    const items = client.ventas.map(sale => {
      let daysOverdue = 0;
      if (sale.fecha_pago && sale.fecha_pago !== '0000-00-00') {
        const dueDate = new Date(sale.fecha_pago);
        if (!isNaN(dueDate.getTime())) {
          const diffTime = today - dueDate;
          daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        }
      }
      return { ...sale.toJSON(), daysOverdue };
    });

    // 4. Generate HTML
    const html = generateCollectionEmail({
      clientName: client.razon,
      clientRut: client.rut,
      message: client.mensaje_cobro,
      items,
      companyName: company?.razon || 'Altamar MKT',
      companyEmail: company?.pago_mail || 'czuniga@altamarmkt.cl',
      companySignatureUrl: company?.pago_firma ? `${req.protocol}://${req.get('host')}/img/${company.pago_firma}` : null
    });

    // 5. Send Email
    await sendEmail({
      to: client.pago_mail,
      subject: `Pagos Pendientes - ${company?.razon || 'Altamar MKT'}`,
      html,
      fromName: company?.razon,
      fromEmail: company?.pago_mail
    });

    return successResponse(res, { clientId, email: client.pago_mail }, 'Cobro enviado con éxito');
  } catch (error) {
    console.error('Error in sendCollectionEmail:', error);
    return errorResponse(res, 'Error al procesar el envío de cobranza: ' + error.message);
  }
};
