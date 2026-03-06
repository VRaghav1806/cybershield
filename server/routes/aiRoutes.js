const express = require('express');
const axios = require('axios');
const router = express.Router();
const aiController = require('../controllers/aiController');

// @route   POST api/ai/chat
// @desc    Get AI chat completion
// @access  Public (or Protected if needed)
router.post('/chat', aiController.getChatCompletion);

// @route   POST api/ai/predict
// @desc    Proxy prediction request to Flask ML service
// @access  Public
router.post('/predict', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5001/predict', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding to ML service:', error.message);
        res.status(500).json({ error: 'ML service unavailable' });
    }
});

const threatController = require('../controllers/threatController');
// @route   POST api/ai/analyze-url
// @desc    Get detailed AI analysis for a URL
// @access  Public
router.post('/analyze-url', threatController.analyzeThreat);

module.exports = router;
