import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
    cyberNeon: {
        name: 'Cyber Neon',
        description: 'Neon green & cyan accents',
        preview: ['#050510', '#00d4ff', '#00ff88'],
        vars: {
            '--bg-main': '#020617',
            '--card-bg': 'rgba(15, 23, 42, 0.4)',
            '--sidebar-bg': 'rgba(2, 6, 23, 0.95)',
            '--border': 'rgba(0, 255, 200, 0.08)',
            '--border-dark': 'rgba(0, 255, 200, 0.12)',
            '--border-glow': 'rgba(0, 200, 255, 0.15)',
            '--accent-blue': '#00d4ff',
            '--accent-purple': '#8b5cf6',
            '--accent-teal': '#00ffcc',
            '--success': '#00ff88',
            '--warning': '#fbbf24',
            '--danger': '#ff3366',
            '--text-primary': '#e2e8f0',
            '--text-secondary': '#64748b',
            '--bg-glow-1': 'rgba(0, 212, 255, 0.06)',
            '--bg-glow-2': 'rgba(139, 92, 246, 0.05)',
            '--bg-glow-3': 'rgba(0, 255, 136, 0.04)',
            '--bg-grid-color': 'rgba(0, 212, 255, 0.03)',
        }
    },
    midnightBlue: {
        name: 'Midnight Blue',
        description: 'Cool blue & electric tones',
        preview: ['#0a0e1a', '#3b82f6', '#60a5fa'],
        vars: {
            '--bg-main': '#080c1d',
            '--card-bg': 'rgba(15, 23, 42, 0.6)',
            '--sidebar-bg': 'rgba(8, 12, 29, 0.95)',
            '--border': 'rgba(59, 130, 246, 0.1)',
            '--border-dark': 'rgba(59, 130, 246, 0.15)',
            '--border-glow': 'rgba(59, 130, 246, 0.2)',
            '--accent-blue': '#3b82f6',
            '--accent-purple': '#6366f1',
            '--accent-teal': '#60a5fa',
            '--success': '#22c55e',
            '--warning': '#f59e0b',
            '--danger': '#ef4444',
            '--text-primary': '#e2e8f0',
            '--text-secondary': '#94a3b8',
            '--bg-glow-1': 'rgba(59, 130, 246, 0.08)',
            '--bg-glow-2': 'rgba(96, 165, 250, 0.06)',
            '--bg-glow-3': 'rgba(34, 197, 94, 0.02)',
            '--bg-grid-color': 'rgba(59, 130, 246, 0.04)',
        }
    },
    stealthDark: {
        name: 'Stealth Dark',
        description: 'Minimal dark with red accents',
        preview: ['#0c0c0c', '#ef4444', '#a855f7'],
        vars: {
            '--bg-main': '#0a0a0a',
            '--card-bg': 'rgba(23, 23, 23, 0.7)',
            '--sidebar-bg': 'rgba(10, 10, 10, 0.98)',
            '--border': 'rgba(255, 255, 255, 0.06)',
            '--border-dark': 'rgba(255, 255, 255, 0.08)',
            '--border-glow': 'rgba(239, 68, 68, 0.15)',
            '--accent-blue': '#ef4444',
            '--accent-purple': '#a855f7',
            '--accent-teal': '#f97316',
            '--success': '#22c55e',
            '--warning': '#f59e0b',
            '--danger': '#ef4444',
            '--text-primary': '#fafafa',
            '--text-secondary': '#737373',
            '--bg-glow-1': 'rgba(239, 68, 68, 0.07)',
            '--bg-glow-2': 'rgba(168, 85, 247, 0.05)',
            '--bg-glow-3': 'rgba(249, 115, 22, 0.03)',
            '--bg-grid-color': 'rgba(255, 255, 255, 0.02)',
        }
    }
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('cybershield-theme') || 'cyberNeon';
    });

    useEffect(() => {
        const theme = themes[currentTheme];
        if (theme) {
            const root = document.documentElement;
            Object.entries(theme.vars).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
            localStorage.setItem('cybershield-theme', currentTheme);
        }
    }, [currentTheme]);

    return (
        <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
