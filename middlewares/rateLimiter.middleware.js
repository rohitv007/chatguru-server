const rateLimit = require("express-rate-limit");

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator combining IP and email
  keyGenerator: (req) => {
    const email = req.body.email?.toLowerCase() || "anonymous";
    return `${req.ip}-${email}`;
  },
});

module.exports = forgotPasswordLimiter;
