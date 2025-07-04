// Paywall detection patterns and keywords
const PAYWALL_INDICATORS = [
  // Text-based indicators
  'subscribe to continue reading',
  'subscribe to read more',
  'login to continue',
  'sign up to continue',
  'premium content',
  'subscriber exclusive',
  'paywall',
  'subscription required',
  'this article is for subscribers',
  'upgrade to premium',
  'free article limit',
  'monthly limit exceeded',
  'register to continue',
  'become a member'
];

// CSS selectors for common paywall elements
const PAYWALL_SELECTORS = [
  '[class*="paywall"]',
  '[class*="subscription"]',
  '[class*="premium"]',
  '[id*="paywall"]',
  '[id*="subscription"]',
  '.piano-offer',
  '.offer-bar',
  '.subscription-wall',
  '.paywall-bar',
  '.premium-content',
  '.subscriber-only',
  '.registration-wall',
  '.meter-wall',
  '.article-limit'
];

// URLs that commonly have paywalls
const PAYWALL_DOMAINS = [
  'nytimes.com',
  'wsj.com',
  'washingtonpost.com',
  'ft.com',
  'economist.com',
  'theatlantic.com',
  'newyorker.com',
  'harpers.org',
  'bloomberg.com',
  'reuters.com',
  'medium.com'
];

let paywallDetected = false;

// Function to check for paywall indicators
function detectPaywall() {
  // Check domain
  const currentDomain = window.location.hostname.toLowerCase();
  const isDomainWithPaywall = PAYWALL_DOMAINS.some(domain => 
    currentDomain.includes(domain)
  );
  
  // Check for paywall text
  const bodyText = document.body ? document.body.innerText.toLowerCase() : '';
  const hasPaywallText = PAYWALL_INDICATORS.some(indicator => 
    bodyText.includes(indicator)
  );
  
  // Check for paywall elements
  const hasPaywallElements = PAYWALL_SELECTORS.some(selector => {
    try {
      return document.querySelector(selector) !== null;
    } catch (e) {
      return false;
    }
  });
  
  // Check for blurred content (common paywall technique)
  const blurredElements = document.querySelectorAll('[style*="blur"], .blurred, [class*="blur"]');
  const hasBlurredContent = blurredElements.length > 0;
  
  // Check for overlay elements
  const overlayElements = document.querySelectorAll('.overlay, [class*="overlay"], [style*="position: fixed"]');
  const hasOverlay = Array.from(overlayElements).some(el => {
    const style = window.getComputedStyle(el);
    return style.position === 'fixed' && style.zIndex > 1000;
  });
  
  return isDomainWithPaywall || hasPaywallText || hasPaywallElements || hasBlurredContent || hasOverlay;
}

// Function to show archive notification
function showArchiveNotification() {
  // Remove existing notification
  const existingNotification = document.getElementById('paywall-bypasser-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.id = 'paywall-bypasser-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
      cursor: pointer;
    ">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>🔓</span>
        <div>
          <strong>Paywall Detected!</strong><br>
          Click to view archived version
        </div>
        <button style="
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          margin-left: auto;
        " onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    </div>
  `;
  
  // Add click handler
  notification.onclick = () => {
    const archiveUrl = `https://archive.ph/${encodeURIComponent(window.location.href)}`;
    window.open(archiveUrl, '_blank');
  };
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

// Main detection function
function runPaywallDetection() {
  if (paywallDetected) return;
  
  const detected = detectPaywall();
  
  if (detected) {
    paywallDetected = true;
    console.log('Paywall detected on:', window.location.href);
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'paywallDetected',
      url: window.location.href,
      domain: window.location.hostname
    });
    
    // Show notification
    showArchiveNotification();
  }
}

// Run detection when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runPaywallDetection);
} else {
  runPaywallDetection();
}

// Also run detection after a delay to catch dynamic content
setTimeout(runPaywallDetection, 2000);
setTimeout(runPaywallDetection, 5000);

// Monitor for dynamic changes
const observer = new MutationObserver((mutations) => {
  if (paywallDetected) return;
  
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      // Run detection when new nodes are added
      setTimeout(runPaywallDetection, 500);
    }
  });
});

// Start observing
observer.observe(document.body || document.documentElement, {
  childList: true,
  subtree: true
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkPaywall') {
    sendResponse({ paywallDetected: paywallDetected });
  } else if (request.action === 'openArchive') {
    const archiveUrl = `https://archive.ph/${encodeURIComponent(window.location.href)}`;
    window.open(archiveUrl, '_blank');
  }
});