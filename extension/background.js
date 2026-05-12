console.log('[CyberShield] Background Service Worker INITIALIZING...');
const API_URL = 'http://localhost:5000/api/threats/analyze';


let strictModeEnabled = false;

// Scan cache to prevent multiple scans for the same URL in a short period
const recentScans = new Map();
const SCAN_COOLDOWN = 3000;

// Function to refresh state from storage
const refreshState = () => {
    return new Promise((resolve) => {
        chrome.storage.local.get(['strictModeEnabled'], (result) => {
            if (result.strictModeEnabled !== undefined) strictModeEnabled = result.strictModeEnabled;
            resolve();
        });
    });
};

// Listen for settings sync from the dashboard
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SYNC_AUTH') {
        strictModeEnabled = !!message.strictMode;
        console.log('[CyberShield] Settings synced. Strict Mode:', strictModeEnabled);
        chrome.storage.local.set({ strictModeEnabled });
    }
});

// Load on startup
refreshState();

// Heartbeat
setInterval(() => {
    console.log(`[CyberShield] Heartbeat - StrictMode: ${strictModeEnabled}`);
}, 30000);


// URL Normalization to prevent duplicate scans for the same site with minor variations
const normalizeUrl = (url) => {
    try {
        const u = new URL(url);
        let normalized = u.origin + u.pathname;
        if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
        return normalized.toLowerCase();
    } catch (e) {
        return url.toLowerCase();
    }
};

// Log all navigation attempts as early as possible
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId !== 0) return;
    console.log(`[CyberShield] [STAGING] onBeforeNavigate: ${details.url}`);
});

chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
    if (details.frameId !== 0) return;
    console.log(`[CyberShield] [STAGING] onDOMContentLoaded: ${details.url}`);
});

chrome.webNavigation.onErrorOccurred.addListener((details) => {
    if (details.frameId !== 0) return;
    console.log(`[CyberShield] [ERROR] Navigation Failed for ${details.url}: ${details.error}`);
});


// Using webNavigation.onCommitted instead of tabs.onUpdated

// This fires exactly once when the URL is committed for a navigation.
chrome.webNavigation.onCommitted.addListener(async (details) => {
    // Only scan the main frame (ignore sub-frames/ads)
    if (details.frameId !== 0) return;

    const url = details.url;
    console.log(`[CyberShield] Navigation detected: ${url}`);
    if (!url) return;


    // Standard exclusion list
    if (
        url.startsWith('chrome://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('edge://') ||
        url.startsWith('about:') ||
        url.includes('localhost:5173') ||
        url.includes('localhost:5000')
    ) {
        console.log(`[CyberShield] Skipping internal/local URL: ${url}`);
        return;
    }


    // --- Deduplication Logic (Enhanced) ---
    const normalizedUrl = normalizeUrl(url);
    const cacheKey = `${details.tabId}-${normalizedUrl}`;
    const now = Date.now();
    const lastScan = recentScans.get(cacheKey);

    if (lastScan && (now - lastScan < SCAN_COOLDOWN)) {
        console.log(`[CyberShield] Deduplicating scan for: ${normalizedUrl} (Last scan: ${now - lastScan}ms ago)`);
        return;
    }
    console.log(`[CyberShield] Cache miss for: ${normalizedUrl}`);

    recentScans.set(cacheKey, now);

    // Cleanup old cache entries
    if (recentScans.size > 100) {
        for (const [key, time] of recentScans.entries()) {
            if (now - time > SCAN_COOLDOWN * 10) recentScans.delete(key);
        }
    }
    // ---------------------------

    await refreshState();

    console.log(`[CyberShield] Triggering Scan: ${url}`);

    try {
        const headers = { 'Content-Type': 'application/json' };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ content: `Navigated to: ${url}`, url: url })
        });

        if (!response.ok) {
            console.error(`[CyberShield] API Error: ${response.status}`);
            return;
        }

        const data = await response.json();
        console.log('[CyberShield] API full response:', JSON.stringify(data));

        const shouldBlock = data.block || (data.isPhishing && strictModeEnabled);
        console.log(`[CyberShield] Decision - isPhishing: ${data.isPhishing}, strictModeLocal: ${strictModeEnabled}, serverBlock: ${data.block}, finalShouldBlock: ${shouldBlock}`);


        if (shouldBlock) {
            console.warn(`[CyberShield] BLOCKING URL: ${url}`);
            chrome.tabs.update(details.tabId, { url: 'chrome://newtab' }, (tab) => {
                if (chrome.runtime.lastError) {
                    console.error('[CyberShield] Tab update error:', chrome.runtime.lastError.message);
                }
            });

            chrome.notifications.create(`block-${Date.now()}`, {
                type: 'basic',
                iconUrl: 'icon.png',
                title: 'CyberShield: Threat Blocked!',
                message: `Strict Monitoring Mode automatically protected you from "${url}".`,
                priority: 2
            });
            return;
        }


        if (data.isPhishing) {
            console.warn(`[CyberShield] WARNING for URL: ${url}`);
            chrome.notifications.create(`threat-${Date.now()}`, {
                type: 'basic',
                iconUrl: 'icon.png',
                title: 'CyberShield: Phishing Warning',
                message: `WARNING: "${url}" has been flagged as suspicious by CyberShield AI.`,
                priority: 1
            });
        }
    } catch (error) {
        console.error('[CyberShield] Connection Failure:', error.message);
    }
});

// Fallback listener to see if we capture navigation differently
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(`[CyberShield] Tab ${tabId} Info: status=${changeInfo.status}, url=${changeInfo.url}`);
    if (changeInfo.url) {
        console.log(`[CyberShield] URL CHANGE DETECTED: ${changeInfo.url}`);
    }
});

// Watch for tab switches to ensure we wake up
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        console.log(`[CyberShield] Tab Switched To: ${tab.url}`);
    });
});


// Additional listeners for SPA-like navigation
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId !== 0) return;
    console.log(`[CyberShield] History State Updated: ${details.url}`);
});

chrome.webNavigation.onReferenceFragmentUpdated.addListener((details) => {
    if (details.frameId !== 0) return;
    console.log(`[CyberShield] Fragment Updated: ${details.url}`);
});


