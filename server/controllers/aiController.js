const Groq = require('groq-sdk');
const Alert = require('../models/Alert');


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

console.log('AI Controller Initialized. GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);

exports.getChatCompletion = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Fetch live data for context
        const totalScans = await Alert.countDocuments();
        const threatsBlocked = await Alert.countDocuments({ type: 'Phishing' });
        const recentAlerts = await Alert.find({ type: 'Phishing' }).sort({ timestamp: -1 }).limit(3);

        let riskScore = totalScans > 0 ? Math.round((threatsBlocked / totalScans) * 100) : 0;
        riskScore = Math.min(riskScore, 100);

        const recentAlertsContext = recentAlerts.map(a => `- ${a.url} (Severity: ${a.severity})`).join('\n');

        const systemContent = `You are CyberShield AI, a world-class cybersecurity expert. Your goal is to provide STRICTLY pointed, concise, and professional security advice. **CRITICAL RULES:**
1. NEVER start with conversational intros (e.g., "Certainly," "To provide...").
2. Start IMMEDIATELY with the answer or action items.
3. Use CLEAR bullet points (-) for technical lists.
4. Separate each point with a double newline for readability.
5. Use BOLD (**text**) for key security terms or categories.
6. No long paragraphs; keep any non-list sentences to under 15 words.

**LIVE SYSTEM CONTEXT:**
- Total Scans: ${totalScans}
- Threats Blocked: ${threatsBlocked}
- Current Risk Score: ${riskScore}/100
- Recent Threats in Vault:
${recentAlertsContext || 'No recent threats'}

Use this live data to answer questions about the user's system health, recent threats, or current security status. If the user asks about their health, DO NOT ask them for their OS/Browser/Antivirus, use the LIVE SYSTEM CONTEXT instead to assess their health.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemContent,
                },
                {
                    role: 'user',
                    content: message,
                },
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 1024,
        });

        res.json({
            response: chatCompletion.choices[0]?.message?.content || 'I am sorry, I could not generate a response at this time.',
        });
    } catch (error) {
        console.error('Groq AI Error:', error.message);
        res.status(500).json({ error: 'Failed to get AI response', details: error.message });
    }
};

exports.analyzeThreat = async (req, res) => {
    try {
        const { url, threatType, score } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required for analysis' });
        }

        const prompt = `
        Analyze the following potentially malicious URL and provide a professional cybersecurity assessment:
        URL: ${url}
        Detected Threat Type: ${threatType || 'Unknown'}
        ML Confidence Score: ${score || 'N/A'}

        Please provide:
        1. WHY this URL might be dangerous (technical reasoning).
        2. Common techniques used in this type of attack.
        3. Immediate steps a user should take if they visited it.
        4. Technical indicators of Phishing or Malware in this specific structure.

        Keep the tone professional and the insights deep.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a Senior Threat Intelligence Analyst. Your task is to provide deep technical insights into malicious URLs and cyber threats. Focus on URL structure, domain reputation indicators, and social engineering patterns.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.5,
        });

        res.json({
            analysis: chatCompletion.choices[0]?.message?.content || 'Unable to analyze threat at this time.',
        });
    } catch (error) {
        console.error('Groq Analysis Error:', error.message);
        res.status(500).json({ error: 'Failed to analyze threat', details: error.message });
    }
};
