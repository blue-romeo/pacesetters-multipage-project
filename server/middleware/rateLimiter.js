const rateLimit = require('express-rate-limit');


const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, 
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, 
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});


const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: 'Too many form submissions, please try again later.'
  },
  skipSuccessfulRequests: true, 
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
});

module.exports = {
  apiLimiter,
  formLimiter,
  authLimiter
};
