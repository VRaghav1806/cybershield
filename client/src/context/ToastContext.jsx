import React, { createContext, useContext, useState, useCallback } from 'react';
import { ShieldAlert, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((title, message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 9999 }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className="glass-dark"
                        style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${toast.type === 'danger' ? 'var(--danger)' : 'var(--accent-blue)'}`,
                            minWidth: '300px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1rem',
                            animation: 'slideIn 0.3s ease forwards',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}
                    >
                        {toast.type === 'danger' ? <ShieldAlert color="var(--danger)" /> : <Info color="var(--accent-blue)" />}
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, marginBottom: '4px', fontSize: '1rem', color: 'var(--text-inverse)' }}>{toast.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-inverse-sec)' }}>{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-inverse-sec)', cursor: 'pointer', padding: '0' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
