const Alert = require('../models/Alert');
const axios = require('axios');

exports.getRiskScore = async (req, res) => {
    try {

        const totalScans = await Alert.countDocuments();
        const threatsBlocked = await Alert.countDocuments({ type: 'Phishing' });

        let riskScore = 0;
        if (totalScans > 0) {
            riskScore = Math.round((threatsBlocked / totalScans) * 100);
        }

        // Cap score at 100 (though percentage will naturally be capped)
        riskScore = Math.min(riskScore, 100);

        res.json({
            riskScore,
            status: riskScore > 70 ? 'High Risk' : riskScore > 30 ? 'Moderate' : 'Secure',
            totalScans,
            threatsBlocked
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Simulates a reputation check against global blacklists/threat feeds.
 */
const getExternalReputation = (url) => {
    const highRiskKeywords = ['login', 'verify', 'update', 'secure', 'bank', 'account'];
    const riskyTLDs = ['.tk', '.ga', '.cf', '.ml', '.gq', '.top', '.xyz', '.icu', '.gq', '.buzz', '.monster'];
    const trustedDomains = ['instagram.com', 'google.com', 'facebook.com', 'microsoft.com', 'apple.com', 'amazon.com', 'netflix.com', 'twitter.com', 'linkedin.com', 'github.com'];

    let riskPoints = 0;
    const lowerUrl = (url || '').toLowerCase();

    // 0. Trusted Domain Check (Highest Priority)
    try {
        const urlObj = new URL(lowerUrl);
        const host = urlObj.hostname;
        if (trustedDomains.some(domain => host.endsWith(domain))) {
            console.log(`[Reputation] Trusted Domain detected: ${host}. Skipping risk points.`);
            return { score: 0, isBlacklisted: false, source: 'CyberShield Trusted Host Whitelist' };
        }
    } catch (e) { /* ignore and proceed */ }


    // 1. TLD Check using Hostname
    try {
        const urlObj = new URL(lowerUrl);
        const host = urlObj.hostname;
        if (riskyTLDs.some(tld => host.endsWith(tld))) {
            riskPoints += 50; // Increased weight for risky TLDs
            console.log(`[Reputation] TLD Match (+50) for host: ${host}. Current points: ${riskPoints}`);
        }
    } catch (e) {
        // Fallback for malformed URLs
        if (riskyTLDs.some(tld => lowerUrl.includes(tld))) {
            riskPoints += 50;
            console.log(`[Reputation] Raw TLD Match (+50) for: ${url}. Current points: ${riskPoints}`);
        }
    }

    // 2. Keyword Check
    const keywordMatches = highRiskKeywords.filter(kw => lowerUrl.includes(kw));
    if (keywordMatches.length >= 2) {
        riskPoints += 30;
        console.log(`[Reputation] Keyword Match (${keywordMatches.join(', ')}), +30. Current points: ${riskPoints}`);
    }


    // 4. DEMO ONLY: Specific test keyword
    if (lowerUrl.includes('cybershield-demo-threat')) {
        riskPoints = 100;
        console.log(`[Reputation] DEMO MATCH DETECTED. Final score: 100.`);
    }

    // 3. Security Protocol Check
    if (lowerUrl.startsWith('http://') && keywordMatches.length >= 1) {
        riskPoints += 20;
        console.log(`[Reputation] Insecure + Keyword Match (${keywordMatches[0]}), +20. Current points: ${riskPoints}`);
    }


    console.log(`[Reputation] Final score for ${url}: ${Math.min(riskPoints, 100)}`);

    return {
        score: Math.min(riskPoints, 100),
        isBlacklisted: riskPoints >= 70,
        source: 'CyberShield Global Threat Feed (Simulated)'
    };
};

/**
 * Provides actionable security advice based on the threat type.
 */
const getSecurityRecommendations = (type, severity) => {
    if (type === 'Safe') {
        return ["Maintain standard browsing safety.", "Ensure your browser and extension are up to date."];
    }

    const base = [
        "DO NOT enter any credentials or personal info on this site.",
        "Close the tab immediately."
    ];

    if (severity === 'High' || severity === 'Critical') {
        base.push("Run a full system antivirus scan.");
        base.push("Change passwords for any accounts that may have been compromised.");
    }

    if (type === 'Phishing') {
        base.push("Enable Multi-Factor Authentication (MFA) on your sensitive accounts.");
    }

    return base;
};

const Groq = require('groq-sdk');
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const scanCooldowns = new Map();
const SERVER_SCAN_COOLDOWN = 5000;

exports.analyzeThreat = async (req, res) => {
    try {
        let { content, url } = req.body;
        const authHeader = req.header('Authorization');

        // --- PRE-PROCESSING: URL Extraction ---
        // 1. Handle Network/ISP Interception (Decoding original target from firewall block page)
        if (url && url.includes('172.16.16.16') && url.includes('url=')) {
            try {
                const encodedPart = url.split('url=')[1].split('&')[0];
                const base64 = encodedPart.replace(/~/g, '=');
                const decoded = Buffer.from(base64, 'base64').toString('utf8');
                if (decoded.startsWith('http')) {
                    console.log(`[Backend] Intelligence: Bypassing Network Interception for ${decoded}`);
                    url = decoded;
                }
            } catch (e) {
                console.log('[Backend] Network bypass failed:', e.message);
            }
        }

        // 2. Extract from content if url is missing
        if (!url && content) {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const matches = content.match(urlRegex);
            if (matches && matches.length > 0) {
                url = matches[0];
                console.log(`[Backend] Extracted URL from content: ${url}`);
            }
        }

        console.log(`[Backend] Analyzing URL: ${url} (Auth present: ${!!authHeader})`);



        // Deduplication Logic
        const userId = 'system';
        const cacheKey = `${userId}-${url}`;
        const now = Date.now();

        console.log(`[Backend] Analyze requested for URL: ${url}`);


        // 1. Check in-memory cache (Fastest)
        if (scanCooldowns.has(cacheKey)) {
            const lastScan = scanCooldowns.get(cacheKey);
            if (now - lastScan.timestamp < SERVER_SCAN_COOLDOWN) {
                console.log(`[Backend] Deduplicating scan for URL (Cache): ${url}`);
                return res.json(lastScan.result);
            }
        }

        // 2. Check Database (Robust across multiple processes)
        const duplicateWindow = new Date(Date.now() - SERVER_SCAN_COOLDOWN);
        const existingAlert = await Alert.findOne({
            url: url,
            timestamp: { $gte: duplicateWindow }
        }).sort({ timestamp: -1 });

        if (existingAlert) {
            console.log(`[Backend] Deduplicating scan for URL (DB): ${url}`);

            // Recalculate reputation if missing or invalid in metadata
            let reputation = existingAlert.metadata?.reputation;
            if (!reputation || (reputation.score === 0 && existingAlert.type === 'Phishing')) {
                reputation = getExternalReputation(url);
                // Boost if it's already known to be phishing
                if (existingAlert.type === 'Phishing' && reputation.score < 70) {
                    reputation.score = existingAlert.severity === 'High' ? 85 : 70;
                    reputation.source = 'Stored Analysis Recovery';
                }
            }

            const result = {
                isPhishing: existingAlert.type === 'Phishing',
                alert: existingAlert,
                block: false, // Handle blocking client-side based on strictMode
                recommendations: getSecurityRecommendations(existingAlert.type, existingAlert.severity),
                reputation: reputation
            };
            // Sync current process cache
            scanCooldowns.set(cacheKey, { timestamp: Date.now(), result });
            return res.json(result);
        }


        const textToAnalyze = `${content || 'Scan Request for:'} ${url || ''}`.trim();


        if (textToAnalyze === '') {
            return res.json({ isPhishing: false, error: 'No content to analyze' });
        }

        // --- LAYER 1: EXTERNAL REPUTATION ---
        const reputation = getExternalReputation(url);

        let isPhishing = reputation.isBlacklisted;
        let aiReasoning = isPhishing ? `Flagged by Global Threat Feed: ${reputation.source}.` : 'Initial check clean.';
        let severity = isPhishing ? 'High' : 'Low';

        // --- LAYER 2: ML PREDICTION ---
        let mlOutputStr = "ML analysis pending...";
        const skipML = reputation.score < 15;

        if (isPhishing) {
            mlOutputStr = `ML analysis skipped because URL is already flagged by Reputation Engine (Score: ${reputation.score}).`;
        } else if (skipML) {
            mlOutputStr = "ML analysis skipped (URL looks highly safe based on structural reputation).";
        }

        if (!isPhishing && !skipML && url && !url.includes('localhost') && !url.includes('chrome://')) {
            try {
                const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';
                const mlRes = await axios.post(`${mlServiceUrl}/predict`, { url });
                if (mlRes.data && mlRes.data.prediction !== undefined) {
                    const isMalicious = mlRes.data.prediction === 1;
                    if (isMalicious) isPhishing = true; // Flag early to ensure it's caught
                    mlOutputStr = `The Machine Learning model analyzed 20 structural features and predicted this URL is ${isMalicious ? 'MALICIOUS' : 'SAFE'}.`;
                    console.log(`[Backend] ML prediction: ${isMalicious ? 'MALICIOUS' : 'SAFE'}`);
                }
            } catch (mlErr) {
                console.log(`[Backend] ML Error: ${mlErr.message}`);
                mlOutputStr = "ML analysis unavailable.";
            }
        }

        // --- FAST PATH OPTIMIZATION ---
        // We lower the threshold to 30 to ensure any URL with at least 2 keywords 
        // or a suspicious TLD gets a deeper look.
        const requiresDeepScan = isPhishing || reputation.score >= 30 || mlOutputStr.includes('MALICIOUS');

        // --- LAYER 3: DEEP AI SCANNING ---
        if (requiresDeepScan && !textToAnalyze.includes('localhost') && !textToAnalyze.includes('chrome://')) {
            if (groq) {
                try {
                    const chatCompletion = await groq.chat.completions.create({
                        messages: [
                            {
                                role: 'system',
                                content: `You are a Senior Cyber Security Analyst. Respond with "PHISHING: TRUE/FALSE, SEVERITY: LOW/MEDIUM/HIGH, REASON: [Short Technical Explanation]". Analyze the URL/content for phishing, malware, or credential harvesting risks. Reputation Score: ${reputation.score}/100. Context: ${mlOutputStr}`,
                            },
                            {
                                role: 'user',
                                content: `Analyze this for threats: ${textToAnalyze}`,
                            },
                        ],
                        model: 'llama-3.1-8b-instant',
                    });

                    const aiResponse = chatCompletion.choices[0]?.message?.content || "";
                    console.log(`[Backend] AI Raw Response: ${aiResponse}`);

                    const aiPhishFlag = aiResponse.includes('PHISHING: TRUE');
                    aiReasoning = "AI Analysis: " + (aiResponse.match(/REASON:\s*(.*)/i)?.[1]?.trim() || aiResponse);

                    if (aiPhishFlag) {
                        console.log(`[Backend] AI flagged as PHISHING!`);
                        isPhishing = true;
                        if (aiResponse.includes('SEVERITY: HIGH') || aiResponse.includes('SEVERITY: CRITICAL')) severity = 'High';
                        else if (aiResponse.includes('SEVERITY: MEDIUM')) severity = 'Medium';
                        else severity = 'Low';

                        // Boost reputation score if AI identifies it as phish but reputation engine missed it
                        if (reputation.score < 75) {
                            console.log(`[Backend] Boosting reputation score from ${reputation.score}...`);
                            reputation.score = severity === 'High' ? 85 : 70;
                            reputation.source = "AI Forensic Override";
                        }
                    } else if (reputation.score < 70) {
                        console.log(`[Backend] AI determined the URL is SAFE. Overruling previous score: ${reputation.score}`);
                        isPhishing = false;
                        severity = 'Low';
                    } else {
                        console.log(`[Backend] AI said SAFE but reputation is too high (${reputation.score}). PHISHING FLAG REMAINS.`);
                    }
                } catch (aiError) {
                    console.error("[Backend] AI scanning failed.", aiError.message);
                }

            } else {
                console.log(`[Backend] Groq API client not initialized.`);
            }
        } else {
            // Fast path: no deep AI needed
            console.log('[Backend] Fast path: safe result, skipping AI');
            aiReasoning = 'Fast path safe';
        }

        // --- SAVE ANALYSIS RESULT ---
        let savedAlert = null;
        const isMsnSafe = !isPhishing && url && url.includes('msn.com');

        if (!isMsnSafe) {
            const alert = new Alert({
                type: isPhishing ? 'Phishing' : 'Safe',
                severity: severity,
                description: aiReasoning,
                url: url,
                userId: 'system',
                metadata: { reputation } // Ensure metadata is saved
            });
            savedAlert = await alert.save();
        } else {
            console.log(`[Backend] Skipping alert save for Safe MSN URL: ${url}`);
        }

        const block = false; // Blocking handled by client/extension based on local strictMode setting
        const recommendations = getSecurityRecommendations(isPhishing ? 'Phishing' : 'Safe', severity);


        console.log(`[Backend] Result for ${url}: isPhishing=${isPhishing}, block=${block}`);
        const result = { isPhishing, alert: savedAlert, block, recommendations, reputation, mlOutputStr };


        // Cache the result for server-side deduplication
        scanCooldowns.set(cacheKey, { timestamp: Date.now(), result });

        // Cleanup old cache entries if it grows too large
        if (scanCooldowns.size > 500) {
            const cleanupThreshold = Date.now() - (SERVER_SCAN_COOLDOWN * 2);
            for (const [key, val] of scanCooldowns.entries()) {
                if (val.timestamp < cleanupThreshold) scanCooldowns.delete(key);
            }
        }

        res.json(result);
    } catch (err) {
        console.error('[Backend] Analysis Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};


exports.getStats = async (req, res) => {
    try {
        console.log('[Backend] Fetching stats...');
        const totalScans = await Alert.countDocuments();
        const threatsBlocked = await Alert.countDocuments({ type: 'Phishing' });

        // Active Shields: Constant for demo or dynamic based on total scans
        const activeShields = 1200 + Math.floor(totalScans / 10);

        // Calculate Uptime (simulated based on first scan or a fixed high value for demo)
        const firstScan = await Alert.findOne().sort({ timestamp: 1 });
        let uptime = "99.99%";
        if (firstScan) {
            const hoursSinceStart = Math.abs(new Date() - firstScan.timestamp) / 36e5;
            if (hoursSinceStart < 1) uptime = "100.00%";
        }

        // Group by hour for the last 24 hours - count only phishing threats blocked
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activityData = await Alert.aggregate([
            { $match: { timestamp: { $gte: twentyFourHoursAgo }, type: 'Phishing' } },
            {
                $group: {
                    _id: { $hour: { date: "$timestamp", timezone: "+05:30" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Format for recharts
        const formattedActivity = Array.from({ length: 24 }, (_, i) => {
            const hourData = activityData.find(d => d._id === i);
            return {
                name: `${i.toString().padStart(2, '0')}:00`,
                blocked: hourData ? hourData.count : 0
            };
        });

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyData = await Alert.aggregate([
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dayOfWeek: { date: "$timestamp", timezone: "+05:30" } },
                    attacks: { $sum: 1 },
                    blocked: { $sum: { $cond: [{ $eq: ["$type", "Phishing"] }, 1, 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedWeekly = Array.from({ length: 7 }, (_, i) => {
            const dayData = weeklyData.find(d => d._id === i + 1);
            return {
                name: days[i],
                attacks: dayData ? dayData.attacks : 0,
                blocked: dayData ? dayData.blocked : 0
            };
        });

        console.log(`[Backend] Stats generated: ${totalScans} total scans, ${threatsBlocked} threats blocked.`);
        res.json({
            totalScans,
            threatsBlocked,
            activeShields,
            uptime,
            activityData: formattedActivity,
            weeklyActivity: formattedWeekly
        });
    } catch (err) {
        console.error('[Backend] Stats Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ timestamp: -1 }).limit(10);
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAlertStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedAlert = await Alert.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedAlert) return res.status(404).json({ error: 'Alert not found' });
        res.json(updatedAlert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAlert = await Alert.findByIdAndDelete(id);
        if (!deletedAlert) return res.status(404).json({ error: 'Alert not found' });
        res.json({ message: 'Alert permanently removed from vault', id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
