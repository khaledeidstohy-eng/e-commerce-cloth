const express = require('express');
const router = express.Router();
const {createCategory, getAllCategories, updateCategory, deleteCategory} = require('../controllers/category.controller');
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middleware');

router.post('/', authenticate, authorize('admin'), createCategory);
router.get('/', getAllCategories);
router.put('/:id', authenticate, authorize('admin'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

module.exports = router;
