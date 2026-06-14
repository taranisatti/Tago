const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tago_super_secret_session_key_987654321');
    
    // Attach user ID to the request object
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token validation failed, access denied' });
  }
};

module.exports = auth;
