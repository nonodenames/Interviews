// Popup script for Paywall Bypasser extension

document.addEventListener('DOMContentLoaded', function() {
    initializePopup();
});

async function initializePopup() {
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Load settings
        await loadSettings();
        
        // Load statistics
        await loadStatistics();
        
        // Check current page status
        await checkCurrentPageStatus(tab);
        
        // Set up event listeners
        setupEventListeners(tab);
        
    } catch (error) {
        console.error('Error initializing popup:', error);
        updateStatus('Error loading extension', 'error');
    }
}

// Check if current page has paywall
async function checkCurrentPageStatus(tab) {
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'checkPaywall' });
        
        if (response && response.paywallDetected) {
            updateStatus('Paywall detected on this page', 'paywall');
        } else {
            updateStatus('No paywall detected', 'safe');
        }
    } catch (error) {
        // Content script might not be loaded yet
        updateStatus('Page status unknown', 'unknown');
    }
}

// Update status indicator
function updateStatus(message, type) {
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    
    statusText.textContent = message;
    
    // Remove existing classes
    statusIndicator.classList.remove('safe', 'paywall', 'unknown');
    
    // Add new class
    if (type !== 'error') {
        statusIndicator.classList.add(type);
    }
}

// Load settings from storage
async function loadSettings() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
        
        if (response) {
            document.getElementById('autoRedirectToggle').checked = response.autoRedirect || false;
            document.getElementById('showNotificationsToggle').checked = response.showNotifications !== false;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Load statistics from storage
async function loadStatistics() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getStats' });
        
        if (response) {
            document.getElementById('totalDetected').textContent = response.totalDetected || 0;
            document.getElementById('totalBypassed').textContent = response.totalBypassed || 0;
            
            // Update domains list
            updateDomainsList(response.domains || {});
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Update domains list
function updateDomainsList(domains) {
    const domainsList = document.getElementById('domainsList');
    
    // Sort domains by detection count
    const sortedDomains = Object.entries(domains)
        .sort((a, b) => b[1].detected - a[1].detected)
        .slice(0, 5); // Show top 5
    
    if (sortedDomains.length === 0) {
        domainsList.innerHTML = '<div class="no-domains">No domains detected yet</div>';
        return;
    }
    
    domainsList.innerHTML = sortedDomains.map(([domain, stats]) => `
        <div class="domain-item">
            <span class="domain-name">${domain}</span>
            <span class="domain-count">${stats.detected}</span>
        </div>
    `).join('');
}

// Set up event listeners
function setupEventListeners(tab) {
    // Open Archive button
    document.getElementById('openArchiveBtn').addEventListener('click', () => {
        const archiveUrl = `https://archive.ph/${encodeURIComponent(tab.url)}`;
        chrome.tabs.create({ url: archiveUrl });
        window.close();
    });
    
    // Check Archive button
    document.getElementById('checkArchiveBtn').addEventListener('click', () => {
        const checkUrl = `https://archive.ph/${encodeURIComponent(tab.url)}`;
        chrome.tabs.create({ url: checkUrl });
        window.close();
    });
    
    // Auto-redirect toggle
    document.getElementById('autoRedirectToggle').addEventListener('change', async (e) => {
        await updateSetting('autoRedirect', e.target.checked);
    });
    
    // Show notifications toggle
    document.getElementById('showNotificationsToggle').addEventListener('change', async (e) => {
        await updateSetting('showNotifications', e.target.checked);
    });
    
    // Help link
    document.getElementById('helpLink').addEventListener('click', (e) => {
        e.preventDefault();
        showHelp();
    });
    
    // Feedback link
    document.getElementById('feedbackLink').addEventListener('click', (e) => {
        e.preventDefault();
        showFeedback();
    });
}

// Update individual setting
async function updateSetting(key, value) {
    try {
        // Get current settings
        const currentSettings = await chrome.runtime.sendMessage({ action: 'getSettings' });
        
        // Update the specific setting
        const newSettings = { ...currentSettings, [key]: value };
        
        // Save updated settings
        await chrome.runtime.sendMessage({ 
            action: 'updateSettings', 
            settings: newSettings 
        });
        
        console.log(`Setting ${key} updated to:`, value);
    } catch (error) {
        console.error('Error updating setting:', error);
    }
}

// Show help information
function showHelp() {
    const helpContent = `
        <h3>How to use Paywall Bypasser:</h3>
        <ul>
            <li><strong>Automatic Detection:</strong> The extension automatically detects paywalls on news websites</li>
            <li><strong>Archive Access:</strong> Click the notification or use the "Open in Archive.ph" button to access archived versions</li>
            <li><strong>Auto-redirect:</strong> Enable this setting to automatically redirect to archived versions</li>
            <li><strong>Right-click Menu:</strong> Right-click on any page or link and select "Open in Archive.ph"</li>
        </ul>
        
        <h3>Supported Sites:</h3>
        <p>The extension works on most major news sites including NY Times, Wall Street Journal, Washington Post, Bloomberg, and many others.</p>
        
        <h3>Privacy:</h3>
        <p>This extension only stores anonymized statistics locally. No personal data is collected or transmitted.</p>
    `;
    
    showModal('Help', helpContent);
}

// Show feedback form
function showFeedback() {
    const feedbackContent = `
        <h3>Share Your Feedback</h3>
        <p>Help us improve the Paywall Bypasser extension!</p>
        
        <h4>Common Issues:</h4>
        <ul>
            <li>If a paywall isn't detected, try refreshing the page</li>
            <li>Some sites may use advanced detection methods</li>
            <li>Archive.ph might not have all articles archived</li>
        </ul>
        
        <h4>Feature Requests:</h4>
        <p>We're always looking to improve. Suggestions are welcome!</p>
        
        <h4>Contact:</h4>
        <p>For technical support or feedback, please visit our GitHub repository or Chrome Web Store page.</p>
    `;
    
    showModal('Feedback', feedbackContent);
}

// Show modal dialog
function showModal(title, content) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    `;
    
    modal.innerHTML = `
        <button style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #666;
        " onclick="this.closest('.modal-overlay').remove()">×</button>
        <h2 style="margin-bottom: 16px; color: #333;">${title}</h2>
        <div style="color: #555; line-height: 1.5;">${content}</div>
    `;
    
    overlay.className = 'modal-overlay';
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Utility function to format numbers
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}