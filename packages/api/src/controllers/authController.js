const jwt = require('jsonwebtoken');
const { User } = require('../models/associations');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';
const CAPTCHA_SECRET = process.env.JWT_SECRET || 'captcha-secret-key';

exports.getCaptcha = (req, res) => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const answer = num1 + num2;

  // Create a token valid for 5 minutes
  const captchaToken = jwt.sign({ answer }, CAPTCHA_SECRET, { expiresIn: '5m' });

  res.json({
    success: true,
    data: {
      question: `¿Cuánto es ${num1} + ${num2}?`,
      token: captchaToken
    }
  });
};

exports.login = async (req, res) => {
  try {
    const { username, password, captchaAnswer, captchaToken } = req.body;

    // 1. Verify Captcha
    if (!captchaToken || !captchaAnswer) {
      return res.status(400).json({ success: false, message: 'Captcha requerido' });
    }

    try {
      const decoded = jwt.verify(captchaToken, CAPTCHA_SECRET);
      if (parseInt(captchaAnswer) !== decoded.answer) {
        return res.status(400).json({ success: false, message: 'Captcha incorrecto' });
      }
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Captcha expirado o inválido' });
    }

    // 2. Verify Credentials
    let role = null;
    let id_agente = null; // To link with Agent if needed

    if (username === 'admin' && password === 'TiburonBlanco.,2026') {
      role = 'admin';
    } else if (username === 'agente' && password === 'CometaHalley.,2026') {
      role = 'agente';
      id_agente = 1; // Fallback or search in DB. Let's assume agent 1 for now or search by username if we can.
    } else {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    // 3. Generate Auth Token
    const token = jwt.sign({ username, role, id_agente }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      data: {
        token,
        user: {
          username,
          role,
          id_agente
        }
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};
