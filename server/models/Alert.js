const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., 'Phishing', 'Malware', 'Anomaly'
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    description: { type: String, required: true },
    url: { type: String }, // URL that was scanned
    status: { type: String, enum: ['Active', 'Resolved', 'Ignored'], default: 'Active' },
    timestamp: { type: Date, default: Date.now },
    userId: { type: String, default: 'system' },
    metadata: { type: Object, default: {} } // For reputation scores, AI markers, etc.
});

module.exports = mongoose.model('Alert', alertSchema);
