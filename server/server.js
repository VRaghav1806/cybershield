const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Error Handling for process
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('[Process] Uncaught Exception:', err);
});


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
    if (req.path !== '/api/threats/stats') { // Skip spammy stats logs
        console.log(`[Server] ${req.method} ${req.path}`);
        if (req.method === 'POST') {
            console.log(`[Server] Body:`, JSON.stringify(req.body));
        }
    }
    next();
});


// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/threats', require('./routes/threatRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/', (req, res) => {
    res.send('Cybersecurity API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
