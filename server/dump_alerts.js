const mongoose = require('mongoose');
const Alert = require('./models/Alert');
const fs = require('fs');
require('dotenv').config();

async function dumpAlerts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const alerts = await Alert.find().sort({ timestamp: -1 });
        fs.writeFileSync('alerts_dump.json', JSON.stringify(alerts, null, 2));
        console.log(`Dumped ${alerts.length} alerts to alerts_dump.json`);
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

dumpAlerts();
