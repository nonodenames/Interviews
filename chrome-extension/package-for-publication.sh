#!/bin/bash

# Package Paywall Bypasser Chrome Extension for Publication
# This script creates a ZIP file ready for Chrome Web Store submission

echo "🔓 Packaging Paywall Bypasser Chrome Extension..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the chrome-extension directory."
    exit 1
fi

# Create temporary directory for packaging
TEMP_DIR="paywall-bypasser-package"
ZIP_NAME="paywall-bypasser-extension.zip"

echo "📁 Creating temporary package directory..."
rm -rf "$TEMP_DIR" 2>/dev/null
mkdir -p "$TEMP_DIR"

# Copy required files for publication
echo "📋 Copying extension files..."

# Core extension files
cp manifest.json "$TEMP_DIR/"
cp content.js "$TEMP_DIR/"
cp background.js "$TEMP_DIR/"
cp popup.html "$TEMP_DIR/"
cp popup.css "$TEMP_DIR/"
cp popup.js "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"

# Create icons directory
mkdir -p "$TEMP_DIR/icons"

# Check if PNG icons exist, if not, notify user
if [ ! -f "icons/icon16.png" ] || [ ! -f "icons/icon32.png" ] || [ ! -f "icons/icon48.png" ] || [ ! -f "icons/icon128.png" ]; then
    echo "⚠️  Warning: PNG icon files not found!"
    echo "   Please generate icons using generate-icons.html first:"
    echo "   1. Open generate-icons.html in your browser"
    echo "   2. Click 'Download All Icons'"
    echo "   3. Save the PNG files in the icons/ folder"
    echo ""
    echo "   Creating placeholder icons for now..."
    
    # Copy SVG files as placeholders if they exist
    if [ -f "icons/icon16.svg" ]; then
        cp icons/*.svg "$TEMP_DIR/icons/" 2>/dev/null || true
    fi
else
    echo "✅ Copying icon files..."
    cp icons/icon16.png "$TEMP_DIR/icons/"
    cp icons/icon32.png "$TEMP_DIR/icons/"
    cp icons/icon48.png "$TEMP_DIR/icons/"
    cp icons/icon128.png "$TEMP_DIR/icons/"
fi

# Remove old ZIP if it exists
rm -f "$ZIP_NAME"

echo "🗜️  Creating ZIP package..."
cd "$TEMP_DIR"
zip -r "../$ZIP_NAME" . -q

cd ..
rm -rf "$TEMP_DIR"

# Verify ZIP was created
if [ -f "$ZIP_NAME" ]; then
    echo "✅ Package created successfully: $ZIP_NAME"
    echo ""
    echo "📦 Package Contents:"
    unzip -l "$ZIP_NAME"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Ensure you have created PNG icon files (see generate-icons.html)"
    echo "2. Test the extension thoroughly in Chrome"
    echo "3. Visit https://chrome.google.com/webstore/devconsole/"
    echo "4. Upload $ZIP_NAME"
    echo "5. Fill out store listing (see PUBLISHING_GUIDE.md for details)"
    echo ""
    echo "💡 File size: $(du -h "$ZIP_NAME" | cut -f1)"
else
    echo "❌ Error: Failed to create ZIP package"
    exit 1
fi

echo "🚀 Ready for Chrome Web Store submission!"