const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const { verify, verifyAdmin } = require('../auth');

// Create Product (Admin only)
router.post('/', verify, verifyAdmin, productController.createProduct);

// Retrieve all products (Admin only)
router.get('/all', verify, verifyAdmin, productController.getAllProducts);

// Retrieve all active products (All)
router.get('/active', productController.getActiveProducts);

// Retrieve single product (All)
router.get('/:productId', productController.getProductById);

// Update Product information (Admin only)
router.patch('/:productId/update', verify, verifyAdmin, productController.updateProduct);

// Archive Product (Admin only)
router.patch('/:productId/archive', verify, verifyAdmin, productController.archiveProduct);

// Activate Product (Admin only)
router.patch('/:productId/activate', verify, verifyAdmin, productController.activateProduct);

// Search Products by Name
router.post('/search-by-name', productController.searchProductsByName);

// Search Products by Price Range
router.post('/search-by-price', productController.searchByPriceRange);

module.exports = router;
