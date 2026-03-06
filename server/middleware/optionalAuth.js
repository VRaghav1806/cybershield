const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    let token = req.header('x-auth-token');
    const authHeader = req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return next(); // Proceed without req.user
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
            req.user = user;
            console.log(`[Auth] User identified: ${user._id} (Strict Mode: ${user.strictMode})`);
        }
        next();

    } catch (err) {
        // If token is invalid, we still proceed but without a user
        console.error('Invalid token in optionalAuth:', err.message);
        next();
    }
};
