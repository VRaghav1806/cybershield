const axios = require('axios');

async function testOllama() {
    try {
        console.log('Fetching models from local Ollama...');
        const res = await axios.get('http://127.0.0.1:11434/api/tags');
        console.log('Available Local Models:');
        if (res.data.models) {
            res.data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log('No models found in Ollama.');
        }
    } catch (err) {
        console.error('Failed to connect to Ollama (11434):');
        console.error(err.message);
    }
}

testOllama();
