const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('Authorization');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // The token format is "Bearer <token>", so we split and take the second part
    const tokenValue = token.split(' ')[1];
    if (!tokenValue) {
        return res.status(401).json({ msg: 'Token format is invalid' });
    }
    
    // Verify token
    try {
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        req.user = decoded.user; // Attach user payload to the request object
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};