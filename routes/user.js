const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { verify, verifyAdmin } = require('../auth');

// Registration route
router.post('/register', userController.registerUser);

// Login route
router.post('/login', userController.loginUser);

// Retrieve User Details
router.get('/details', verify, userController.getUserDetails);

// Update User as Admin
router.patch('/:id/set-as-admin', verify, verifyAdmin, userController.setAsAdmin);

// Update Password
router.patch('/update-password', verify, userController.updatePassword);

// Route for updating user profile
router.post('/update', verify, userController.updateProfile);

module.exports = router;
