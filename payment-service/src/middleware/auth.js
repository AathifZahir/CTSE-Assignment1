// Verify service-to-service communication
exports.verifyServiceToken = (req, res, next) => {
  try {
    const serviceToken = req.headers['x-service-token'];

    if (!serviceToken || serviceToken !== process.env.SERVICE_TOKEN) {
      return res.status(403).json({ message: 'Unauthorized service access' });
    }

    next();
  } catch (error) {
    res.status(403).json({ message: 'Service authentication failed' });
  }
};
