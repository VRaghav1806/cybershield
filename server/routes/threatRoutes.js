const express = require('express');
const router = express.Router();
const { getRiskScore, analyzeThreat, getAlerts, getStats, updateAlertStatus, deleteAlert } = require('../controllers/threatController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

router.get('/risk-score', getRiskScore);
router.get('/stats', getStats);
router.post('/analyze', optionalAuth, analyzeThreat);
router.get('/alerts', getAlerts);
router.patch('/:id/status', auth, updateAlertStatus);
router.delete('/:id', auth, deleteAlert);

module.exports = router;
