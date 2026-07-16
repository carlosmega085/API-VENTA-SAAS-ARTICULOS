const tenantMiddleware = (req, res, next) => {
  if (!req.user || !req.user.empresa_id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: No company associated'
    });
  }

  // Inject empresa_id into the request for global access in controllers/services
  req.empresa_id = req.user.empresa_id;
  next();
};

export { tenantMiddleware };
export default tenantMiddleware;
