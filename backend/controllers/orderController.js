const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const Review = require('../models/Review');
const asyncHandler = require('express-async-handler');

exports.createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice, isPaid, paidAt } = req.body;
  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items' });
  }
  // Mark artworks as unavailable
  for (const item of orderItems) {
    await Artwork.findByIdAndUpdate(item.artwork, { isAvailable: false });
  }
  const order = await Order.create({
    user: req.user._id, orderItems, shippingAddress,
    paymentMethod, taxPrice, shippingPrice, totalPrice, isPaid, paidAt
  });
  res.status(201).json({ success: true, order });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('orderItems.artwork', 'title images')
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.artwork', 'title images artist')
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, order });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (orderStatus === 'delivered') { order.isDelivered = true; order.deliveredAt = Date.now(); }
  await order.save();
  res.json({ success: true, order });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);
  const recentOrders = await Order.find({}).populate('user', 'name').sort({ createdAt: -1 }).limit(5);
  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      recentOrders
    }
  });
});

exports.getArtistStats = asyncHandler(async (req, res) => {
  const { ObjectId } = require('mongoose').Types;
  const artistId = new ObjectId(req.user.artist); // Convert to ObjectId
  if (!artistId) return res.status(400).json({ success: false, message: 'Artist profile not found' });

  const totalArtworks = await Artwork.countDocuments({ artist: artistId });
  const soldArtworks = await Artwork.countDocuments({ artist: artistId, isAvailable: false });
  
  const totalRevenue = await Order.aggregate([
    { $unwind: '$orderItems' },
    { $lookup: { from: 'artworks', localField: 'orderItems.artwork', foreignField: '_id', as: 'artwork' } },
    { $unwind: '$artwork' },
    { $match: { 'artwork.artist': artistId, isPaid: true } },
    { $group: { _id: null, total: { $sum: '$orderItems.price' } } }
  ]);

  const recentSales = await Order.aggregate([
    { $unwind: '$orderItems' },
    { $lookup: { from: 'artworks', localField: 'orderItems.artwork', foreignField: '_id', as: 'artwork' } },
    { $unwind: '$artwork' },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userData' } },
    { $unwind: '$userData' },
    { $match: { 'artwork.artist': artistId, isPaid: true } },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    { $project: {
      _id: 1,
      user: { name: '$userData.name', email: '$userData.email' },
      orderItems: 1,
      totalPrice: 1,
      createdAt: 1,
      orderStatus: 1
    }}
  ]);

  res.json({
    success: true,
    stats: {
      totalArtworks,
      soldArtworks,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentSales
    }
  });
});
