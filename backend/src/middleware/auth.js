const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    const userRoles = req.user.roleset || [];
    if (roles.some(r => userRoles.includes(r))) return next();
    res.status(403).json({ message: 'Forbidden' });
  };
}

module.exports = { authenticate, authorize };
