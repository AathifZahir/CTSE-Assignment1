// Request logging middleware
exports.requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const serviceToken = req.headers['x-service-token'];
  const isServiceCall = !!serviceToken;
  
  if (isServiceCall) {
    console.log(`[PAYMENT-SERVICE] Incoming service call: ${req.method} ${req.path}`);
    console.log(`[PAYMENT-SERVICE] From: ${req.headers['x-forwarded-for'] || req.ip || 'unknown'}`);
    console.log(`[PAYMENT-SERVICE] Service Token: ${serviceToken ? 'Present' : 'Missing'}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`[PAYMENT-SERVICE] Request Body:`, JSON.stringify(req.body));
    }
  } else {
    console.log(`[PAYMENT-SERVICE] Incoming client request: ${req.method} ${req.path}`);
  }
  
  next();
};
