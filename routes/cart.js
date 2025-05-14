const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const { verify } = require('../auth');

// Retrieve User's Cart
router.get('/get-cart', verify, cartController.getCart);

// Add to Cart
router.post('/add-to-cart', verify, cartController.addToCart);

// Update Product Quantity in Cart
router.patch('/update-cart-quantity', verify, cartController.updateCartQuantity);

// Remove Item from Cart
router.patch('/:productId/remove-from-cart', verify, cartController.removeFromCart);

// Clear Cart
router.put('/clear-cart', verify, cartController.clearCart);

module.exports = router;
