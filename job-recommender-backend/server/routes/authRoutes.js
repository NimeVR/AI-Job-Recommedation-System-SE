

const express = require('express');
const router = express.Router();
const { register, login, getUserProfile } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/profile/:username', getUserProfile); // Add this line

module.exports = router;