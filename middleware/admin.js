const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin privileges required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying admin privileges', error: error.message });
  }
};

module.exports = admin;
