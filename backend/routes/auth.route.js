const {register, login} = require('../controllers/auth.controller');
const {loginLimiter} = require('../middlewares/rateLimiter.middleware');
const express = require('express');
const router = express.Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);

module.exports = router;
