const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Alert = require('./models/Alert');

dotenv.config();

async function debugConflictingAlerts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const alerts = await Alert.find({ url: /instagram\.com/i }).sort({ timestamp: -1 }).limit(10);
        console.log(`Found ${alerts.length} instagram alerts:`);
        alerts.forEach(a => {
            console.log(`\n--- [${a.type}] at ${a.timestamp.toISOString()} ---`);
            console.log(`Description: ${a.description}`);
            console.log(`Metadata: ${JSON.stringify(a.metadata)}`);
            console.log(`User ID: ${a.userId}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugConflictingAlerts();
