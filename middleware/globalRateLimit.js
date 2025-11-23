const rateLimit = require('express-rate-limit');

const keyGenerator = (req) => req.user ? `${req.user._id} + ${req.ip}` : req.ip;

const limiter = (limit, msg) => rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: limit || 15, 
  headers: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const { remaining, resetTime } = req.rateLimit;
    let message = `Too many requests for IP: ${req.ip}, Remaining: ${remaining}`;
    process.env.NODE_ENV == "production" ? message = `Too many requests! Try again later` : message

    res.status(429).json({
      message: msg || message ,
      remaining,
      resetTime: new Date(resetTime).toISOString(),
    });
  },
  keyGenerator,
  validate: true
});

module.exports = {limiter};