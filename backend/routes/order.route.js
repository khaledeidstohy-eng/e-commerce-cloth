const express = require('express');
const router = express.Router();
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middleware');
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    requestRefund,
    getSalesReport,
    getTopProductsReport
} = require('../controllers/order.controller');

router.post('/', authenticate, authorize('user'), createOrder);
router.get('/', authenticate, authorize('admin'), getAllOrders);
router.get('/my-orders', authenticate, authorize('user'), getMyOrders);
router.patch('/:id/status', authenticate, authorize('admin'), updateOrderStatus);
router.patch('/:id/refund', authenticate, authorize('user'), requestRefund);

router.get('/report/sales', authenticate, authorize('admin'), getSalesReport);
router.get('/report/top-products', authenticate, authorize('admin'), getTopProductsReport);

module.exports = router;
