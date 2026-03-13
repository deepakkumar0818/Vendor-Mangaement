const vendorOnly = (req, res, next) => {
    if (req.user && req.user.userRole === 'vendor') return next();
    return res.status(403).json({ message: 'Access denied — vendors only.' });
};

const clientOnly = (req, res, next) => {
    if (req.user && req.user.userRole === 'client') return next();
    return res.status(403).json({ message: 'Access denied — clients only.' });
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.userRole === 'admin') return next();
    return res.status(403).json({ message: 'Access denied — admins only.' });
};

module.exports = { vendorOnly, clientOnly, adminOnly };
