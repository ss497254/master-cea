#!/bin/bash

# Uninstall script for CEA Deploy Tool

echo "🗑️  Master CEA Deploy Tool - Uninstaller"
echo "========================================"
echo ""

UNINSTALLED=false

# Check and remove system-wide installation
if [ -L "/usr/local/bin/master-cea" ] || [ -f "/usr/local/bin/master-cea" ]; then
    echo "🔍 Found system-wide installation at /usr/local/bin/master-cea"
    if command -v sudo >/dev/null 2>&1; then
        sudo rm -f /usr/local/bin/master-cea
        echo "✅ Removed /usr/local/bin/master-cea"
        UNINSTALLED=true
    else
        echo "⚠️  sudo not available. Please manually remove: /usr/local/bin/master-cea"
    fi
fi

# Check and remove user installation
if [ -L "$HOME/.local/bin/master-cea" ] || [ -f "$HOME/.local/bin/master-cea" ]; then
    echo "🔍 Found user installation at ~/.local/bin/master-cea"
    rm -f "$HOME/.local/bin/master-cea"
    echo "✅ Removed ~/.local/bin/master-cea"
    UNINSTALLED=true
fi

# Check for aliases in common shell profiles
SHELL_PROFILES=(
    "$HOME/.bashrc"
    "$HOME/.zshrc" 
    "$HOME/.profile"
    "$HOME/.config/fish/config.fish"
)

for profile in "${SHELL_PROFILES[@]}"; do
    if [ -f "$profile" ] && grep -q "master-cea" "$profile"; then
        echo "🔍 Found alias in $profile"
        
        # Create backup
        cp "$profile" "${profile}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Remove alias lines
        sed -i '/# Master CEA Deploy Tool/d' "$profile"
        sed -i '/alias master-cea=/d' "$profile"
        
        echo "✅ Removed alias from $profile (backup created)"
        echo "🔄 Restart your terminal or run: source $profile"
        UNINSTALLED=true
    fi
done

if [ "$UNINSTALLED" = true ]; then
    echo ""
    echo "🎉 Uninstallation complete!"
    echo "💡 The deploy script is still available locally at:"
    echo "   $(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy.js"
else
    echo "ℹ️  No global installations found."
    echo "💡 The deploy script can still be used locally from the project directory."
fi

echo ""
echo "📝 To remove the project entirely, delete the project directory."