const checkRole = (...roles) => {
  return (req, res, next) => {
    // req.user est rempli par verifyToken
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé : rôle insuffisant" });
    }
    next();
  };
};

module.exports = checkRole;