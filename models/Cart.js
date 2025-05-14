const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the CartItem schema with an _id field
const cartItemSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

// Define the Cart schema
const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cartItems: [cartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  orderedOn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', cartSchema);