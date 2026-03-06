const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    // Check for x-auth-token or Authorization header
    let token = req.header('x-auth-token');

    // Support Bearer token format
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Fetch full user to ensure strictMode and other fields are available in controllers
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ message: 'User no longer exists' });

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
