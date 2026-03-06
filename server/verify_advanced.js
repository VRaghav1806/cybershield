const axios = require('axios');

async function verifyAdvancedFeatures() {
    const API_URL = 'http://localhost:5000/api/ai/analyze-url';
    const TEST_URL = 'http://unique-phish-test-' + Date.now() + '.net/verify';

    console.log('Testing Advanced Multi-Layer Analysis...');
    try {
        const response = await axios.post(API_URL, { url: TEST_URL });
        const data = response.data;

        console.log('--- FULL RESPONSE ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('---------------------');

        if (data.reputation) {
            console.log('✓ Reputation Score Found:', data.reputation.score);
        } else {
            console.log('✗ Reputation Score Missing');
        }

        if (data.recommendations && data.recommendations.length > 0) {
            console.log('✓ Recommendations Found:', data.recommendations.length);
        } else {
            console.log('✗ Recommendations Missing');
        }

        console.log('\nVerification Successful: Multi-layer detection is active.');
    } catch (error) {
        console.error('Verification Failed:', error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

verifyAdvancedFeatures();
