const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getMyProfile,
    addAddress,
    updateAddress,
    removeAddress,
    toggleBlock,
    getMyOrderHistory
} = require('../controllers/user.controller');
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middleware');

router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/me', authenticate, getMyProfile);
router.get('/me/orders', authenticate, getMyOrderHistory);

router.post('/addresses', authenticate, addAddress);
router.put('/addresses/:addressId', authenticate, updateAddress);
router.delete('/addresses/:addressId', authenticate, removeAddress);

router.patch('/:id/toggle-block', authenticate, authorize('admin'), toggleBlock);

module.exports = router;
