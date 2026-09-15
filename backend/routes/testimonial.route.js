const express = require('express');
const router = express.Router();
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middleware');
const {
    createTestimonial,
    getApprovedTestimonials,
    getPendingTestimonials,
    updateTestimonialStatus
} = require('../controllers/testimonial.controller');

router.post('/', authenticate, authorize('user'), createTestimonial);
router.get('/', getApprovedTestimonials);
router.get('/pending', authenticate, authorize('admin'), getPendingTestimonials);
router.patch('/:id/status', authenticate, authorize('admin'), updateTestimonialStatus);

module.exports = router;
