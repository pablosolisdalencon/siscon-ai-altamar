const { Company } = require('../models/associations');
const path = require('path');
const fs = require('fs');

const getCompany = async (req, res) => {
  try {
    const company = await Company.findOne();
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const company = await Company.findOne();
    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    const updateData = { ...req.body };

    // Handle file upload if present
    if (req.file) {
      updateData.pago_firma = req.file.filename;
    }

    await company.update(updateData);
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCompany,
  updateCompany
};
