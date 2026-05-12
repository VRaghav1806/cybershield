import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, TrendingUp, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import axios from 'axios';

import API_BASE from '../api';

const StatCard = ({ icon, label, value, color }) => (
    <div className="glass" style={{ padding: '1.5rem', flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: color }}>{icon}</div>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{value}</h3>
    </div>
);

const Analytics = () => {
    const [stats, setStats] = useState({ weeklyActivity: [], totalScans: 0, threatsBlocked: 0, uptime: "99.99%" });
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const statsRes = await axios.get(`${API_BASE}/threats/stats`);
                setStats(statsRes.data);

                const alertsRes = await axios.get(`${API_BASE}/threats/alerts`);
                setAlerts(alertsRes.data);
            } catch (err) {
                console.error('Error fetching analytics data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 3000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading analytics data...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 color="#00ff88" /> System Analytics
            </h2>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <StatCard icon={<TrendingUp size={24} />} label="Total API Scans" value={stats.totalScans.toLocaleString()} color="#00d4ff" />
                <StatCard icon={<ShieldAlert size={24} />} label="Threats Stopped" value={stats.threatsBlocked.toLocaleString()} color="#ff3366" />
                <StatCard icon={<Activity size={24} />} label="Scanner Uptime" value={stats.uptime} color="#00ff88" />
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div className="glass" style={{ padding: '2rem', flex: 2, minWidth: '400px', height: '400px' }}>
                    <h3 style={{ marginBottom: '2rem' }}>Attack Volume vs Blocked (Weekly Aggregation)</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={stats.weeklyActivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                            <Bar dataKey="attacks" fill="var(--danger)" radius={[4, 4, 0, 0]} name="Total Scans" />
                            <Bar dataKey="blocked" fill="var(--success)" radius={[4, 4, 0, 0]} name="Threats Blocked" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass" style={{ padding: '2rem', flex: 1, minWidth: '300px', height: '400px', overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent Scan Activity Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {alerts.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No scan activity yet.</p>
                        ) : (
                            alerts.map((alert) => (
                                <div key={alert._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    {alert.type === 'Phishing' ? <AlertCircle color="var(--danger)" /> : <CheckCircle color="var(--success)" />}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{alert.type} Detected</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(alert.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', background: alert.severity === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: alert.severity === 'High' ? 'var(--danger)' : 'var(--success)' }}>
                                        {alert.severity} Risk
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
