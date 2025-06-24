#!/bin/bash

# Values.md Project Manager TUI
# Complete project management with branch switching, deployment, and status monitoring

set -euo pipefail

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Configuration
PROJECT_NAME="values.md"
CONFIG_FILE=".project_config"
STATUS_FILE=".deployment_status"

# State variables
CURRENT_BRANCH=""
REMOTE_URL=""
DEPLOYMENT_STATUS="inactive"
LAST_COMMIT=""

# Terminal control
clear_screen() {
    clear
    tput cup 0 0
}

move_cursor() {
    tput cup $1 $2
}

hide_cursor() {
    tput civis
}

show_cursor() {
    tput cnorm
}

# Utility functions
log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Load project state
load_state() {
    if [ -d .git ]; then
        CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
        REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "none")
        LAST_COMMIT=$(git log -1 --format='%h %s' 2>/dev/null || echo "none")
    fi
    
    if [ -f "$STATUS_FILE" ]; then
        source "$STATUS_FILE"
        DEPLOYMENT_STATUS="${DEPLOYMENT_STATUS:-inactive}"
    fi
}

# Display header
show_header() {
    echo -e "${WHITE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║${NC}                    ${BOLD}${PURPLE}VALUES.MD PROJECT MANAGER${NC}                         ${WHITE}║${NC}"
    echo -e "${WHITE}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${WHITE}║${NC} Project: ${CYAN}${PROJECT_NAME}${NC}                                                      ${WHITE}║${NC}"
    echo -e "${WHITE}║${NC} Branch:  ${GREEN}${CURRENT_BRANCH}${NC}                                                       ${WHITE}║${NC}"
    echo -e "${WHITE}║${NC} Status:  ${deployment_status_color}${DEPLOYMENT_STATUS}${NC}                                                     ${WHITE}║${NC}"
    echo -e "${WHITE}║${NC} Commit:  ${DIM}${LAST_COMMIT}${NC}                                           ${WHITE}║${NC}"
    echo -e "${WHITE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Get deployment status color
deployment_status_color() {
    case "$DEPLOYMENT_STATUS" in
        "active") echo -e "${GREEN}" ;;
        "building") echo -e "${YELLOW}" ;;
        "error") echo -e "${RED}" ;;
        *) echo -e "${DIM}" ;;
    esac
}

# Show quick status
show_quick_status() {
    local deployment_color=$(deployment_status_color)
    
    echo -e "${WHITE}┌─ Quick Status ──────────────────────────────────────────────────────────────┐${NC}"
    
    # Git status
    if [ -d .git ]; then
        local git_status=""
        if ! git diff-index --quiet HEAD -- 2>/dev/null; then
            git_status="${YELLOW}● Modified${NC}"
        elif [ -n "$(git status --porcelain 2>/dev/null)" ]; then
            git_status="${BLUE}● Staged${NC}"
        else
            git_status="${GREEN}● Clean${NC}"
        fi
        echo -e "${WHITE}│${NC} Git:        $git_status"
    fi
    
    # Dependencies
    local deps_status="${RED}✗ Missing${NC}"
    if [ -d node_modules ]; then
        if [ package.json -nt node_modules ]; then
            deps_status="${YELLOW}⚠ Outdated${NC}"
        else
            deps_status="${GREEN}✓ Updated${NC}"
        fi
    fi
    echo -e "${WHITE}│${NC} Dependencies: $deps_status"
    
    # Port usage
    local port_info=""
    for port in 3000 3001 3002; do
        if lsof -i:$port >/dev/null 2>&1; then
            port_info="${port_info} ${YELLOW}$port${NC}"
        else
            port_info="${port_info} ${GREEN}$port${NC}"
        fi
    done
    echo -e "${WHITE}│${NC} Ports:      $port_info"
    
    # Build status
    local build_status="${DIM}Unknown${NC}"
    if [ -f .next/trace ]; then
        build_status="${GREEN}✓ Built${NC}"
    fi
    echo -e "${WHITE}│${NC} Build:      $build_status"
    
    echo -e "${WHITE}└─────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo
}

# Show main menu
show_main_menu() {
    echo -e "${WHITE}┌─ Main Menu ─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${WHITE}│${NC}                                                                             ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}1.${NC} 🚀 Deploy Locally           ${CYAN}2.${NC} 🛠️  Build Project                  ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}3.${NC} 🌿 Branch Management         ${CYAN}4.${NC} 📊 System Status                  ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}5.${NC} 🔧 Development Tools         ${CYAN}6.${NC} 📝 View Logs                     ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}7.${NC} ⚙️  Settings                 ${CYAN}8.${NC} ❌ Stop Server                   ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}9.${NC} 🧹 Cleanup                   ${CYAN}0.${NC} 🚪 Exit                          ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}                                                                             ${WHITE}│${NC}"
    echo -e "${WHITE}└─────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo
    echo -e "Choose an option: "
}

# Branch management menu
branch_management() {
    clear_screen
    show_header
    
    echo -e "${WHITE}┌─ Branch Management ─────────────────────────────────────────────────────────┐${NC}"
    
    if [ ! -d .git ]; then
        echo -e "${WHITE}│${NC} ${RED}Error: Not a git repository${NC}                                              ${WHITE}│${NC}"
        echo -e "${WHITE}└─────────────────────────────────────────────────────────────────────────────┘${NC}"
        echo "Press Enter to continue..."
        read -r
        return
    fi
    
    # Show current branch and recent branches
    echo -e "${WHITE}│${NC} Current: ${GREEN}${CURRENT_BRANCH}${NC}"
    echo -e "${WHITE}│${NC}"
    echo -e "${WHITE}│${NC} Recent branches:"
    
    local branches=($(git for-each-ref --sort=-committerdate refs/heads/ --format='%(refname:short)' | head -5))
    local i=1
    for branch in "${branches[@]}"; do
        if [ "$branch" = "$CURRENT_BRANCH" ]; then
            echo -e "${WHITE}│${NC}   ${GREEN}$i. $branch${NC} ${DIM}(current)${NC}"
        else
            echo -e "${WHITE}│${NC}   ${CYAN}$i. $branch${NC}"
        fi
        ((i++))
    done
    
    echo -e "${WHITE}│${NC}"
    echo -e "${WHITE}│${NC} ${CYAN}c.${NC} Create new branch             ${CYAN}r.${NC} Refresh"
    echo -e "${WHITE}│${NC} ${CYAN}p.${NC} Push current branch           ${CYAN}u.${NC} Pull latest"
    echo -e "${WHITE}│${NC} ${CYAN}m.${NC} Merge branch                  ${CYAN}b.${NC} Back to main menu"
    echo -e "${WHITE}└─────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo
    echo -e "Choose option: "
    
    read -r choice
    case $choice in
        [1-5])
            local branch=${branches[$((choice-1))]}
            if [ -n "$branch" ] && [ "$branch" != "$CURRENT_BRANCH" ]; then
                info "Switching to branch: $branch"
                if git checkout "$branch" 2>/dev/null; then
                    success "Switched to $branch"
                    CURRENT_BRANCH="$branch"
                else
                    error "Failed to switch to $branch"
                fi
                echo "Press Enter to continue..."
                read -r
            fi
            ;;
        c)
            echo "Enter new branch name: "
            read -r new_branch
            if [ -n "$new_branch" ]; then
                if git checkout -b "$new_branch" 2>/dev/null; then
                    success "Created and switched to $new_branch"
                    CURRENT_BRANCH="$new_branch"
                else
                    error "Failed to create branch $new_branch"
                fi
                echo "Press Enter to continue..."
                read -r
            fi
            ;;
        p)
            info "Pushing current branch..."
            if git push -u origin "$CURRENT_BRANCH" 2>/dev/null; then
                success "Branch pushed successfully"
            else
                error "Failed to push branch"
            fi
            echo "Press Enter to continue..."
            read -r
            ;;
        u)
            info "Pulling latest changes..."
            if git pull 2>/dev/null; then
                success "Pull completed successfully"
            else
                error "Failed to pull changes"
            fi
            echo "Press Enter to continue..."
            read -r
            ;;
        m)
            echo "Enter branch to merge: "
            read -r merge_branch
            if [ -n "$merge_branch" ]; then
                if git merge "$merge_branch" 2>/dev/null; then
                    success "Merged $merge_branch successfully"
                else
                    error "Failed to merge $merge_branch"
                fi
                echo "Press Enter to continue..."
                read -r
            fi
            ;;
        r)
            load_state
            branch_management
            return
            ;;
        b)
            return
            ;;
    esac
    
    branch_management
}

# Development tools menu
development_tools() {
    clear_screen
    show_header
    
    echo -e "${WHITE}┌─ Development Tools ─────────────────────────────────────────────────────────┐${NC}"
    echo -e "${WHITE}│${NC}                                                                             ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}1.${NC} 📦 Install Dependencies       ${CYAN}2.${NC} 🧪 Run Tests                     ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}3.${NC} 🔍 Lint Code                 ${CYAN}4.${NC} 🎨 Format Code                   ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}5.${NC} 🗄️  Database Studio            ${CYAN}6.${NC} 🔄 Database Migration            ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}7.${NC} 🌱 Seed Database              ${CYAN}8.${NC} 📊 Bundle Analyzer               ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}9.${NC} 🔧 TypeScript Check           ${CYAN}b.${NC} 🔙 Back                          ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}                                                                             ${WHITE}│${NC}"
    echo -e "${WHITE}└─────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo
    echo -e "Choose option: "
    
    read -r choice
    case $choice in
        1)
            info "Installing dependencies..."
            npm install
            success "Dependencies installed"
            ;;
        2)
            info "Running tests..."
            npm test 2>/dev/null || warn "No test script found"
            ;;
        3)
            info "Linting code..."
            npm run lint
            ;;
        4)
            info "Formatting code..."
            npm run format 2>/dev/null || warn "No format script found"
            ;;
        5)
            info "Opening database studio..."
            npm run db:studio &
            ;;
        6)
            info "Running database migration..."
            npm run db:push
            ;;
        7)
            info "Seeding database..."
            npm run seed:db 2>/dev/null || warn "No seed script found"
            ;;
        8)
            info "Analyzing bundle..."
            npm run analyze 2>/dev/null || warn "No analyze script found"
            ;;
        9)
            info "Checking TypeScript..."
            npx tsc --noEmit
            ;;
        b)
            return
            ;;
    esac
    
    if [ "$choice" != "b" ]; then
        echo "Press Enter to continue..."
        read -r
        development_tools
    fi
}

# System status display
system_status() {
    clear_screen
    show_header
    
    echo -e "${WHITE}┌─ System Status ─────────────────────────────────────────────────────────────┐${NC}"
    
    # System info
    echo -e "${WHITE}│${NC} ${BOLD}System Information${NC}"
    echo -e "${WHITE}│${NC} OS: $(uname -s) $(uname -r)"
    echo -e "${WHITE}│${NC} Node: $(node --version 2>/dev/null || echo 'Not installed')"
    echo -e "${WHITE}│${NC} npm: $(npm --version 2>/dev/null || echo 'Not installed')"
    echo -e "${WHITE}│${NC}"
    
    # Memory usage
    echo -e "${WHITE}│${NC} ${BOLD}Resources${NC}"
    echo -e "${WHITE}│${NC} Memory: $(free -h 2>/dev/null | awk '/^Mem:/ {print $3 "/" $2}' || echo 'N/A')"
    echo -e "${WHITE}│${NC} Disk: $(df -h . 2>/dev/null | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}' || echo 'N/A')"
    echo -e "${WHITE}│${NC}"
    
    # Process info
    echo -e "${WHITE}│${NC} ${BOLD}Active Processes${NC}"
    local node_procs=$(ps aux 2>/dev/null | grep -E "(node|npm)" | grep -v grep | wc -l || echo "0")
    echo -e "${WHITE}│${NC} Node.js processes: $node_procs"
    
    # Port usage
    echo -e "${WHITE}│${NC}"
    echo -e "${WHITE}│${NC} ${BOLD}Port Status${NC}"
    for port in 3000 3001 3002 3003; do
        if lsof -i:$port >/dev/null 2>&1; then
            local proc=$(lsof -i:$port 2>/dev/null | tail -1 | awk '{print $1}' || echo "unknown")
            echo -e "${WHITE}│${NC} Port $port: ${YELLOW}In use${NC} ($proc)"
        else
            echo -e "${WHITE}│${NC} Port $port: ${GREEN}Available${NC}"
        fi
    done
    
    echo -e "${WHITE}└─────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo
    echo "Press Enter to continue..."
    read -r
}

# View logs
view_logs() {
    clear_screen
    show_header
    
    echo -e "${WHITE}┌─ Log Viewer ────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${WHITE}│${NC}                                                                             ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}1.${NC} 📋 Deployment Log             ${CYAN}2.${NC} 🖥️  Server Log                    ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}3.${NC} 🔨 Build Log                  ${CYAN}4.${NC} 🐛 Error Log                     ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}5.${NC} 📊 Git Log                    ${CYAN}6.${NC} 🔍 Live Tail                     ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}  ${CYAN}b.${NC} 🔙 Back                                                                ${WHITE}│${NC}"
    echo -e "${WHITE}│${NC}                                                                             ${WHITE}│${NC}"
    echo -e "${WHITE}└─────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo
    echo -e "Choose log to view: "
    
    read -r choice
    case $choice in
        1)
            if [ -f deployment.log ]; then
                echo -e "\n${CYAN}Last 30 lines of deployment.log:${NC}"
                tail -30 deployment.log
            else
                warn "No deployment log found"
            fi
            ;;
        2)
            if [ -f server.log ]; then
                echo -e "\n${CYAN}Last 30 lines of server.log:${NC}"
                tail -30 server.log
            else
                warn "No server log found"
            fi
            ;;
        3)
            if [ -f build.log ]; then
                echo -e "\n${CYAN}Last 30 lines of build.log:${NC}"
                tail -30 build.log
            else
                warn "No build log found"
            fi
            ;;
        4)
            echo -e "\n${CYAN}Recent npm errors:${NC}"
            npm ls --depth=0 2>&1 | head -20 || echo "No npm errors found"
            ;;
        5)
            echo -e "\n${CYAN}Last 10 commits:${NC}"
            git log --oneline -10 2>/dev/null || echo "Not a git repository"
            ;;
        6)
            if [ -f server.log ]; then
                echo -e "\n${CYAN}Following server.log (Ctrl+C to stop):${NC}"
                tail -f server.log
            else
                warn "No server log to tail"
            fi
            ;;
        b)
            return
            ;;
    esac
    
    if [ "$choice" != "b" ]; then
        echo -e "\nPress Enter to continue..."
        read -r
        view_logs
    fi
}

# Main execution loop
main() {
    # Setup terminal
    hide_cursor
    trap show_cursor EXIT
    
    while true; do
        # Refresh state
        load_state
        
        # Show interface
        clear_screen
        show_header
        show_quick_status
        show_main_menu
        
        # Get user input
        read -r choice
        
        case $choice in
            1)
                info "Starting deployment wizard..."
                ./deploy.sh deploy
                echo "Press Enter to continue..."
                read -r
                ;;
            2)
                info "Building project..."
                npm run build
                echo "Press Enter to continue..."
                read -r
                ;;
            3)
                branch_management
                ;;
            4)
                system_status
                ;;
            5)
                development_tools
                ;;
            6)
                view_logs
                ;;
            7)
                echo "Settings functionality coming soon..."
                echo "Press Enter to continue..."
                read -r
                ;;
            8)
                ./deploy.sh stop
                echo "Press Enter to continue..."
                read -r
                ;;
            9)
                ./deploy.sh cleanup
                echo "Press Enter to continue..."
                read -r
                ;;
            0)
                break
                ;;
            *)
                warn "Invalid option. Please choose 0-9."
                sleep 1
                ;;
        esac
    done
    
    show_cursor
    echo -e "\n${GREEN}Thanks for using Values.md Project Manager!${NC}"
}

# Check dependencies
if [ ! -f deploy.sh ]; then
    error "deploy.sh not found! Please ensure it's in the same directory."
    exit 1
fi

# Run main
main