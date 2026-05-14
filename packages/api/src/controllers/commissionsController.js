const { Sale, Client, User } = require('../models/associations');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/mailSender');

exports.getCommissions = async (req, res) => {
  try {
    const { from, to, clientSearch, nFactura, idAgente } = req.query;
    const { role, id_agente: tokenAgentId } = req.user;

    const where = {};

    // 1. Role based restriction
    if (role === 'agente') {
      where.id_agente = tokenAgentId;
    } else if (role === 'admin' && idAgente) {
      where.id_agente = idAgente;
    }

    // 2. Filters
    if (nFactura) {
      where.n_factura = nFactura;
    }

    if (from && to) {
      where.fecha = { [Op.between]: [from, to] };
    } else if (from) {
      where.fecha = { [Op.gte]: from };
    } else if (to) {
      where.fecha = { [Op.lte]: to };
    }

    const clientWhere = {};
    if (clientSearch) {
      clientWhere[Op.or] = [
        { razon: { [Op.like]: `%${clientSearch}%` } },
        { rut: { [Op.like]: `%${clientSearch}%` } }
      ];
    }

    const sales = await Sale.findAll({
      where,
      include: [
        { 
          model: Client, 
          as: 'client',
          where: clientSearch ? clientWhere : undefined,
          required: clientSearch ? true : false
        },
        { model: User, as: 'agent' }
      ],
      order: [['fecha', 'DESC']]
    });

    // Calculate totals
    const totalCommissions = sales.reduce((acc, sale) => acc + (sale.comicion || 0), 0);
    const totalSales = sales.reduce((acc, sale) => acc + (sale.total || 0), 0);

    res.json({
      success: true,
      data: {
        sales,
        summary: {
          totalSales,
          totalCommissions,
          count: sales.length
        }
      }
    });
  } catch (error) {
    console.error('Error in getCommissions:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

exports.sendReport = async (req, res) => {
  try {
    const { role, id_agente: tokenAgentId } = req.user;
    const { pdfData, agentId } = req.body; // pdfData as base64 or just trigger generation if possible.
    // Since we agreed on browser-side or simple HTML, let's assume we receive the HTML or data to generate it.
    // For simplicity and robustness, let's assume the frontend sends the data or we fetch it again.

    let targetEmail = '';
    let subject = 'Reporte de Comisiones';

    if (role === 'admin') {
      // Admin sends to Agent
      const targetAgentId = agentId || req.body.idAgente;
      if (!targetAgentId) {
        return res.status(400).json({ success: false, message: 'Se requiere id de agente' });
      }
      const agent = await User.findByPk(targetAgentId);
      if (!agent || !agent.mail) {
        return res.status(400).json({ success: false, message: 'Agente no encontrado o sin correo' });
      }
      targetEmail = agent.mail;
      subject = `[ADMIN] Reporte de Comisiones para ${agent.user}`;
    } else if (role === 'agente') {
      // Agent sends to Admin
      // Find an admin user or use a default
      const admin = await User.findOne({ where: { role: 'admin' } });
      targetEmail = admin ? admin.mail : 'admin@siscon-ai.com'; // Fallback
      subject = `[AGENTE] Reporte de Comisiones de Agente`;
    }

    // Prepare attachments if pdfData is provided
    const attachments = [];
    if (pdfData) {
      attachments.push({
        content: pdfData,
        filename: 'reporte_comisiones.pdf',
        type: 'application/pdf',
        disposition: 'attachment'
      });
    }

    // Send Email
    await sendEmail({
      to: targetEmail,
      subject,
      html: `<p>Hola,</p><p>Adjuntamos el reporte de comisiones solicitado.</p>`,
      attachments: attachments.length > 0 ? attachments : undefined
    });

    res.json({ success: true, message: 'Reporte enviado con éxito' });
  } catch (error) {
    console.error('Error in sendReport:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor: ' + error.message });
  }
};
