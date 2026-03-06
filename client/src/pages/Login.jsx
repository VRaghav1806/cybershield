import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/'; // Refresh to update App state
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass" style={{ width: '400px', padding: '3rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ width: '60px', height: '60px', background: 'var(--accent-blue)', borderRadius: '12px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Secure Login</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Access your security dashboard</p>
                </div>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Authenticate'}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
