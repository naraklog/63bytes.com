#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_PORT=3633
PORT=$DEFAULT_PORT
PROJECT_PATH=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [-p port] [project_path]"
            echo ""
            echo "Options:"
            echo "  -p, --port PORT    Set the server port (default: $DEFAULT_PORT)"
            echo "  -h, --help         Show this help message"
            echo ""
            echo "Arguments:"
            echo "  project_path       Path to the project directory (default: parent of scripts folder)"
            exit 0
            ;;
        *)
            PROJECT_PATH="$1"
            shift
            ;;
    esac
done

# Determine project path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -z "$PROJECT_PATH" ]; then
    PROJECT_PATH="$(dirname "$SCRIPT_DIR")"
fi
PROJECT_PATH="$(cd "$PROJECT_PATH" && pwd)"

echo -e "${BLUE}=== 63bytes.com Service Registration ===${NC}"
echo ""
echo -e "Project path: ${GREEN}$PROJECT_PATH${NC}"
echo -e "Port: ${GREEN}$PORT${NC}"
echo ""

# Detect OS
OS="$(uname -s)"
echo -e "${BLUE}Detecting OS...${NC}"
case "$OS" in
    Darwin)
        echo -e "  OS: ${GREEN}macOS${NC}"
        ;;
    Linux)
        echo -e "  OS: ${GREEN}Linux${NC}"
        ;;
    *)
        echo -e "${RED}Error: Unsupported operating system: $OS${NC}"
        exit 1
        ;;
esac
echo ""

# Find Bun
echo -e "${BLUE}Locating Bun...${NC}"
BUN_PATH=""
BUN_LOCATIONS=(
    "$HOME/.bun/bin/bun"
    "/opt/homebrew/bin/bun"
    "/usr/local/bin/bun"
    "/usr/bin/bun"
)

for loc in "${BUN_LOCATIONS[@]}"; do
    if [ -x "$loc" ]; then
        BUN_PATH="$loc"
        break
    fi
done

# Fall back to PATH
if [ -z "$BUN_PATH" ]; then
    if command -v bun &> /dev/null; then
        BUN_PATH="$(command -v bun)"
    fi
fi

if [ -z "$BUN_PATH" ]; then
    echo -e "${RED}Error: Bun not found!${NC}"
    echo "Please install Bun: https://bun.sh"
    exit 1
fi

echo -e "  Bun found: ${GREEN}$BUN_PATH${NC}"

# Validate Bun works
BUN_VERSION=$("$BUN_PATH" --version 2>/dev/null) || {
    echo -e "${RED}Error: Bun binary exists but failed to execute${NC}"
    exit 1
}
echo -e "  Bun version: ${GREEN}$BUN_VERSION${NC}"
echo ""

# Verify project structure
echo -e "${BLUE}Verifying project structure...${NC}"
if [ ! -f "$PROJECT_PATH/package.json" ]; then
    echo -e "${RED}Error: package.json not found in $PROJECT_PATH${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} package.json found"
echo ""

# Install dependencies and build
echo -e "${BLUE}Installing dependencies...${NC}"
cd "$PROJECT_PATH"
"$BUN_PATH" install
echo ""

echo -e "${BLUE}Building project...${NC}"
"$BUN_PATH" run build
echo ""

# macOS launchctl installation
install_macos_service() {
    echo -e "${BLUE}Installing macOS launchctl service...${NC}"
    
    PLIST_TEMPLATE="$SCRIPT_DIR/63bytes.plist"
    PLIST_DEST="$HOME/Library/LaunchAgents/com.63bytes.web.plist"
    LOG_DIR="$HOME/Library/Logs/63bytes"
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    echo -e "  ${GREEN}✓${NC} Log directory created: $LOG_DIR"
    
    # Unload existing service if present
    if launchctl list | grep -q "com.63bytes.web"; then
        echo -e "  ${YELLOW}Unloading existing service...${NC}"
        launchctl unload "$PLIST_DEST" 2>/dev/null || true
    fi
    
    # Generate plist with actual values
    sed -e "s|__PROJECT_PATH__|$PROJECT_PATH|g" \
        -e "s|__BUN_PATH__|$BUN_PATH|g" \
        -e "s|__PORT__|$PORT|g" \
        -e "s|__LOG_DIR__|$LOG_DIR|g" \
        "$PLIST_TEMPLATE" > "$PLIST_DEST"
    
    echo -e "  ${GREEN}✓${NC} Service file installed: $PLIST_DEST"
    
    # Load the service
    launchctl load "$PLIST_DEST"
    echo -e "  ${GREEN}✓${NC} Service loaded"
    
    echo ""
    echo -e "${GREEN}=== macOS Service Installed Successfully ===${NC}"
    echo ""
    echo "Commands:"
    echo "  Start:   launchctl load ~/Library/LaunchAgents/com.63bytes.web.plist"
    echo "  Stop:    launchctl unload ~/Library/LaunchAgents/com.63bytes.web.plist"
    echo "  Status:  launchctl list | grep 63bytes"
    echo "  Logs:    tail -f $LOG_DIR/63bytes.log"
    echo ""
    echo -e "Server running at: ${GREEN}http://localhost:$PORT${NC}"
}

# Linux systemd installation
install_linux_service() {
    echo -e "${BLUE}Installing Linux systemd user service...${NC}"
    
    SERVICE_TEMPLATE="$SCRIPT_DIR/63bytes.service"
    SYSTEMD_DIR="$HOME/.config/systemd/user"
    SERVICE_DEST="$SYSTEMD_DIR/63bytes.service"
    
    # Create systemd user directory
    mkdir -p "$SYSTEMD_DIR"
    echo -e "  ${GREEN}✓${NC} Systemd user directory created: $SYSTEMD_DIR"
    
    # Stop existing service if running
    if systemctl --user is-active --quiet 63bytes 2>/dev/null; then
        echo -e "  ${YELLOW}Stopping existing service...${NC}"
        systemctl --user stop 63bytes
    fi
    
    # Generate service file with actual values
    sed -e "s|__PROJECT_PATH__|$PROJECT_PATH|g" \
        -e "s|__BUN_PATH__|$BUN_PATH|g" \
        -e "s|__PORT__|$PORT|g" \
        "$SERVICE_TEMPLATE" > "$SERVICE_DEST"
    
    echo -e "  ${GREEN}✓${NC} Service file installed: $SERVICE_DEST"
    
    # Reload systemd and enable service
    systemctl --user daemon-reload
    systemctl --user enable 63bytes
    systemctl --user start 63bytes
    
    echo -e "  ${GREEN}✓${NC} Service enabled and started"
    
    echo ""
    echo -e "${GREEN}=== Linux Service Installed Successfully ===${NC}"
    echo ""
    echo "Commands:"
    echo "  Start:   systemctl --user start 63bytes"
    echo "  Stop:    systemctl --user stop 63bytes"
    echo "  Status:  systemctl --user status 63bytes"
    echo "  Logs:    journalctl --user -u 63bytes -f"
    echo ""
    echo -e "Server running at: ${GREEN}http://localhost:$PORT${NC}"
}

# Install service based on OS
case "$OS" in
    Darwin)
        install_macos_service
        ;;
    Linux)
        install_linux_service
        ;;
esac
