const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the ProductOrdered schema
const productOrderedSchema = new Schema({
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

// Define the Order schema
const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productsOrdered: [productOrderedSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  orderedOn: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Pending'
  }
});

// Create the Order model
module.exports = mongoose.model('Order', orderSchema);
