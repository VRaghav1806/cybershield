const axios = require('axios');

async function testStrictMode() {
    const API_BASE = 'http://localhost:5000/api';
    const email = `test_${Date.now()}@test.com`;
    const password = 'password123';

    try {
        console.log('1. Registering test user...');
        const regRes = await axios.post(`${API_BASE}/auth/register`, {
            username: `testuser_${Date.now()}`,
            email,
            password
        });
        const token = regRes.data.token;
        console.log('User registered.');

        console.log('2. Enabling Strict Mode...');
        await axios.put(`${API_BASE}/auth/settings`,
            { strictMode: true },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('Strict Mode enabled.');

        console.log('3. Analyzing suspicious URL (Should be blocked)...');
        const analyzeRes = await axios.post(`${API_BASE}/threats/analyze`,
            { url: 'http://secure-password-reset-portal.com' },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('Result:', JSON.stringify(analyzeRes.data, null, 2));

        if (analyzeRes.data.isPhishing && analyzeRes.data.block === true) {
            console.log('SUCCESS: Threat detected and marked for blocking.');
        } else {
            console.error('FAILURE: Threat not blocked in strict mode.');
            process.exit(1);
        }

        console.log('4. Disabling Strict Mode...');
        await axios.put(`${API_BASE}/auth/settings`,
            { strictMode: false },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('Strict Mode disabled.');

        console.log('5. Analyzing suspicious URL (Should NOT be blocked)...');
        const analyzeRes2 = await axios.post(`${API_BASE}/threats/analyze`,
            { url: 'http://secure-password-reset-portal.com' },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('Result:', JSON.stringify(analyzeRes2.data, null, 2));

        if (analyzeRes2.data.isPhishing && analyzeRes2.data.block === false) {
            console.log('SUCCESS: Threat detected but NOT blocked (Strict mode OFF).');
        } else {
            console.error('FAILURE: Unexpected block status.');
            process.exit(1);
        }

        console.log('ALL TESTS PASSED!');
    } catch (err) {
        console.error('Test failed with error:', err.response?.data || err.message);
        process.exit(1);
    }
}

testStrictMode();
