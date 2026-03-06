const axios = require('axios');
const fs = require('fs');

async function finalVerify() {
    const API_BASE = 'http://localhost:5000/api';
    const TEST_URL = 'http://secure-bank-login.tk';

    try {
        const res = await axios.post(`${API_BASE}/threats/analyze`, {
            url: TEST_URL,
            content: 'Verification scan ' + Date.now()
        });

        const output = {
            timestamp: new Date().toISOString(),
            url: TEST_URL,
            response: res.data
        };

        fs.writeFileSync('final_verify_output.json', JSON.stringify(output, null, 2));
        console.log('Output written to final_verify_output.json');
    } catch (err) {
        fs.writeFileSync('final_verify_output.json', JSON.stringify({ error: err.message, data: err.response?.data }, null, 2));
        console.error('API Error:', err.message);
    }
}

finalVerify();
