import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle2, XCircle, Zap } from 'lucide-react';

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const Threats = () => {
    const [content, setContent] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recentAlerts, setRecentAlerts] = useState([]);

    const fetchAlerts = async () => {
        try {
            const res = await axios.get(`${API_BASE}/threats/alerts`);
            setRecentAlerts(res.data);
        } catch (err) {
            console.error('Error fetching alerts:', err);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleAnalyze = async () => {
        if (!content) return;
        setLoading(true);
        setResult(null);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Use the same endpoint but it returns the full Multi-Layer payload now
            const res = await axios.post(`${API_BASE}/threats/analyze`,
                { content },
                { headers }
            );

            setResult(res.data);
            fetchAlerts(); // Refresh list after analysis
        } catch (err) {
            console.error('Analysis error:', err);
            setResult({ error: 'Security Pipeline Error: Could not reach the server.' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
                        <Zap size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem' }}>AI Threat Intelligence (Multi-Layer)</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Reputation Check + ML Heuristics + Deep AI Analysis</p>
                    </div>
                </div>


                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea
                        placeholder="Paste email content, URLs, or message snippets..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{
                            width: '100%',
                            height: '150px',
                            padding: '1.5rem',
                            background: 'var(--bg-main)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            resize: 'none'
                        }}
                    />
                    <button
                        className="btn-primary"
                        onClick={handleAnalyze}
                        disabled={loading || !content}
                        style={{
                            width: 'fit-content',
                            padding: '0 2rem',
                            height: '45px',
                            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                            color: 'white',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                            opacity: (loading || !content) ? 0.6 : 1,
                            transition: 'all 0.3s'
                        }}
                    >
                        {loading ? 'Analyzing...' : 'Deep Scan'}
                    </button>

                </div>
            </div>

            {result && !result.error && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
                    <div className="glass" style={{ padding: '1.5rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', borderLeft: `6px solid ${result.isPhishing ? 'var(--danger)' : 'var(--success)'}` }}>
                        <h4 style={{ marginBottom: '1rem', color: result.isPhishing ? 'var(--danger)' : 'var(--success)' }}>
                            {result.isPhishing ? 'Threat Detected' : 'Safety Verified'}
                        </h4>
                        <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                            {result.alert?.description || result.aiReasoning}
                        </div>

                        {result.reputation && (
                            <div style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Global Reputation Score</span>
                                    <span style={{ fontWeight: 'bold' }}>{result.reputation.score}/100</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${result.reputation.score}%`,
                                        height: '100%',
                                        background: result.reputation.score > 60 ? 'var(--danger)' : 'var(--accent-blue)',
                                        transition: 'width 1s ease'
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldAlert size={18} color="var(--accent-blue)" /> Recommendations
                        </h4>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                            {result.recommendations?.map((rec, i) => (
                                <li key={i} style={{ fontSize: '0.85rem', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>{rec}</li>
                            ))}
                            {(!result.recommendations || result.recommendations.length === 0) && (
                                <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No specific action required. Continue to monitor your environment.</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            {result?.error && (
                <div className="glass" style={{ color: 'var(--danger)', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)' }}>
                    {result.error}
                </div>
            )}


            {/* Recent Alerts Feed */}
            <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Recent Security Events (Database Live)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recentAlerts.length > 0 ? recentAlerts.map((alert, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <ShieldAlert size={20} color={alert.severity === 'High' ? 'var(--danger)' : 'var(--warning)'} />
                                <span>{alert.type}: {alert.description.substring(0, 40)}...</span>
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    )) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No active threats in database.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Threats;
