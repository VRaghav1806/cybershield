const mongoose = require('mongoose');
const Alert = require('./models/Alert');
require('dotenv').config();

async function checkAlerts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const alerts = await Alert.find().sort({ timestamp: -1 });
        console.log(`Found ${alerts.length} total alerts`);
        alerts.forEach(a => {
            console.log(`Alert: ID=${a._id}, URL=${a.url}, Type=${a.type}, Score=${a.metadata?.reputation?.score}`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkAlerts();



