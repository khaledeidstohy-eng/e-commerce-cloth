const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {error:'too many login attempts, please try again after 15 minutes'},
    standardHeaders: true,
    legacyHeaders: false
});
