const axios = require('axios');

async function testAnalyze() {
    const url = 'http://secure-bank-login.tk';
    try {
        console.log(`Testing analysis for: ${url}`);
        const res = await axios.post('http://localhost:5000/api/threats/analyze', {
            url: url,
            content: `Navigated to: ${url}`
        });
        console.log('Result:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testAnalyze();
