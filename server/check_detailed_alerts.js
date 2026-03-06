const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Alert = require('./models/Alert');

dotenv.config();

async function checkDetailedAlerts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const latestAlerts = await Alert.find({ url: /secure-bank-login.tk/ }).sort({ timestamp: -1 }).limit(3);

        console.log('\n--- Details for secure-bank-login.tk ---');
        latestAlerts.forEach((alert, i) => {
            console.log(`Alert ${i + 1}:`);
            console.log(`  Type: ${alert.type}`);
            console.log(`  Description: ${alert.description}`);
            console.log(`  Reputation in Metadata: ${JSON.stringify(alert.metadata)}`);
            console.log(`  Timestamp: ${alert.timestamp}`);
            console.log('------------------------');
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkDetailedAlerts();
