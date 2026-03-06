const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Alert = require('./models/Alert');

dotenv.config();

async function debugAlerts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const alerts = await Alert.find().sort({ timestamp: -1 }).limit(20);
        console.log(`Analyzing last 20 alerts:`);
        alerts.forEach(a => {
            console.log(`[${a.timestamp.toISOString()}] Type: ${a.type}, URL: ${a.url}, Descr: ${a.description.substring(0, 50)}...`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugAlerts();
