#!/bin/bash

# Quick Status Checker for Values.md
# Shows instant project status without full TUI

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
DIM='\033[2m'
NC='\033[0m'

# Check if in project directory
if [ ! -f package.json ] || ! grep -q "values.md" package.json; then
    echo -e "${RED}❌ Not in values.md project directory${NC}"
    exit 1
fi

echo -e "${WHITE}🔍 VALUES.MD PROJECT STATUS${NC}"
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Git Status
if [ -d .git ]; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    COMMIT=$(git log -1 --format='%h %s' 2>/dev/null || echo "none")
    
    echo -e "${CYAN}📝 Git:${NC}"
    echo -e "   Branch: ${GREEN}$BRANCH${NC}"
    echo -e "   Commit: ${DIM}$COMMIT${NC}"
    
    # Check for changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo -e "   Status: ${YELLOW}Modified files${NC}"
    elif [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        echo -e "   Status: ${BLUE}Staged changes${NC}"
    else
        echo -e "   Status: ${GREEN}Clean${NC}"
    fi
else
    echo -e "${RED}❌ Not a git repository${NC}"
fi

echo

# Dependencies
echo -e "${CYAN}📦 Dependencies:${NC}"
if [ -d node_modules ]; then
    if [ package.json -nt node_modules ]; then
        echo -e "   Status: ${YELLOW}Outdated (run npm install)${NC}"
    else
        echo -e "   Status: ${GREEN}Up to date${NC}"
    fi
    
    # Package count
    PKG_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo -e "   Packages: ${DIM}$((PKG_COUNT - 1))${NC}"
else
    echo -e "   Status: ${RED}Missing (run npm install)${NC}"
fi

echo

# Build Status
echo -e "${CYAN}🔨 Build:${NC}"
if [ -d .next ]; then
    if [ -f .next/trace ]; then
        BUILD_TIME=$(stat -c %Y .next/trace 2>/dev/null || echo "0")
        PACKAGE_TIME=$(stat -c %Y package.json 2>/dev/null || echo "0")
        
        if [ $BUILD_TIME -gt $PACKAGE_TIME ]; then
            echo -e "   Status: ${GREEN}Built and current${NC}"
        else
            echo -e "   Status: ${YELLOW}Outdated (run npm run build)${NC}"
        fi
    else
        echo -e "   Status: ${YELLOW}Incomplete${NC}"
    fi
else
    echo -e "   Status: ${RED}Not built${NC}"
fi

echo

# Deployment Status
echo -e "${CYAN}🚀 Deployment:${NC}"
if [ -f .deployment_status ]; then
    source .deployment_status
    
    # Check if process is still running
    if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
        echo -e "   Status: ${GREEN}Active${NC}"
        echo -e "   URL: ${GREEN}http://localhost:${PORT}${NC}"
        echo -e "   PID: ${DIM}$PID${NC}"
        echo -e "   Started: ${DIM}$START_TIME${NC}"
    else
        echo -e "   Status: ${RED}Stopped (stale status file)${NC}"
        rm -f .deployment_status
    fi
else
    echo -e "   Status: ${DIM}Not deployed${NC}"
fi

echo

# Port Usage
echo -e "${CYAN}🌐 Ports:${NC}"
for port in 3000 3001 3002 3003; do
    if lsof -i:$port >/dev/null 2>&1; then
        PROC=$(lsof -i:$port 2>/dev/null | tail -1 | awk '{print $1}' || echo "unknown")
        echo -e "   $port: ${YELLOW}In use${NC} (${DIM}$PROC${NC})"
    else
        echo -e "   $port: ${GREEN}Available${NC}"
    fi
done

echo

# System Resources
echo -e "${CYAN}💾 Resources:${NC}"
if command -v free >/dev/null 2>&1; then
    MEM=$(free -h | awk '/^Mem:/ {print $3 "/" $2}')
    echo -e "   Memory: ${DIM}$MEM${NC}"
fi

if command -v df >/dev/null 2>&1; then
    DISK=$(df -h . | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')
    echo -e "   Disk: ${DIM}$DISK${NC}"
fi

# Node processes
NODE_PROCS=$(ps aux 2>/dev/null | grep -E "(node|npm)" | grep -v grep | wc -l || echo "0")
echo -e "   Node processes: ${DIM}$NODE_PROCS${NC}"

echo
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Quick actions
echo -e "${DIM}Quick actions: ./deploy.sh | ./manage.sh | npm run dev | npm run build${NC}"