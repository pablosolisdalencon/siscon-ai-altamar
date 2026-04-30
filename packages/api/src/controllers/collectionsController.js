const { Sale, Client, Company, SaleState } = require('../models/associations');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

exports.getCollectionsDashboard = async (req, res) => {
  try {
    const { nFactura, nCot, from, to, clientSearch, pagado, estado, sort, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Legacy f-cobros.php base filter: WHERE n_factura!='0'
    const saleWhere = {
      [Op.and]: [
        { n_factura: { [Op.ne]: '0' } }
      ]
    };

    if (nFactura) saleWhere[Op.and].push({ n_factura: nFactura });
    if (nCot) saleWhere[Op.and].push({ n_cot: nCot });
    if (estado) saleWhere[Op.and].push({ estado: estado });

    // Dates – Full parity with legacy f-cobros.php switch(true) logic:
    if (from && to) {
      saleWhere.fecha = { [Op.between]: [from, to] };
    } else if (from) {
      saleWhere.fecha = from;
    } else if (to) {
      saleWhere.fecha = to;
    } else {
      saleWhere[Op.and].push({ fecha: { [Op.ne]: '' } });
    }

    if (pagado && pagado !== 'TODAS') {
      saleWhere.pagado = pagado;
    } else if (!pagado) {
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

    const { count, rows: clients } = await Client.findAndCountAll({
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
      ],
      limit: parseInt(limit),
      offset: offset,
      distinct: true // Required for correct count with includes
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

    return successResponse(res, {
      data: dashboard,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
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
