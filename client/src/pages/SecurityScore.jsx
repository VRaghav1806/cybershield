import React, { useState, useEffect } from 'react';
import { Activity, Zap, Shield, Target, TrendingUp, Loader2 } from 'lucide-react';
import axios from 'axios';

import API_BASE from '../api';

const SecurityScore = () => {
    const [stats, setStats] = useState(null);
    const [riskScore, setRiskScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, riskRes] = await Promise.all([
                    axios.get(`${API_BASE}/threats/stats`),
                    axios.get(`${API_BASE}/threats/risk-score`)
                ]);
                setStats(statsRes.data);
                setRiskScore(riskRes.data.riskScore);
            } catch (err) {
                console.error('Error fetching security stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-blue)" />
            </div>
        );
    }

    const metrics = [
        { label: 'Total Security Scans', value: stats?.totalScans || 0, status: 'Active', icon: <Zap size={20} color="#eccc68" /> },
        { label: 'Threats Neutralized', value: stats?.threatsBlocked || 0, status: 'Secure', icon: <Shield size={20} color="#2ed573" /> },
        { label: 'Network Uptime', value: stats?.uptime || '99.9%', status: 'Stable', icon: <Activity size={20} color="#70a1ff" /> },
        { label: 'Active Shield Agents', value: stats?.activeShields || 1200, status: 'Scaling', icon: <Target size={20} color="#ff4757" /> },
    ];

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp color="#00d4ff" /> Security Intelligence Score
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>Real-time health assessment and vulnerability tracking based on live traffic.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <section className="glass" style={{ padding: '2.5rem', borderRadius: '16px', gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontSize: '3.5rem', fontWeight: '800', margin: 0, color: riskScore > 70 ? 'var(--danger)' : 'var(--text-primary)' }}>
                            {riskScore}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Global Risk Index</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem', color: riskScore < 30 ? 'var(--success)' : (riskScore < 70 ? 'var(--warning)' : 'var(--danger)') }}>
                            <TrendingUp size={20} />
                            <span>System Status: {riskScore < 30 ? 'Pristine' : (riskScore < 70 ? 'Under Watch' : 'Critical Exposure')}</span>
                        </div>
                    </div>
                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        border: '8px solid rgba(255,255,255,0.05)',
                        borderTop: `8px solid ${riskScore < 30 ? 'var(--success)' : (riskScore < 70 ? 'var(--warning)' : 'var(--danger)')}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: `rotate(${riskScore * 3.6}deg)`,
                        transition: 'all 1s ease'
                    }}>
                        <span style={{ fontSize: '3.5rem', fontWeight: 'bold', transform: `rotate(-${riskScore * 3.6}deg)` }}>
                            {riskScore < 30 ? 'A+' : (riskScore < 50 ? 'B' : 'C')}
                        </span>
                    </div>
                </section>

                <section className="glass-dark" style={{ padding: '2rem', borderRadius: '16px' }}>
                    <h4 style={{ marginBottom: '1.5rem' }}>Real-time Performance Metrics</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {metrics.map((m, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {m.icon}
                                        <span style={{ fontSize: '0.9rem' }}>{m.label}</span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{m.value}</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min((typeof m.value === 'number' ? m.value / 100 : 90), 100)}%`,
                                        height: '100%',
                                        background: 'var(--accent-blue)',
                                        borderRadius: '3px'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h4 style={{ marginBottom: '1rem' }}>Intelligence Insights</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                    {/* Adaptive Defense Card — changes based on threat ratio */}
                    {(() => {
                        const scans = stats?.totalScans || 0;
                        const blocked = stats?.threatsBlocked || 0;
                        const ratio = scans > 0 ? (blocked / scans) * 100 : 0;
                        const isHigh = ratio > 30;
                        const isMid = ratio > 10;
                        const borderColor = isHigh ? 'var(--danger)' : isMid ? 'var(--warning)' : 'var(--success)';
                        const bgColor = isHigh ? 'rgba(255, 51, 102, 0.05)' : isMid ? 'rgba(251, 191, 36, 0.05)' : 'rgba(0, 255, 136, 0.05)';
                        const title = isHigh ? 'High Threat Activity' : isMid ? 'Moderate Threat Activity' : 'Adaptive Defense Active';
                        const desc = isHigh
                            ? `Warning: ${blocked} out of ${scans} scans detected threats (${ratio.toFixed(1)}% threat rate). Immediate review recommended.`
                            : isMid
                                ? `The AI engine analyzed ${scans} scans and isolated ${blocked} threats (${ratio.toFixed(1)}% rate). Monitoring continues.`
                                : `The AI engine has analyzed ${scans} logs and successfully isolated ${blocked} malicious payloads automatically. All systems nominal.`;
                        return (
                            <div style={{ padding: '1rem', borderLeft: `4px solid ${borderColor}`, background: bgColor, borderRadius: '0 8px 8px 0' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '0.4rem', color: borderColor }}>{title}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{desc}</p>
                            </div>
                        );
                    })()}

                    {/* System Health Card — changes based on riskScore */}
                    {(() => {
                        const score = riskScore;
                        const uptime = stats?.uptime || '99.9%';
                        const shields = stats?.activeShields || 0;
                        const isHealthy = score < 30;
                        const isDegraded = score < 70;
                        const borderColor = isHealthy ? 'var(--accent-blue)' : isDegraded ? 'var(--warning)' : 'var(--danger)';
                        const bgColor = isHealthy ? 'rgba(0, 212, 255, 0.05)' : isDegraded ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255, 51, 102, 0.05)';
                        const title = isHealthy ? 'System Health: Optimal' : isDegraded ? 'System Health: Degraded' : 'System Health: Critical';
                        const desc = isHealthy
                            ? `Infrastructure uptime is ${uptime}. All ${shields} virtual shield agents are operational and reporting nominal latency.`
                            : isDegraded
                                ? `Uptime at ${uptime} but risk index is elevated (${score}). ${shields} agents active — some may need attention.`
                                : `Critical alert: Risk index at ${score}. Uptime ${uptime} with ${shields} agents under stress. Immediate investigation required.`;
                        return (
                            <div style={{ padding: '1rem', borderLeft: `4px solid ${borderColor}`, background: bgColor, borderRadius: '0 8px 8px 0' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '0.4rem', color: borderColor }}>{title}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{desc}</p>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default SecurityScore;
