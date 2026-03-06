const axios = require('axios');

async function finalVerify() {
    const API_BASE = 'http://localhost:5000/api';
    const TEST_URL = 'http://secure-bank-login.tk';

    try {
        console.log(`--- Final Verification for: ${TEST_URL} ---`);
        // We use a unique content to bypass any potential server-side cache if they check content
        // although the cache key is userId-url.
        const res = await axios.post(`${API_BASE}/threats/analyze`, {
            url: TEST_URL,
            content: 'Verification scan ' + Date.now()
        });

        console.log('Response JSON:', JSON.stringify(res.data, null, 2));

        const { isPhishing, block, alert } = res.data;

        console.log('\nVerdict:');
        if (isPhishing) {
            console.log('✅ Phishing detected correctly.');
        } else {
            console.error('❌ FAILED: Phishing NOT detected.');
        }

        if (block) {
            console.log('✅ Block flag is TRUE (Server-side).');
        } else {
            console.log('ℹ️ Block flag is FALSE (Expected if not logged in or strict mode off on server).');
        }

        if (alert && alert.description.includes('Reputation')) {
            console.log('✅ Correct detection path (Reputation matches).');
        }

    } catch (err) {
        console.error('API Error:', err.response?.data || err.message);
    }
}

finalVerify();
