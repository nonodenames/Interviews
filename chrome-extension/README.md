# Paywall Bypasser Chrome Extension

A Chrome browser extension that automatically detects paywalls on news websites and provides quick access to archived versions via archive.ph.

## 🔓 Features

- **Automatic Paywall Detection**: Intelligently detects paywalls on major news sites
- **One-Click Archive Access**: Instantly access archived versions of articles
- **Auto-Redirect Option**: Automatically redirect to archived versions when paywalls are detected
- **Smart Notifications**: Get notified when a paywall is detected with an option to view the archived version
- **Usage Statistics**: Track how many paywalls you've encountered and bypassed
- **Right-Click Menu**: Quickly archive any page or link via context menu
- **Privacy-Focused**: No data collection or tracking

## 🌐 Supported Sites

The extension works on most major news websites including:
- New York Times
- Wall Street Journal
- Washington Post
- Financial Times
- The Economist
- The Atlantic
- The New Yorker
- Bloomberg
- Reuters
- Medium
- And many more!

## 📥 Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `chrome-extension` folder
5. The extension should now appear in your extensions list

### Method 2: Create Icons First (Optional)

Before installing, you may want to create proper icons:

1. Open `create-icons.html` in your browser
2. Download the generated icon files or create your own
3. Place them in the `icons/` folder with the following names:
   - `icon16.png`
   - `icon32.png`
   - `icon48.png`
   - `icon128.png`

## 🚀 Usage

### Automatic Detection
- Visit any news website with a paywall
- The extension will automatically detect paywalls and show a notification
- Click the notification to view the archived version

### Manual Access
- Click the extension icon in the toolbar to open the popup
- Use "Open in Archive.ph" to manually access the archived version
- Use "Check if Archived" to see if the current page is already archived

### Settings
- **Auto-redirect**: Automatically redirect to archived versions when paywalls are detected
- **Show notifications**: Display notification popups when paywalls are found

### Right-Click Menu
- Right-click on any page or link
- Select "Open in Archive.ph" to view the archived version

## 🔧 Configuration

The extension provides several configuration options in the popup:

- **Auto-redirect to archive**: When enabled, automatically redirects to archive.ph when a paywall is detected
- **Show notifications**: Controls whether to show notification popups
- **Statistics tracking**: View stats on paywalls detected and articles accessed

## 📊 How It Works

1. **Detection**: The extension scans web pages for common paywall indicators:
   - Text patterns (e.g., "subscribe to continue", "premium content")
   - CSS selectors (paywall-related class names and IDs)
   - Domain-based detection for known paywall sites
   - Visual indicators (blurred content, overlays)

2. **Archive Access**: When a paywall is detected:
   - Creates an archive.ph URL for the current page
   - Provides quick access via notification or popup
   - Optionally auto-redirects based on user preferences

3. **Statistics**: Tracks usage anonymously:
   - Number of paywalls detected
   - Number of articles accessed via archive
   - Most frequent domains encountered

## 🛠️ Development

### File Structure
```
chrome-extension/
├── manifest.json          # Extension manifest
├── content.js            # Content script for paywall detection
├── background.js         # Background service worker
├── popup.html           # Extension popup interface
├── popup.css            # Popup styling
├── popup.js             # Popup functionality
├── create-icons.html    # Icon generation tool
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

### Key Components

- **Content Script** (`content.js`): Runs on all web pages to detect paywalls
- **Background Script** (`background.js`): Handles extension lifecycle and communication
- **Popup** (`popup.html/css/js`): User interface for settings and manual controls
- **Manifest** (`manifest.json`): Extension configuration and permissions

### Adding New Paywall Patterns

To add support for new sites or detection patterns:

1. Edit `content.js`
2. Add domain to `PAYWALL_DOMAINS` array
3. Add text patterns to `PAYWALL_INDICATORS` array
4. Add CSS selectors to `PAYWALL_SELECTORS` array

## 🔒 Privacy

This extension:
- ✅ Only stores anonymized statistics locally
- ✅ Does not collect or transmit personal data
- ✅ Does not track browsing history
- ✅ Only accesses page content to detect paywalls
- ✅ All data stays on your device

## ⚠️ Disclaimer

This extension is for educational and research purposes. Users should:
- Respect website terms of service
- Support quality journalism by subscribing to publications they read regularly
- Use archived content responsibly
- Be aware that not all articles may be available in archives

## 🐛 Troubleshooting

### Paywall Not Detected
- Try refreshing the page
- Some sites use advanced detection methods
- The extension may need updates for new paywall techniques

### Archive Not Available
- Not all articles are archived on archive.ph
- Recent articles may not be archived yet
- Some sites may block archiving services

### Extension Not Working
- Check that the extension is enabled in `chrome://extensions/`
- Ensure you have the latest version
- Try disabling and re-enabling the extension

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Report bugs
- Suggest new features
- Add support for additional websites
- Improve detection algorithms

## 📞 Support

For support or questions:
- Open an issue on the project repository
- Check the troubleshooting section above
- Review the Chrome extension documentation