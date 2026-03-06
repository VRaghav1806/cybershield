const axios = require('axios');

async function testDeduplication() {
    const API_BASE = 'http://localhost:5000/api';
    const TEST_URL = 'http://verify-deduplication-' + Date.now() + '.com';

    try {
        console.log('1. Checking initial scan count...');
        const statsBefore = await axios.get(`${API_BASE}/threats/stats`);
        const initialScans = statsBefore.data.totalScans;
        console.log(`Initial total scans: ${initialScans}`);

        console.log(`2. Sending two rapid scans for: ${TEST_URL}`);

        const res1 = await axios.post(`${API_BASE}/threats/analyze`, { url: TEST_URL, content: 'Test content' });
        console.log('Scan 1 sent.');

        // Wait 500ms to simulate rapid sequential calls from extension
        await new Promise(r => setTimeout(r, 500));

        const res2 = await axios.post(`${API_BASE}/threats/analyze`, { url: TEST_URL, content: 'Test content' });
        console.log('Scan 2 sent.');

        console.log('Scan 1 Result ID:', res1.data.alert._id);
        console.log('Scan 2 Result ID:', res2.data.alert._id);

        if (res1.data.alert._id === res2.data.alert._id) {
            console.log('SUCCESS: Both scans returned the same Alert ID (Deduplicated).');
        } else {
            console.error('FAILURE: Scans returned different Alert IDs.');
            process.exit(1);
        }

        console.log('3. Checking final scan count...');
        const statsAfter = await axios.get(`${API_BASE}/threats/stats`);
        const finalScans = statsAfter.data.totalScans;
        console.log(`Final total scans: ${finalScans}`);

        if (finalScans === initialScans + 1) {
            console.log('SUCCESS: Total scans increased by exactly 1.');
        } else {
            console.error(`FAILURE: Total scans increased by ${finalScans - initialScans} instead of 1.`);
            process.exit(1);
        }

        console.log('ALL DEDUPLICATION TESTS PASSED!');
    } catch (err) {
        console.error('Test failed with error:', err.response?.data || err.message);
        process.exit(1);
    }
}

testDeduplication();
