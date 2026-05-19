const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'c9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4';

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn(`[SISCON AUTH] No token provided in headers for path: ${req.originalUrl}`);
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.warn(`[SISCON AUTH] Verification failed on path "${req.originalUrl}". Token prefix: "${token.substring(0, 15)}...". Error: "${err.message}". Used secret prefix: "${JWT_SECRET.substring(0, 5)}..."`);
      return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

exports.authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.warn(`[SISCON AUTH] authorizeRole failed on path "${req.originalUrl}": No user on request.`);
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (!roles.includes(req.user.role)) {
      console.warn(`[SISCON AUTH] authorizeRole failed on path "${req.originalUrl}": User "${req.user.username}" with role "${req.user.role}" is NOT allowed for roles ${JSON.stringify(roles)}`);
      return res.status(403).json({ success: false, message: 'No autorizado para este rol' });
    }
    next();
  };
};
