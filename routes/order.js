const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const { verify, verifyAdmin } = require('../auth');

// Create Order (Authenticated User)
router.post('/checkout', verify, orderController.createOrder);

// Retrieve logged in user's orders (Authenticated User)
router.get('/my-orders', verify, orderController.getMyOrders);

// Retrieve all users' orders (Admin Only)
router.get('/all-orders', verify, verifyAdmin, orderController.getAllOrders);

module.exports = router;
