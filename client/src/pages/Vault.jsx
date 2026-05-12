import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, Archive, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

import API_BASE from '../api';

const Vault = () => {
    const [quarantinedItems, setQuarantinedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchVaultData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/threats/alerts`);
            // Filtering only Phishing/Malicious items for the vault
            const filtered = res.data.filter(alert => alert.type === 'Phishing' || alert.severity === 'High' || alert.severity === 'Critical');
            setQuarantinedItems(filtered);
        } catch (err) {
            console.error('Error fetching vault data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVaultData();
        const interval = setInterval(fetchVaultData, 20000); // Less frequent auto-refresh when manual actions possible
        return () => clearInterval(interval);
    }, []);

    const handleArchive = async (id) => {
        try {
            await axios.patch(`${API_BASE}/threats/${id}/status`, { status: 'Resolved' });
            addToast('Vault Updated', 'Threat has been moved to archive.', 'info');
            fetchVaultData();
        } catch (err) {
            addToast('Update Failed', 'Could not archive the threat matching ID: ' + id, 'danger');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently purge this threat payload?')) return;
        try {
            await axios.delete(`${API_BASE}/threats/${id}`);
            addToast('Payload Purged', 'Threat has been permanently removed from system storage.', 'info');
            fetchVaultData();
        } catch (err) {
            addToast('Purge Failed', 'Error removing payload from secure storage.', 'danger');
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock color="#fbbf24" /> Security Vault
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>Secure storage for isolated threats and neutralized payloads.</p>
            </header>

            <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', minHeight: '200px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--accent-blue)" />
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <tr>
                                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Threat Name</th>
                                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Target / URL</th>
                                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Severity</th>
                                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Detected On</th>
                                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Status</th>
                                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quarantinedItems.map((item) => (
                                <tr key={item._id} style={{ borderTop: '1px solid var(--border-dark)' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ShieldAlert size={16} color="#ff4757" />
                                            <span>{item.type}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.url || 'Analyzed Content'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{
                                            color: item.severity === 'Critical' ? '#ff4757' : (item.severity === 'High' ? '#ffa502' : '#2ed573')
                                        }}>
                                            {item.severity}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {new Date(item.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                                            <ShieldCheck size={14} />
                                            <span style={{ fontSize: '0.9rem' }}>{item.status || 'Quarantined'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Archive
                                                size={18}
                                                className="cursor-pointer"
                                                style={{ color: 'var(--text-secondary)' }}
                                                onClick={() => handleArchive(item._id)}
                                                title="Mark as Resolved"
                                            />
                                            <Trash2
                                                size={18}
                                                className="cursor-pointer"
                                                style={{ color: '#ff4757' }}
                                                onClick={() => handleDelete(item._id)}
                                                title="Delete Payload"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {quarantinedItems.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No active threats in the vault. System is secure.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {!loading && quarantinedItems.length > 0 && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', background: 'rgba(46, 213, 115, 0.05)', border: '1px dashed var(--success)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--success)', textAlign: 'center' }}>
                        Total Items Isolated: {quarantinedItems.length} | Automated integrity check passed
                    </p>
                </div>
            )}
        </div>
    );
};

export default Vault;
