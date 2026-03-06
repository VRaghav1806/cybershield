const Groq = require('groq-sdk');
require('dotenv').config({ path: 'e:/amd/server/.env' });

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function listModels() {
    try {
        console.log('Fetching available models for provided API key...');
        const models = await groq.models.list();
        console.log('Available Models:');
        models.data.forEach(m => console.log(`- ${m.id}`));
    } catch (err) {
        console.error('Failed to list models:');
        console.error(err.message);
    }
}

listModels();
