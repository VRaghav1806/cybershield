const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({});
        console.log('Users in DB:');
        users.forEach(u => {
            console.log(`ID: ${u._id}, Username: ${u.username}, Email: ${u.email}, StrictMode: ${u.strictMode}`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkUsers();

