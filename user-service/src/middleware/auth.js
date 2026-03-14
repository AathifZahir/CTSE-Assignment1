const jwt = require('jsonwebtoken');

// Verify JWT token
exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

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
