#!/bin/bash

# Values.md Deployment Wizard
# A complete deployment and management solution

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="values.md"
DEFAULT_PORT=3001
FALLBACK_PORTS=(3002 3003 3004 3005 3006 3007 3008 3009 3010)
LOG_FILE="deployment.log"
STATUS_FILE=".deployment_status"

# Utility functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check port availability
is_port_available() {
    local port=$1
    ! lsof -i:$port >/dev/null 2>&1
}

# Find available port
find_available_port() {
    if is_port_available $DEFAULT_PORT; then
        echo $DEFAULT_PORT
        return
    fi
    
    for port in "${FALLBACK_PORTS[@]}"; do
        if is_port_available $port; then
            echo $port
            return
        fi
    done
    
    # Generate random high port if all predefined are taken
    echo $((RANDOM % 10000 + 50000))
}

# Check and configure firewall
configure_firewall() {
    local port=$1
    
    if command_exists ufw; then
        local ufw_status=$(ufw status 2>/dev/null | head -1 || echo "inactive")
        
        if [[ "$ufw_status" == *"active"* ]]; then
            info "UFW is active, checking port $port access..."
            
            if ! ufw status | grep -q "$port"; then
                warn "Port $port not allowed in UFW. Adding rule..."
                if sudo ufw allow $port/tcp 2>/dev/null; then
                    success "UFW rule added for port $port"
                else
                    warn "Could not add UFW rule (may require manual configuration)"
                fi
            else
                info "Port $port already allowed in UFW"
            fi
        else
            info "UFW is inactive, no firewall configuration needed"
        fi
    else
        info "UFW not installed, skipping firewall configuration"
    fi
}

# System status check
check_system_status() {
    info "Checking system status..."
    
    echo -e "\n${WHITE}=== SYSTEM STATUS ===${NC}"
    
    # Node.js version
    if command_exists node; then
        echo -e "${GREEN}✓${NC} Node.js: $(node --version)"
    else
        echo -e "${RED}✗${NC} Node.js: Not installed"
        return 1
    fi
    
    # npm version
    if command_exists npm; then
        echo -e "${GREEN}✓${NC} npm: $(npm --version)"
    else
        echo -e "${RED}✗${NC} npm: Not installed"
        return 1
    fi
    
    # Git status
    if command_exists git && [ -d .git ]; then
        echo -e "${GREEN}✓${NC} Git: $(git --version | cut -d' ' -f3)"
        echo -e "  Current branch: ${CYAN}$(git branch --show-current)${NC}"
        echo -e "  Last commit: ${CYAN}$(git log -1 --format='%h %s')${NC}"
        
        # Check for uncommitted changes
        if ! git diff-index --quiet HEAD --; then
            warn "  Uncommitted changes detected"
        fi
    else
        echo -e "${RED}✗${NC} Git: Not a git repository"
    fi
    
    # Check dependencies
    if [ -f package.json ]; then
        echo -e "${GREEN}✓${NC} package.json found"
        if [ -d node_modules ]; then
            echo -e "${GREEN}✓${NC} node_modules exists"
        else
            warn "  node_modules not found (run npm install)"
        fi
    else
        echo -e "${RED}✗${NC} package.json not found"
        return 1
    fi
    
    # Check environment files
    if [ -f .env ]; then
        echo -e "${GREEN}✓${NC} .env file found"
    elif [ -f .env.local ]; then
        echo -e "${GREEN}✓${NC} .env.local file found"
    else
        warn "  No environment file found"
    fi
    
    # Memory and disk usage
    echo -e "\n${WHITE}=== RESOURCES ===${NC}"
    echo -e "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
    echo -e "Disk: $(df -h . | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"
    
    return 0
}

# Check running processes
check_running_processes() {
    echo -e "\n${WHITE}=== RUNNING PROCESSES ===${NC}"
    
    local node_processes=$(ps aux | grep -E "(node|npm)" | grep -v grep | wc -l)
    if [ $node_processes -gt 0 ]; then
        echo -e "${YELLOW}Active Node.js processes:${NC}"
        ps aux | grep -E "(node|npm)" | grep -v grep | awk '{print "  PID " $2 ": " $11 " " $12 " " $13}'
    else
        echo -e "${GREEN}No active Node.js processes${NC}"
    fi
    
    # Check specific ports
    echo -e "\n${WHITE}=== PORT USAGE ===${NC}"
    for port in 3000 3001 3002 3003; do
        if lsof -i:$port >/dev/null 2>&1; then
            local process=$(lsof -i:$port | tail -1 | awk '{print $1 " (PID " $2 ")"}')
            echo -e "${YELLOW}Port $port:${NC} $process"
        else
            echo -e "${GREEN}Port $port:${NC} Available"
        fi
    done
}

# Install dependencies
install_dependencies() {
    info "Installing dependencies..."
    
    if [ ! -f package.json ]; then
        error "No package.json found!"
        return 1
    fi
    
    # Check if node_modules is older than package.json
    if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
        log "Running npm install..."
        if npm install; then
            success "Dependencies installed successfully"
        else
            error "Failed to install dependencies"
            return 1
        fi
    else
        info "Dependencies are up to date"
    fi
}

# Build the project
build_project() {
    info "Building project..."
    
    if npm run build > build.log 2>&1; then
        success "Build completed successfully"
        return 0
    else
        error "Build failed. Check build.log for details:"
        tail -10 build.log
        return 1
    fi
}

# Start development server
start_dev_server() {
    local port=$1
    
    info "Starting development server on port $port..."
    
    # Kill any existing process on this port
    if lsof -i:$port >/dev/null 2>&1; then
        warn "Port $port is in use. Attempting to free it..."
        local pid=$(lsof -ti:$port)
        if [ -n "$pid" ]; then
            kill $pid 2>/dev/null || true
            sleep 2
        fi
    fi
    
    # Start the server
    export PORT=$port
    npm run dev -- --port $port > server.log 2>&1 &
    local server_pid=$!
    
    # Wait for server to start
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "http://localhost:$port" >/dev/null 2>&1; then
            success "Server started successfully!"
            echo -e "\n${WHITE}=== DEPLOYMENT SUCCESSFUL ===${NC}"
            echo -e "${GREEN}🚀 Local URL: http://localhost:$port${NC}"
            echo -e "${GREEN}🌐 Network URL: http://$(hostname -I | awk '{print $1}'):$port${NC}"
            echo -e "${BLUE}📋 Server PID: $server_pid${NC}"
            
            # Save deployment status
            cat > "$STATUS_FILE" <<EOF
DEPLOYMENT_STATUS=active
PORT=$port
PID=$server_pid
START_TIME=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
EOF
            
            return 0
        fi
        
        sleep 1
        ((attempt++))
    done
    
    error "Server failed to start within 30 seconds"
    kill $server_pid 2>/dev/null || true
    return 1
}

# Stop running server
stop_server() {
    if [ -f "$STATUS_FILE" ]; then
        source "$STATUS_FILE"
        if [ -n "${PID:-}" ]; then
            if kill -0 $PID 2>/dev/null; then
                info "Stopping server (PID: $PID)..."
                kill $PID
                sleep 2
                if kill -0 $PID 2>/dev/null; then
                    warn "Server didn't stop gracefully, force killing..."
                    kill -9 $PID
                fi
                success "Server stopped"
            else
                info "Server process not running"
            fi
        fi
        rm -f "$STATUS_FILE"
    else
        info "No active deployment found"
    fi
}

# Show deployment status
show_status() {
    echo -e "\n${WHITE}=== DEPLOYMENT STATUS ===${NC}"
    
    if [ -f "$STATUS_FILE" ]; then
        source "$STATUS_FILE"
        echo -e "Status: ${GREEN}$DEPLOYMENT_STATUS${NC}"
        echo -e "Port: ${CYAN}$PORT${NC}"
        echo -e "PID: ${CYAN}$PID${NC}"
        echo -e "Started: ${CYAN}$START_TIME${NC}"
        echo -e "Commit: ${CYAN}$COMMIT${NC}"
        echo -e "Branch: ${CYAN}$BRANCH${NC}"
        echo -e "URL: ${GREEN}http://localhost:$PORT${NC}"
        
        # Check if process is still running
        if kill -0 $PID 2>/dev/null; then
            echo -e "Process: ${GREEN}Running${NC}"
        else
            echo -e "Process: ${RED}Not running${NC}"
        fi
    else
        echo -e "Status: ${RED}No active deployment${NC}"
    fi
}

# Main menu
show_menu() {
    echo -e "\n${WHITE}=== VALUES.MD DEPLOYMENT WIZARD ===${NC}"
    echo -e "${CYAN}1.${NC} Deploy locally (start dev server)"
    echo -e "${CYAN}2.${NC} Stop server"
    echo -e "${CYAN}3.${NC} Show status"
    echo -e "${CYAN}4.${NC} System check"
    echo -e "${CYAN}5.${NC} Build project"
    echo -e "${CYAN}6.${NC} View logs"
    echo -e "${CYAN}7.${NC} Cleanup"
    echo -e "${CYAN}8.${NC} Exit"
    echo -e "\nChoose an option [1-8]: "
}

# View logs
view_logs() {
    echo -e "\n${WHITE}=== LOGS ===${NC}"
    echo -e "${CYAN}Available logs:${NC}"
    
    for log in deployment.log server.log build.log; do
        if [ -f "$log" ]; then
            echo -e "  ${GREEN}✓${NC} $log ($(wc -l < "$log") lines)"
        else
            echo -e "  ${RED}✗${NC} $log (not found)"
        fi
    done
    
    echo -e "\nWhich log would you like to view? [deployment/server/build]: "
    read -r log_choice
    
    case $log_choice in
        deployment|d)
            if [ -f deployment.log ]; then
                tail -50 deployment.log
            else
                warn "No deployment log found"
            fi
            ;;
        server|s)
            if [ -f server.log ]; then
                tail -50 server.log
            else
                warn "No server log found"
            fi
            ;;
        build|b)
            if [ -f build.log ]; then
                tail -50 build.log
            else
                warn "No build log found"
            fi
            ;;
        *)
            warn "Invalid choice"
            ;;
    esac
}

# Cleanup
cleanup() {
    info "Cleaning up..."
    
    # Stop server if running
    stop_server
    
    # Remove log files
    rm -f deployment.log server.log build.log
    rm -f "$STATUS_FILE"
    
    success "Cleanup completed"
}

# Main execution
main() {
    # Create log file
    touch "$LOG_FILE"
    log "Starting Values.md Deployment Wizard"
    
    # Check if we're in the right directory
    if [ ! -f package.json ] || ! grep -q "values.md" package.json; then
        error "Not in values.md project directory!"
        echo "Please run this script from the project root."
        exit 1
    fi
    
    # Handle command line arguments
    case "${1:-menu}" in
        deploy|start)
            check_system_status || exit 1
            install_dependencies || exit 1
            
            local port=$(find_available_port)
            configure_firewall $port
            start_dev_server $port
            ;;
        stop)
            stop_server
            ;;
        status)
            show_status
            check_running_processes
            ;;
        build)
            build_project
            ;;
        check)
            check_system_status
            check_running_processes
            ;;
        clean|cleanup)
            cleanup
            ;;
        menu|*)
            while true; do
                show_menu
                read -r choice
                
                case $choice in
                    1)
                        check_system_status || continue
                        install_dependencies || continue
                        
                        local port=$(find_available_port)
                        configure_firewall $port
                        start_dev_server $port
                        ;;
                    2)
                        stop_server
                        ;;
                    3)
                        show_status
                        check_running_processes
                        ;;
                    4)
                        check_system_status
                        check_running_processes
                        ;;
                    5)
                        build_project
                        ;;
                    6)
                        view_logs
                        ;;
                    7)
                        cleanup
                        ;;
                    8)
                        log "Deployment wizard exited"
                        exit 0
                        ;;
                    *)
                        warn "Invalid option. Please choose 1-8."
                        ;;
                esac
                
                echo -e "\nPress Enter to continue..."
                read -r
            done
            ;;
    esac
}

# Run main function with all arguments
main "$@"