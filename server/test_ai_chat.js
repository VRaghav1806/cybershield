const axios = require('axios');

async function testAiChat() {
    try {
        console.log('Sending chat message to AI...');
        const res = await axios.post('http://localhost:5000/api/ai/chat', {
            message: 'Hello, are you there?'
        });
        console.log('Response:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('AI Chat Failed:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error Message:', err.message);
        }
    }
}

testAiChat();
