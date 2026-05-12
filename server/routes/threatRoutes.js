const express = require('express');
const router = express.Router();
const { getRiskScore, analyzeThreat, getAlerts, getStats, updateAlertStatus, deleteAlert } = require('../controllers/threatController');

router.get('/risk-score', getRiskScore);
router.get('/stats', getStats);
router.post('/analyze', analyzeThreat);
router.get('/alerts', getAlerts);
router.patch('/:id/status', updateAlertStatus);
router.delete('/:id', deleteAlert);

module.exports = router;
