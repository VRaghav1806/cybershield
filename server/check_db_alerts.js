const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Alert = require('./models/Alert');

dotenv.config();

async function checkAlerts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const alerts = await Alert.find({ url: /secure-bank-login.tk/i }).sort({ timestamp: -1 });
        console.log(`Found ${alerts.length} alerts for secure-bank-login.tk:`);
        alerts.forEach(a => {
            console.log(`- Type: ${a.type}, Severity: ${a.severity}, Timestamp: ${a.timestamp}, Block: ${a.block}`);
        });

        const allAlerts = await Alert.find().sort({ timestamp: -1 }).limit(5);
        console.log('\nLast 5 alerts in system:');
        allAlerts.forEach(a => {
            console.log(`- URL: ${a.url}, Type: ${a.type}, Timestamp: ${a.timestamp}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAlerts();
