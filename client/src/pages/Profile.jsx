import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Edit2, Save, X, Activity, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

import API_BASE from '../api';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalScans: 0, threatsBlocked: 0, activityData: [], uptime: '99.99%' });
    const [alerts, setAlerts] = useState([]);
    const [editing, setEditing] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [saveMsg, setSaveMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, alertsRes] = await Promise.all([
                    axios.get(`${API_BASE}/threats/stats`),
                    axios.get(`${API_BASE}/threats/alerts`)
                ]);
                setStats(statsRes.data);
                setAlerts(alertsRes.data);

                // No more auth/me, use generic profile
                setUser({ 
                    username: 'CyberShield Admin', 
                    email: 'system@cybershield.ai', 
                    role: 'Administrator', 
                    createdAt: '2026-01-01T00:00:00Z' 
                });
                setEditUsername('CyberShield Admin');
            } catch (err) {
                console.error('Data fetch failed:', err);
                setUser({ 
                    username: 'System User', 
                    email: 'admin@cybershield.ai', 
                    role: 'Admin', 
                    createdAt: new Date().toISOString() 
                });
                setEditUsername('System User');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSave = () => {
        setUser(prev => ({ ...prev, username: editUsername }));
        setEditing(false);
        setSaveMsg('Profile updated!');
        setTimeout(() => setSaveMsg(''), 3000);
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const safeScans = stats.totalScans - stats.threatsBlocked;
    const protectionRate = stats.totalScans > 0 ? Math.round((stats.threatsBlocked / stats.totalScans) * 100) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User color="#06b6d4" /> My Profile
                </h2>
                {saveMsg && <span style={{ color: 'var(--success)', fontWeight: '600' }}>✓ {saveMsg}</span>}
            </div>

            {/* Top Row: Identity + Stats */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Identity Card */}
                <div className="glass" style={{ padding: '2rem', flex: '1 1 350px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={36} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {editing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <input value={editUsername} onChange={e => setEditUsername(e.target.value)}
                                    style={{ fontSize: '1.2rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 10px', color: 'var(--text-primary)', outline: 'none', width: '140px' }} />
                                <button onClick={handleSave} style={{ background: 'var(--success)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}><Save size={15} color="white" /></button>
                                <button onClick={() => { setEditing(false); setEditUsername(user.username); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}><X size={15} color="white" /></button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>{user?.username}</h3>
                                <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px', cursor: 'pointer' }}><Edit2 size={13} color="var(--text-secondary)" /></button>
                                <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', background: 'rgba(124,58,237,0.2)', border: '1px solid var(--accent-purple)', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-purple)', textTransform: 'capitalize' }}>{user?.role}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={13} /> {user?.email}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={13} /> Member since {memberSince}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'flex', gap: '1rem', flex: '1 1 300px', flexWrap: 'wrap' }}>
                    {[
                        { icon: <Zap size={20} />, label: 'Total Scans', value: stats.totalScans, color: '#00d4ff' },
                        { icon: <AlertTriangle size={20} />, label: 'Threats Blocked', value: stats.threatsBlocked, color: '#ff3366' },
                        { icon: <CheckCircle size={20} />, label: 'Safe Scans', value: safeScans, color: '#00ff88' },
                        { icon: <Shield size={20} />, label: 'Protection Rate', value: `${protectionRate}%`, color: '#a855f7' },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            className="glass"
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.15 * i, duration: 0.5, type: 'spring', stiffness: 120 }}
                            whileHover={{
                                scale: 1.06,
                                boxShadow: `0 0 25px ${s.color}40`,
                                borderColor: `${s.color}60`,
                            }}
                            style={{ padding: '1.2rem', flex: '1 1 120px', minWidth: '120px', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                        >
                            <motion.div
                                style={{ color: s.color, marginBottom: '8px' }}
                                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                                transition={{ delay: 0.8 + 0.15 * i, duration: 0.6 }}
                            >
                                {s.icon}
                            </motion.div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</p>
                            <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 'bold', color: s.color }}>{s.value}</h3>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom Row: Activity Chart + Recent Scans + Security */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Activity chart */}
                <div className="glass" style={{ padding: '1.5rem', flex: '2 1 400px', height: '340px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem' }}>My Scan Activity (Last 24h)</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <AreaChart data={stats.activityData}>
                            <defs>
                                <linearGradient id="profileGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.85rem' }} />
                            <Area type="monotone" dataKey="blocked" name="Threats Blocked" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#profileGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1 1 280px' }}>
                    {/* Recent Scans */}
                    <div className="glass" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', maxHeight: '200px' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} color="#38bdf8" /> Recent Scans</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {alerts.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No scans yet.</p>
                            ) : alerts.slice(0, 6).map(alert => (
                                <div key={alert._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                    {alert.type === 'Phishing'
                                        ? <AlertTriangle size={14} color="#ef4444" />
                                        : <CheckCircle size={14} color="#10b981" />}
                                    <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.type}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Overview */}
                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} color="#38bdf8" /> Security Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { label: 'AI Protection', status: 'Active', color: '#10b981' },
                                { label: 'Browser Scanner', status: 'Active', color: '#10b981' },
                                { label: 'Notifications', status: 'Enabled', color: '#2563eb' },
                                { label: 'System Uptime', status: stats.uptime, color: '#7c3aed' },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: `1px solid rgba(255,255,255,0.05)` }}>
                                    <span style={{ fontSize: '0.85rem' }}>{s.label}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: s.color }}>● {s.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
