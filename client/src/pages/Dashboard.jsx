import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Shield, Zap, AlertTriangle, Activity, Search, Video, Image as ImageIcon, FileText, Server, Cloud, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

import API_BASE from '../api';

const MiniChart = ({ data, color, type = "area" }) => {
    // Always generate 10 bars with varied heights for a full, visible chart
    const chartData = Array.from({ length: 10 }, (_, i) => ({
        value: data && data[i] ? data[i].value || Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 50) + 50
    }));
    return (
        <div style={{ height: '55px', width: '100%', marginTop: '0.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
                {type === "area" ? (
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`color-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${color.replace('#', '')})`} />
                    </AreaChart>
                ) : (
                    <BarChart data={chartData} barCategoryGap="12%">
                        <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} barSize={12} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

const Dashboard = () => {
    const [riskScore, setRiskScore] = useState(0);
    const [riskStatus, setRiskStatus] = useState('Loading...');
    const [stats, setStats] = useState({
        totalScans: 0,
        threatsBlocked: 0,
        activityData: [],
        activeShields: "1,200",
        uptime: "99.99%"
    });
    const [recentAlerts, setRecentAlerts] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const riskRes = await axios.get(`${API_BASE}/threats/risk-score`);
                setRiskScore(riskRes.data.riskScore);
                setRiskStatus(riskRes.data.status);

                const statsRes = await axios.get(`${API_BASE}/threats/stats`);
                setStats({
                    totalScans: statsRes.data.totalScans,
                    threatsBlocked: statsRes.data.threatsBlocked,
                    activityData: statsRes.data.activityData,
                    activeShields: statsRes.data.activeShields,
                    uptime: statsRes.data.uptime
                });

                const alertsRes = await axios.get(`${API_BASE}/threats/alerts`);
                setRecentAlerts(alertsRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setRiskStatus('Offline');
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Helper to generate chart data from activityData shape
    const areaData = stats.activityData?.length ? stats.activityData.map(d => ({ value: d.blocked })) : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem', color: 'var(--text-primary)' }}>

            {/* Top Section: Attack Surface & Score */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Your Attack Surface */}
                <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(20, 20, 30, 0.4)' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-primary)' }}>Your Attack Surface</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', flex: 1 }}>

                        {/* Card 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' }}
                            style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', cursor: 'default', minHeight: '160px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <motion.div
                                    style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '8px', borderRadius: '8px', color: '#8b5cf6' }}
                                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                                    transition={{ delay: 0.8, duration: 0.6 }}
                                >
                                    <Shield size={20} />
                                </motion.div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.threatsBlocked.toLocaleString()}</h3>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Threats Blocked</span>
                            <MiniChart color="#8b5cf6" type="bar" data={areaData} />
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)' }}
                            style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', cursor: 'default', minHeight: '160px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <motion.div
                                    style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '8px', borderRadius: '8px', color: '#38bdf8' }}
                                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                                    transition={{ delay: 0.9, duration: 0.6 }}
                                >
                                    <Zap size={20} />
                                </motion.div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalScans.toLocaleString()}</h3>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Scans</span>
                            <MiniChart color="#38bdf8" type="area" />
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(249, 115, 22, 0.2)' }}
                            style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', cursor: 'default', minHeight: '160px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <motion.div
                                    style={{ background: 'rgba(249, 115, 22, 0.2)', padding: '8px', borderRadius: '8px', color: '#f97316' }}
                                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                                    transition={{ delay: 1.0, duration: 0.6 }}
                                >
                                    <Activity size={20} />
                                </motion.div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.activeShields}</h3>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Shields</span>
                            <MiniChart color="#f97316" type="bar" />
                        </motion.div>

                        {/* Card 4 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)' }}
                            style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', cursor: 'default', minHeight: '160px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <motion.div
                                    style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '8px', borderRadius: '8px', color: '#ec4899' }}
                                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                                    transition={{ delay: 1.1, duration: 0.6 }}
                                >
                                    <Database size={20} />
                                </motion.div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.uptime}</h3>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System Uptime</span>
                            <MiniChart color="#ec4899" type="area" />
                        </motion.div>

                    </div>
                </div>

                {/* Score Section */}
                <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(20, 20, 30, 0.4)' }}>
                    <div style={{ width: '100%', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '600' }}>Security Score</h2>
                    </div>
                    {(() => {
                        const score = Math.max(0, 100 - riskScore);
                        const radius = 80;
                        const stroke = 22;
                        const circumference = Math.PI * radius; // half circle
                        const filled = (score / 100) * circumference;
                        const color = score > 70 ? '#00ff88' : score > 40 ? '#fbbf24' : '#ff3366';
                        return (
                            <div style={{ position: 'relative', width: '200px', height: '115px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                                <svg width="200" height="115" viewBox="0 0 200 115" style={{ overflow: 'visible' }}>
                                    {/* Background arc */}
                                    <path
                                        d="M 10 100 A 80 80 0 0 1 190 100"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.06)"
                                        strokeWidth={stroke}
                                        strokeLinecap="round"
                                    />
                                    {/* Filled arc */}
                                    <path
                                        d="M 10 100 A 80 80 0 0 1 190 100"
                                        fill="none"
                                        stroke={color}
                                        strokeWidth={stroke}
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference - filled}
                                        style={{
                                            transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.5s ease',
                                            filter: `drop-shadow(0 0 8px ${color}60)`
                                        }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', bottom: '5px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', lineHeight: '1', color: color }}>{score}%</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {score > 70 ? 'Excellent' : score > 40 ? 'Moderate' : 'Critical'}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Middle Section: Attack Surface Overview (Logs/Alerts mapping) */}
            <div className="glass" style={{ padding: '2rem', background: 'rgba(20, 20, 30, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '600' }}>Attack Surface Overview</h2>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Search size={16} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
                        <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
                    </div>
                </div>

                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Alert Type</th>
                                <th style={{ padding: '1rem' }}>Severity Level</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentAlerts.slice(0, 8).map((alert, idx) => {
                                const isHighRisk = alert.type === 'Phishing' || alert.type === 'Malware' || alert.severity === 'High' || alert.severity === 'Critical';
                                // Use real reputation score if available, fallback to severity-based score
                                const score = alert.metadata?.reputation?.score ?? (isHighRisk ? 85 : 15);
                                // Dynamic color based on real score
                                const barColor = score >= 70 ? '#ef4444' : score >= 30 ? '#f59e0b' : '#10b981';

                                return (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        key={alert._id || idx}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                                                {isHighRisk ? <Server size={16} /> : <Cloud size={16} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{(() => { try { return new URL(alert.url || 'http://unknown').hostname.replace('www.', ''); } catch { return alert.url || 'unknown'; } })()}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Resource | Endpoint</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: isHighRisk ? '#ef4444' : '#10b981', background: isHighRisk ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                                                <AlertTriangle size={12} /> {alert.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                                                <div style={{ flex: 1, minWidth: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${score}%` }}
                                                        transition={{ duration: 1, delay: 0.2 + (0.1 * idx) }}
                                                        style={{ height: '100%', background: barColor, borderRadius: '3px' }}
                                                    />
                                                </div>
                                                <span style={{ minWidth: '30px' }}>{score}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {new Date(alert.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ border: 'none', cursor: 'pointer', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}><Shield size={12} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ border: 'none', cursor: 'pointer', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><Server size={12} /></motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                            {recentAlerts.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No incidents to display.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deep Scan AI Tool Integration */}
            <AIAnalysisTool />

        </div>
    );
};

const AIAnalysisTool = () => {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!url) return;
        setLoading(true);
        setResult(null);
        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await axios.post(`${API_BASE}/ai/analyze-url`, { url }, { headers });
            setResult(res.data);
        } catch (err) {
            setResult({ error: "Failed to perform AI analysis. Please check your connection." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass" style={{ padding: '2rem', marginTop: '1rem', border: '1px solid rgba(139, 92, 246, 0.2)', background: 'linear-gradient(180deg, rgba(20,20,30,0.4) 0%, rgba(139,92,246,0.05) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>
                    <Zap size={24} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '600' }}>AI Threat Intelligence Scan</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Multi-Layer Reputation Check & ML Heuristics</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL to analyze (e.g., http://suspicious-site.com)"
                    style={{
                        flex: 1,
                        padding: '1.2rem 1.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border 0.3s'
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid #8b5cf6'}
                    onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                />
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !url}
                    style={{
                        padding: '0 2.5rem',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: loading || !url ? 'not-allowed' : 'pointer',
                        opacity: loading || !url ? 0.6 : 1,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {loading ? 'Analyzing...' : 'Initiate Deep Scan'}
                </button>
            </div>

            {result && !result.error && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', borderLeft: `6px solid ${result.isPhishing ? '#ef4444' : '#10b981'}` }}>
                        <h4 style={{ marginBottom: '1rem', color: result.isPhishing ? '#ef4444' : '#10b981', fontSize: '1.2rem' }}>
                            {result.isPhishing ? 'Threat Detected' : 'Scan Result: Safe'}
                        </h4>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            {result.alert.description}
                        </div>
                        {result.reputation && (
                            <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Global Reputation Score</span>
                                    <span style={{ fontWeight: 'bold' }}>{result.reputation.score}/100</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${result.reputation.score}%`,
                                        height: '100%',
                                        background: result.reputation.score > 60 ? '#ef4444' : '#10b981',
                                        transition: 'width 1s ease'
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem' }}>
                            <Shield size={20} color="#3b82f6" /> Security Recommendations
                        </h4>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {result.recommendations?.map((rec, i) => (
                                <li key={i} style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {result?.error && (
                <div style={{ color: '#ef4444', padding: '1.2rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {result.error}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
