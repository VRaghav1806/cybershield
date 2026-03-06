import React from 'react';
import { LayoutDashboard, ShieldAlert, BarChart3, Settings, User, Lock, TrendingUp, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const menuItems = [
        { icon: <LayoutDashboard size={20} color="#00d4ff" />, label: 'Dashboard', path: '/' },
        { icon: <ShieldAlert size={20} color="#ff3366" />, label: 'Threats', path: '/threats' },
        { icon: <BarChart3 size={20} color="#00ff88" />, label: 'Analytics', path: '/analytics' },
        { icon: <Lock size={20} color="#fbbf24" />, label: 'Security Vault', path: '/vault' },
        { icon: <TrendingUp size={20} color="#a855f7" />, label: 'Security Score', path: '/score' },
        { icon: <User size={20} color="#06b6d4" />, label: 'Profile', path: '/profile' },
        { icon: <Settings size={20} color="#64748b" />, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="glass-dark" style={{ width: '260px', height: '100vh', padding: '2rem', position: 'fixed', left: isOpen ? 0 : '-260px', top: 0, transition: 'left 0.3s ease', zIndex: 1000 }}>
            <button
                onClick={() => setIsOpen(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-inverse-sec)', cursor: 'pointer' }}
            >
                <X size={24} />
            </button>
            <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={20} color="white" />
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #00d4ff, #00ffcc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CyberShield AI</h2>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {menuItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: isActive ? '#00d4ff' : 'var(--text-inverse-sec)',
                            background: isActive ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                            borderLeft: isActive ? '2px solid #00d4ff' : '2px solid transparent',
                            transition: 'all 0.3s ease'
                        })}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div style={{ position: 'absolute', bottom: '2rem', width: 'calc(100% - 4rem)' }}>
                <div style={{ background: 'rgba(0, 255, 136, 0.05)', padding: '1rem', textAlign: 'center', borderRadius: '8px', border: '1px solid rgba(0, 255, 136, 0.12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', color: '#00ff88' }}></div>
                        <p style={{ fontSize: '0.8rem', color: '#00ff88', fontWeight: '500' }}>System: Secure</p>
                    </div>
                    <div style={{ height: '3px', background: 'linear-gradient(90deg, #00ff88, #00d4ff)', borderRadius: '2px', marginTop: '8px', boxShadow: '0 0 8px rgba(0, 255, 136, 0.3)' }}></div>
                </div>
            </div>
        </aside >
    );
};

export default Sidebar;
