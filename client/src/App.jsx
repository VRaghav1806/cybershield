import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Threats from './pages/Threats';
import AiAssistant from './components/AiAssistant';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Vault from './pages/Vault';
import SecurityScore from './pages/SecurityScore';

import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import NotificationManager from './components/NotificationManager';

const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <ThemeProvider>
            <ToastProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', position: 'relative', overflow: 'hidden' }}>
                        {/* Ambient Background Glows — Cyber Neon */}
                        <motion.div
                            animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.15, 1] }}
                            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ position: 'fixed', top: '-15%', left: '-5%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(0, 212, 255, 0.12) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}
                        />
                        <motion.div
                            animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.2, 1] }}
                            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                            style={{ position: 'fixed', bottom: '-15%', right: '-5%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}
                        />
                        <motion.div
                            animate={{ opacity: [0.1, 0.25, 0.1] }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
                            style={{ position: 'fixed', top: '40%', right: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0, 255, 136, 0.06) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}
                        />
                        {/* Scanline overlay */}
                        <div style={{
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 212, 255, 0.008) 2px, rgba(0, 212, 255, 0.008) 4px)',
                            pointerEvents: 'none', zIndex: 0
                        }} />

                        <div style={{ zIndex: 1, display: 'flex', width: '100%' }}>
                            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                            <NotificationManager />
                            <main style={{ marginLeft: isSidebarOpen ? '260px' : '0', flex: 1, padding: '2rem', transition: 'margin 0.3s ease' }}>
                                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <button
                                            onClick={() => setIsSidebarOpen(true)}
                                            style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', display: isSidebarOpen ? 'none' : 'block' }}
                                        >
                                            <Menu size={28} />
                                        </button>
                                        <div>
                                            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple), var(--accent-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CyberShield Command Center</h1>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '0.5px' }}>AI-Powered Security Monitoring</p>
                                        </div>
                                    </div>
                                    <div className="glass" style={{ padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderColor: 'rgba(0, 255, 136, 0.15)' }}>
                                        <div className="status-dot" style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', color: 'var(--success)' }}></div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--success)', letterSpacing: '0.3px' }}>Secure Pipeline Active</span>
                                    </div>
                                </header>

                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/threats" element={<Threats />} />
                                        <Route path="/analytics" element={<Analytics />} />
                                        <Route path="/settings" element={<Settings />} />
                                        <Route path="/profile" element={<Profile />} />
                                        <Route path="/vault" element={<Vault />} />
                                        <Route path="/score" element={<SecurityScore />} />
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </div>
                                <AiAssistant />
                            </main>
                        </div>
                    </div>
                </Router>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;
