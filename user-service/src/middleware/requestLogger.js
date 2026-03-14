// Request logging middleware
exports.requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const serviceToken = req.headers['x-service-token'];
  const isServiceCall = !!serviceToken;
  
  if (isServiceCall) {
    console.log(`[USER-SERVICE] Incoming service call: ${req.method} ${req.path}`);
    console.log(`[USER-SERVICE] From: ${req.headers['x-forwarded-for'] || req.ip || 'unknown'}`);
    console.log(`[USER-SERVICE] Service Token: ${serviceToken ? 'Present' : 'Missing'}`);
  } else {
    console.log(`[USER-SERVICE] Incoming client request: ${req.method} ${req.path}`);
  }
  
  next();
};
