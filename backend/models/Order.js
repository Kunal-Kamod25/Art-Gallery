const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true },
    title: String,
    image: String,
    price: Number,
    artist: String
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String
  },
  paymentMethod: { type: String, required: true, enum: ['stripe', 'paypal', 'bank_transfer'] },
  paymentResult: {
    id: String, status: String,
    updateTime: String, emailAddress: String
  },
  taxPrice: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  trackingNumber: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
