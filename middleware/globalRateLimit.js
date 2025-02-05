const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

const keyGenerator = (req) => req.user ? `${req.user._id} + ${req.ip}` : req.ip;

const limiter = (maxRequests) => rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  headers: true,
  standardHeaders: true,
  legacyHeaders: true,
  handler: (req, res) => {
    const { limit, remaining, resetTime } = req.rateLimit;

    const message = `Too many requests for IP: ${req.ip}, Remaining: ${remaining}`;
    res.status(429).json({
      message,
      remaining,
      resetTime: new Date(resetTime).toISOString(),
    });
  },
  keyGenerator,
  validate: true
});

const roleBasedLimit = (req, res, next) => {
  console.log('inside roleBasedLimit')
  // if (!req.user) {
  //   return next(new AppError('User is not logged in', 401)); // Ensure proper error handling
  // }
  
  // const role = req.user.role;
  // let rateLimiter;

  // if (role === 'admin' || role === 'lead-guide') {
  //   rateLimiter = limiter(200); // Higher limit for admins and lead guides
  // } else {
  //   rateLimiter = limiter(20); // Standard limit for other users
  // }

  // return rateLimiter(req, res, next); // Apply the rate limiter
};

module.exports = {limiter, roleBasedLimit};