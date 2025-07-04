// Background service worker for Paywall Bypasser extension

// Storage keys
const STORAGE_KEYS = {
  PAYWALL_STATS: 'paywallStats',
  SETTINGS: 'settings',
  WHITELIST: 'whitelist'
};

// Default settings
const DEFAULT_SETTINGS = {
  autoRedirect: false,
  showNotifications: true,
  enableStats: true
};

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Paywall Bypasser extension installed');
  
  // Initialize storage
  chrome.storage.sync.get([STORAGE_KEYS.SETTINGS, STORAGE_KEYS.PAYWALL_STATS], (result) => {
    if (!result[STORAGE_KEYS.SETTINGS]) {
      chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS
      });
    }
    
    if (!result[STORAGE_KEYS.PAYWALL_STATS]) {
      chrome.storage.sync.set({
        [STORAGE_KEYS.PAYWALL_STATS]: {
          totalDetected: 0,
          totalBypassed: 0,
          domains: {}
        }
      });
    }
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'paywallDetected') {
    handlePaywallDetected(request, sender);
  } else if (request.action === 'getArchiveUrl') {
    const archiveUrl = `https://archive.ph/${encodeURIComponent(request.url)}`;
    sendResponse({ archiveUrl });
  } else if (request.action === 'getSettings') {
    chrome.storage.sync.get([STORAGE_KEYS.SETTINGS], (result) => {
      sendResponse(result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS);
    });
    return true; // Keep message channel open for async response
  } else if (request.action === 'updateSettings') {
    chrome.storage.sync.set({
      [STORAGE_KEYS.SETTINGS]: request.settings
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  } else if (request.action === 'getStats') {
    chrome.storage.sync.get([STORAGE_KEYS.PAYWALL_STATS], (result) => {
      sendResponse(result[STORAGE_KEYS.PAYWALL_STATS] || {
        totalDetected: 0,
        totalBypassed: 0,
        domains: {}
      });
    });
    return true;
  }
});

// Handle paywall detection
function handlePaywallDetected(request, sender) {
  console.log('Paywall detected on:', request.url);
  
  // Update statistics
  updatePaywallStats(request.domain);
  
  // Update badge
  updateBadge(sender.tab.id);
  
  // Check settings for auto-redirect
  chrome.storage.sync.get([STORAGE_KEYS.SETTINGS], (result) => {
    const settings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
    
    if (settings.autoRedirect) {
      // Auto-redirect to archive.ph
      const archiveUrl = `https://archive.ph/${encodeURIComponent(request.url)}`;
      chrome.tabs.update(sender.tab.id, { url: archiveUrl });
      
      // Update bypass stats
      updateBypassStats(request.domain);
    }
  });
}

// Update paywall statistics
function updatePaywallStats(domain) {
  chrome.storage.sync.get([STORAGE_KEYS.PAYWALL_STATS], (result) => {
    const stats = result[STORAGE_KEYS.PAYWALL_STATS] || {
      totalDetected: 0,
      totalBypassed: 0,
      domains: {}
    };
    
    stats.totalDetected++;
    
    if (!stats.domains[domain]) {
      stats.domains[domain] = { detected: 0, bypassed: 0 };
    }
    stats.domains[domain].detected++;
    
    chrome.storage.sync.set({
      [STORAGE_KEYS.PAYWALL_STATS]: stats
    });
  });
}

// Update bypass statistics
function updateBypassStats(domain) {
  chrome.storage.sync.get([STORAGE_KEYS.PAYWALL_STATS], (result) => {
    const stats = result[STORAGE_KEYS.PAYWALL_STATS] || {
      totalDetected: 0,
      totalBypassed: 0,
      domains: {}
    };
    
    stats.totalBypassed++;
    
    if (!stats.domains[domain]) {
      stats.domains[domain] = { detected: 0, bypassed: 0 };
    }
    stats.domains[domain].bypassed++;
    
    chrome.storage.sync.set({
      [STORAGE_KEYS.PAYWALL_STATS]: stats
    });
  });
}

// Update extension badge
function updateBadge(tabId) {
  chrome.action.setBadgeText({
    text: '!',
    tabId: tabId
  });
  
  chrome.action.setBadgeBackgroundColor({
    color: '#FF6B6B',
    tabId: tabId
  });
  
  // Clear badge after 10 seconds
  setTimeout(() => {
    chrome.action.setBadgeText({
      text: '',
      tabId: tabId
    });
  }, 10000);
}

// Context menu for manual archive access
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openInArchive',
    title: 'Open in Archive.ph',
    contexts: ['page', 'link']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openInArchive') {
    const url = info.linkUrl || info.pageUrl || tab.url;
    const archiveUrl = `https://archive.ph/${encodeURIComponent(url)}`;
    chrome.tabs.create({ url: archiveUrl });
    
    // Update bypass stats
    const domain = new URL(url).hostname;
    updateBypassStats(domain);
  }
});

// Clear badge when tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.action.setBadgeText({
    text: '',
    tabId: activeInfo.tabId
  });
});

// Clear badge when navigating to new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({
      text: '',
      tabId: tabId
    });
  }
});