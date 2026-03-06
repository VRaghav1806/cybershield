const axios = require('axios');

async function testUrl() {
    const URL = 'http://login.verify.account.xyz';
    console.log(`Testing URL: ${URL}`);

    try {
        const res = await axios.post('http://localhost:5000/api/threats/analyze', {
            url: URL,
            content: 'Navigated to: ' + URL
        });

        console.log('Is Phishing:', res.data.isPhishing);
        console.log('Reputation:', res.data.reputation);
        console.log('Block:', res.data.block);

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

testUrl();
