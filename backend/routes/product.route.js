const {
    getProductBySlug,
    getAllProducts,
    getAllProductsAdmin,
    createProduct,
    updateProduct,
    toggleActive,
    softDeleteProduct,
    restoreProduct,
    searchProducts,
    getTopSales,
    getNewArrivals
} = require('../controllers/product.controller');
const express = require('express');
const router = express.Router();
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middleware');
const {upload} = require('../middlewares/upload.middleware');

router.post('/', authenticate, authorize('admin'), upload.single('img'), createProduct);
router.get('/', getAllProducts);
router.get('/admin', authenticate, authorize('admin'), getAllProductsAdmin);
router.get('/search', searchProducts);
router.get('/top-sales', getTopSales);
router.get('/new-arrivals', getNewArrivals);
router.get('/:slug', getProductBySlug);
router.put('/:id', authenticate, authorize('admin'), upload.single('img'), updateProduct);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), toggleActive);
router.delete('/:id', authenticate, authorize('admin'), softDeleteProduct);
router.patch('/:id/restore', authenticate, authorize('admin'), restoreProduct);

module.exports = router;
