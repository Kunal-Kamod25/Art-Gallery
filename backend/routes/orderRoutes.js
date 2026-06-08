const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, updateOrderStatus, getAllOrders, getDashboardStats, getArtistStats } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getOrders);
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.get('/admin/stats', protect, authorize('admin'), getDashboardStats);
router.get('/artist/stats', protect, authorize('artist'), getArtistStats);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
