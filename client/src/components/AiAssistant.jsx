import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Trash2, Minus, Zap, ShieldCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import API_BASE from '../api';

const renderContent = (content) => {
    if (!content) return null;
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const TypingIndicator = () => (
    <div style={{ display: 'flex', gap: '4px', padding: '12px', background: 'var(--bg-main)', borderRadius: '12px', alignSelf: 'flex-start', borderBottomLeftRadius: '4px' }}>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%' }} />
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%' }} />
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%' }} />
    </div>
);

const AiAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am CyberShield AI. How can I assist you with your security needs today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async (messageContent) => {
        const text = messageContent || input.trim();
        if (!text) return;

        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error communicating with the server.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was a network error.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'assistant', content: 'Hello! I am CyberShield AI. How can I assist you today?' }]);
    };

    const quickActions = [
        { label: 'Check Health', icon: <Activity size={14} />, prompt: 'What is my current security health?' },
        { label: 'Recent Threats', icon: <ShieldCheck size={14} />, prompt: 'Show me any recent high-priority threats.' },
        { label: 'System Scan', icon: <Zap size={14} />, prompt: 'How do I start a full system scan?' },
    ];

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
            {/* Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 45 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleChat}
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            color: '#fff',
                            border: '2px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
                        }}
                    >
                        <MessageSquare size={30} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="glass"
                        style={{
                            width: '400px',
                            height: '600px',
                            borderRadius: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.1), 0 24px 60px rgba(0, 0, 0, 0.6)',
                            background: 'rgba(25, 25, 40, 0.95)',
                            border: '1px solid rgba(139, 92, 246, 0.5)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.2rem',
                            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(139, 92, 246, 0.3)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)'
                                }}>
                                    <Bot size={18} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'white' }}>CyberShield AI</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Active Monitoring</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={clearChat} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }} title="Clear Chat">
                                    <Trash2 size={18} />
                                </button>
                                <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
                                    <Minus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            style={{
                                flex: 1,
                                padding: '1.5rem',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.2rem',
                                scrollBehavior: 'smooth'
                            }}
                            className="custom-scrollbar"
                        >
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                                            : 'rgba(139, 92, 246, 0.15)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '16px',
                                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                                        borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                                        fontSize: '0.92rem',
                                        lineHeight: '1.5',
                                        boxShadow: msg.role === 'user' ? '0 4px 15px rgba(139, 92, 246, 0.3)' : '0 4px 15px rgba(139, 92, 246, 0.1)',
                                        border: msg.role === 'assistant' ? '1px solid rgba(139, 92, 246, 0.3)' : 'none',
                                        whiteSpace: 'pre-wrap', // Preserve newlines
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {renderContent(msg.content)}
                                </motion.div>
                            ))}
                            {isLoading && <TypingIndicator />}
                        </div>

                        {/* Quick Actions */}
                        {!isLoading && messages.length < 4 && (
                            <div style={{ display: 'flex', gap: '8px', padding: '0 1.5rem 1rem', flexWrap: 'wrap' }}>
                                {quickActions.map((action, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.05, background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSend(action.prompt)}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: '20px',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.25)',
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            fontSize: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 10px rgba(139, 92, 246, 0.05)'
                                        }}
                                    >
                                        {action.icon}
                                        {action.label}
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            style={{
                                padding: '1.2rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                gap: '12px'
                            }}
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Consult CyberShield AI..."
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                                disabled={isLoading}
                            />
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                disabled={isLoading || !input.trim()}
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    width: '45px',
                                    height: '45px',
                                    cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: (isLoading || !input.trim()) ? 0.5 : 1
                                }}
                            >
                                <Send size={20} />
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default AiAssistant;
