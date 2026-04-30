const { Purchase, Client, Provider } = require('../models/associations');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

exports.getPurchases = async (req, res) => {
  try {
    const { from, to, clientId, nOc, pagado, providerSearch, page = 1, limit = 10 } = req.query;
    const where = {};
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (from && to) {
      where.fecha = { [Op.between]: [from, to] };
    } else if (from) {
      where.fecha = { [Op.gte]: from };
    } else if (to) {
      where.fecha = { [Op.lte]: to };
    }

    if (clientId) where.id_cliente = clientId;
    if (nOc) where.n_oc = nOc;
    if (pagado && pagado !== 'TODAS') where.pagado = pagado;

    const { count, rows: purchases } = await Purchase.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['razon', 'rut']
        }
      ],
      order: [['id_compra', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    return successResponse(res, {
      data: purchases,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return errorResponse(res, 'Error fetching purchases');
  }
};

exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [{ model: Client, as: 'client' }]
    });
    if (!purchase) return errorResponse(res, 'Purchase not found', 404);
    return successResponse(res, purchase);
  } catch (error) {
    return errorResponse(res, 'Error fetching purchase');
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const { monto, ...rest } = req.body;
    const neto = parseFloat(monto) || 0;
    const iva = neto * 0.19;
    const total = neto + iva;

    const purchase = await Purchase.create({
      ...rest,
      monto: neto,
      iva,
      total
    });

    return successResponse(res, purchase, 'Purchase created successfully', 201);
  } catch (error) {
    console.error('Error creating purchase:', error);
    return errorResponse(res, 'Error creating purchase');
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    const { monto } = req.body;
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) return errorResponse(res, 'Purchase not found', 404);

    const updateData = { ...req.body };
    if (monto) {
      const neto = parseFloat(monto) || 0;
      updateData.iva = neto * 0.19;
      updateData.total = neto + updateData.iva;
    }

    await purchase.update(updateData);
    return successResponse(res, purchase, 'Purchase updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating purchase');
  }
};

exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) return errorResponse(res, 'Purchase not found', 404);
    await purchase.destroy();
    return successResponse(res, null, 'Purchase deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting purchase');
  }
};
