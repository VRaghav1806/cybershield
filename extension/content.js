// Listen for changes in localStorage and sync with the extension background script
function syncAuthState() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token) {
        let strictMode = false;
        try {
            if (userStr) {
                const user = JSON.parse(userStr);
                strictMode = !!user.strictMode;
            }
        } catch (e) {
            console.error('[CyberShield] Error parsing user from localStorage', e);
        }

        chrome.runtime.sendMessage({
            type: 'SYNC_AUTH',
            token: token,
            strictMode: strictMode
        });
    }
}

// Initial sync
syncAuthState();

// Sync when storage changes (e.g. login/settings change)
window.addEventListener('storage', (e) => {
    if (e.key === 'token' || e.key === 'user') {
        syncAuthState();
    }
});

// Polyfill for internal React navigation that doesn't trigger 'storage' event
const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);
    if (key === 'token' || key === 'user') {
        syncAuthState();
    }
};
