const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    removeFromCart,
    acceptNewPrice,
    mergeGuestCart
} = require('../controllers/cart.controller');
const {authenticate} = require('../middlewares/auth.middleware');

// optional auth: if a token is present, attach req.user; otherwise continue as guest
const optionalAuth = async (req,res,next) => {
    if(req.headers.authorization){
        return authenticate(req,res,next);
    }
    next();
};

router.get('/', optionalAuth, getCart);
router.post('/', optionalAuth, addToCart);
router.delete('/:itemId', optionalAuth, removeFromCart);
router.patch('/:itemId/accept-price', optionalAuth, acceptNewPrice);
router.post('/merge', authenticate, mergeGuestCart);

module.exports = router;
