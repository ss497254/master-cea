#!/bin/bash

# Global Installation Script for CEA Deploy Tool
# This script provides multiple methods to install the deploy script globally

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_SCRIPT="$PROJECT_ROOT/scripts/deploy.js"

echo "🚀 Master CEA Deploy Tool - Global Installation"
echo "=============================================="
echo ""

# Check if deploy script exists
if [ ! -f "$DEPLOY_SCRIPT" ]; then
    echo "❌ Deploy script not found at: $DEPLOY_SCRIPT"
    exit 1
fi

# Make script executable
chmod +x "$DEPLOY_SCRIPT"

echo "Choose installation method:"
echo "1. System-wide installation (/usr/local/bin) - Requires sudo"
echo "2. User installation (~/.local/bin) - No sudo required"
echo "3. Add to PATH (create alias in shell profile)"
echo "4. Show manual installation instructions"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🔧 Installing system-wide..."
        if command -v sudo >/dev/null 2>&1; then
            sudo ln -sf "$DEPLOY_SCRIPT" /usr/local/bin/master-cea
            echo "✅ Installed to /usr/local/bin/master-cea"
            echo "💡 You can now run 'master-cea' from anywhere"
        else
            echo "❌ sudo not available. Please run as root or choose option 2."
            exit 1
        fi
        ;;
    
    2)
        echo "🔧 Installing for current user..."
        mkdir -p "$HOME/.local/bin"
        ln -sf "$DEPLOY_SCRIPT" "$HOME/.local/bin/master-cea"
        echo "✅ Installed to ~/.local/bin/master-cea"
        
        # Check if ~/.local/bin is in PATH
        if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
            echo "⚠️  ~/.local/bin is not in your PATH"
            echo "💡 Add this line to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
            echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
            echo ""
            echo "🔄 Or run this command to add it temporarily:"
            echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
        else
            echo "💡 You can now run 'master-cea' from anywhere"
        fi
        ;;
    
    3)
        echo "🔧 Creating shell alias..."
        SHELL_NAME=$(basename "$SHELL")
        
        case $SHELL_NAME in
            bash)
                PROFILE_FILE="$HOME/.bashrc"
                ;;
            zsh)
                PROFILE_FILE="$HOME/.zshrc"
                ;;
            fish)
                PROFILE_FILE="$HOME/.config/fish/config.fish"
                ;;
            *)
                PROFILE_FILE="$HOME/.profile"
                ;;
        esac
        
        ALIAS_LINE="alias master-cea='$DEPLOY_SCRIPT'"
        
        echo "💡 Adding alias to $PROFILE_FILE"
        echo "" >> "$PROFILE_FILE"
        echo "# Master CEA Deploy Tool" >> "$PROFILE_FILE"
        echo "$ALIAS_LINE" >> "$PROFILE_FILE"
        
        echo "✅ Alias added to $PROFILE_FILE"
        echo "🔄 Restart your terminal or run: source $PROFILE_FILE"
        echo "💡 You can then run 'master-cea' from anywhere"
        ;;
    
    4)
        echo "📖 Manual Installation Instructions"
        echo "===================================="
        echo ""
        echo "Method 1: System-wide symlink (requires sudo)"
        echo "  sudo ln -sf '$DEPLOY_SCRIPT' /usr/local/bin/master-cea"
        echo ""
        echo "Method 2: User symlink"
        echo "  mkdir -p ~/.local/bin"
        echo "  ln -sf '$DEPLOY_SCRIPT' ~/.local/bin/master-cea"
        echo "  export PATH=\"\$HOME/.local/bin:\$PATH\"  # Add to shell profile"
        echo ""
        echo "Method 3: Shell alias"
        echo "  echo \"alias master-cea='$DEPLOY_SCRIPT'\" >> ~/.bashrc"
        echo "  source ~/.bashrc"
        echo ""
        echo "Method 4: Direct execution"
        echo "  '$DEPLOY_SCRIPT' deploy"
        echo ""
        ;;
    
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📚 Usage examples:"
echo "  master-cea deploy                     # Deploy from current directory"
echo "  master-cea --project /path/app deploy # Deploy specific project"
echo "  master-cea status                     # Check deployment status"
echo "  master-cea rollback                   # Rollback to previous version"
echo ""
echo "📖 For more information, run: master-cea"