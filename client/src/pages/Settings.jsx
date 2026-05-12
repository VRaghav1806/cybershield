import React, { useState } from 'react';
import { Save, Shield, Bell, Lock, Palette, Monitor } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
    const [notifications, setNotifications] = useState(true);
    const [strictMode, setStrictMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const { currentTheme, setCurrentTheme, themes } = useTheme();

    React.useEffect(() => {
        const savedSettings = localStorage.getItem('cybershield_settings');
        if (savedSettings) {
            const { strictMode: savedStrict } = JSON.parse(savedSettings);
            setStrictMode(savedStrict);
        }
        setLoading(false);
    }, []);

    const handleSave = () => {
        setLoading(true);
        try {
            const settings = { strictMode };
            localStorage.setItem('cybershield_settings', JSON.stringify(settings));
            
            // Sync with extension if needed
            window.postMessage({ type: 'SYNC_AUTH', strictMode }, '*');

            alert('Settings saved locally!');
        } catch (err) {
            console.error('Error saving settings:', err);
            alert(`Failed to save settings: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const ToggleSwitch = ({ checked, onChange, activeColor = 'var(--accent-blue)' }) => (
        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
            <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: checked ? activeColor : 'rgba(255,255,255,0.1)',
                transition: '.4s', borderRadius: '34px',
                boxShadow: checked ? `0 0 12px ${activeColor}40` : 'none'
            }}>
                <span style={{
                    position: 'absolute', content: '""', height: '20px', width: '20px',
                    left: checked ? '26px' : '4px', bottom: '4px', backgroundColor: 'white',
                    transition: '.4s', borderRadius: '50%'
                }} />
            </span>
        </label>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Monitor color="var(--accent-blue)" /> System Settings
                </h2>
                <button
                    onClick={handleSave}
                    className="glass"
                    style={{
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--success)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        fontWeight: '600'
                    }}
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>

            {/* Theme Selector */}
            <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <Palette size={20} color="var(--accent-purple)" /> UI Theme
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Choose a visual theme for your command center.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {Object.entries(themes).map(([key, theme]) => (
                        <div
                            key={key}
                            onClick={() => setCurrentTheme(key)}
                            style={{
                                padding: '1.2rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                background: currentTheme === key ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                                border: currentTheme === key
                                    ? `2px solid ${theme.preview[1]}`
                                    : '2px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.3s ease',
                                boxShadow: currentTheme === key ? `0 0 20px ${theme.preview[1]}20` : 'none',
                            }}
                        >
                            {/* Color preview dots */}
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                                {theme.preview.map((color, i) => (
                                    <div key={i} style={{
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        background: color,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: currentTheme === key ? `0 0 8px ${color}40` : 'none'
                                    }} />
                                ))}
                            </div>
                            <h4 style={{
                                fontSize: '0.95rem',
                                marginBottom: '4px',
                                color: currentTheme === key ? theme.preview[1] : 'var(--text-primary)'
                            }}>
                                {theme.name}
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                {theme.description}
                            </p>
                            {currentTheme === key && (
                                <div style={{
                                    marginTop: '10px', fontSize: '0.75rem', fontWeight: '600',
                                    color: theme.preview[1], display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.preview[1] }} />
                                    Active
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Preferences */}
            <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <Shield size={20} color="var(--accent-blue)" /> Security Preferences
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div>
                        <h4 style={{ marginBottom: '4px' }}>Strict Monitoring Mode</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Block all suspicious requests immediately without manual review.</p>
                    </div>
                    <ToggleSwitch checked={strictMode} onChange={() => setStrictMode(!strictMode)} activeColor="var(--danger)" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ marginBottom: '4px' }}>Real-time Notifications</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Receive instant alerts when critical threats are detected.</p>
                    </div>
                    <ToggleSwitch checked={notifications} onChange={() => setNotifications(!notifications)} />
                </div>
            </div>
        </div>
    );
};

export default Settings;
