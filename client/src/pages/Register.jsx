import React, { useState } from 'react';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/';
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass" style={{ width: '400px', padding: '3rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ width: '60px', height: '60px', background: 'var(--accent-purple)', borderRadius: '12px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join the CyberShield security network</p>
                </div>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
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
                            required
                            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ background: 'var(--accent-purple)' }}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
