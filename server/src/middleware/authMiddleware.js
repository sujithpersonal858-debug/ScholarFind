const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'scholarfind_super_secret_jwt_key_2026';

/**
 * Protect middleware: Verifies JWT token and attaches user payload to req.user
 */
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.'
    });
  }
};

/**
 * Require Admin role middleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privileges are required.'
    });
  }
  next();
};

/**
 * Require Student role middleware
 */
const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student privileges are required.'
    });
  }
  next();
};

module.exports = {
  protect,
  requireAdmin,
  requireStudent,
  JWT_SECRET
};
