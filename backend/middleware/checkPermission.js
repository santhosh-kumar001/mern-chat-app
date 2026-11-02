const User = require('../models/User');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Find user and populate the 'permissions' array from the Role model
      const user = await User.findById(req.user.id).populate('role');

      if (user && user.role.permissions.includes(requiredPermission)) {
        return next(); // User has the power!
      }

      return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
    } catch (error) {
      res.status(500).json({ message: "Server Authorization Error" });
    }
  };
};

module.exports = checkPermission;