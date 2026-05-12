const base = (import.meta.env.VITE_API_URL || 'https://cybershield-server-a9wd.onrender.com').replace(/\/$/, '');
const API_BASE = base.endsWith('/api') ? base : `${base}/api`;

export default API_BASE;
