console.log('[CyberShield] Content Script Loaded & Running');

function syncSettings() {
    const strictModeStr = localStorage.getItem('strictMode');
    const strictMode = strictModeStr === 'true' || strictModeStr === 'JSON.parse(true)';
    
    console.log('[CyberShield] Syncing Strict Mode:', strictMode);
    chrome.runtime.sendMessage({
        type: 'SYNC_AUTH',
        strictMode: !!JSON.parse(strictModeStr || 'false')
    });
}

// Initial sync
syncSettings();

// Listen for messages from the React app
window.addEventListener('message', (event) => {
    if (event.data.type === 'SYNC_SETTINGS') {
        console.log('[CyberShield] Received Sync Message from App:', event.data);
        chrome.runtime.sendMessage({ 
            type: 'SYNC_AUTH', 
            strictMode: !!event.data.strictMode 
        });
    }
});

// Sync when storage changes
window.addEventListener('storage', (e) => {
    if (e.key === 'strictMode') {
        syncSettings();
    }
});
