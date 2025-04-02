const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/profile', authenticate, authController.getUserProfile);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
