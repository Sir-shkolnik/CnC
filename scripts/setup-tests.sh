#!/bin/bash

# C&C CRM Test Suite Setup Script
# Installs dependencies and configures the automated test environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🚀 C&C CRM Test Suite Setup${NC}"
echo "=================================="

# Function to log messages
log() {
    local level=$1
    shift
    local message="$*"
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
}

# Check operating system
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Install dependencies based on OS
install_dependencies() {
    local os=$(detect_os)
    
    log "INFO" "Detected OS: $os"
    log "INFO" "Installing dependencies..."
    
    case $os in
        "linux")
            # Ubuntu/Debian
            if command -v apt-get >/dev/null 2>&1; then
                sudo apt-get update
                sudo apt-get install -y curl jq git
                
                # Install Node.js
                if ! command -v node >/dev/null 2>&1; then
                    log "INFO" "Installing Node.js..."
                    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                fi
            # CentOS/RHEL/Fedora
            elif command -v yum >/dev/null 2>&1; then
                sudo yum update -y
                sudo yum install -y curl jq git
                
                if ! command -v node >/dev/null 2>&1; then
                    log "INFO" "Installing Node.js..."
                    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                    sudo yum install -y nodejs
                fi
            fi
            ;;
        "macos")
            # Check if Homebrew is installed
            if ! command -v brew >/dev/null 2>&1; then
                log "INFO" "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            
            # Install dependencies
            brew install curl jq git node
            ;;
        "windows")
            log "WARNING" "Windows support is limited. Please install manually:"
            log "INFO" "- Install Git for Windows"
            log "INFO" "- Install Node.js from https://nodejs.org/"
            log "INFO" "- Install jq from https://stedolan.github.io/jq/"
            log "INFO" "- Install curl (usually included with Git for Windows)"
            return 1
            ;;
        *)
            log "ERROR" "Unsupported operating system: $os"
            return 1
            ;;
    esac
}

# Install Render CLI
install_render_cli() {
    log "INFO" "Installing Render CLI..."
    
    local os=$(detect_os)
    local cli_url=""
    
    case $os in
        "linux")
            cli_url="https://github.com/render-oss/cli/releases/download/v1.1.0/cli_1.1.0_linux_amd64.zip"
            ;;
        "macos")
            if [[ $(uname -m) == "arm64" ]]; then
                cli_url="https://github.com/render-oss/cli/releases/download/v1.1.0/cli_1.1.0_darwin_arm64.zip"
            else
                cli_url="https://github.com/render-oss/cli/releases/download/v1.1.0/cli_1.1.0_darwin_amd64.zip"
            fi
            ;;
        *)
            log "ERROR" "Cannot install Render CLI on this OS"
            return 1
            ;;
    esac
    
    # Download and install Render CLI
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    curl -L "$cli_url" -o render.zip
    unzip render.zip
    
    # Move to appropriate location
    if [[ "$os" == "macos" ]]; then
        sudo mv cli_v1.1.0 /usr/local/bin/render
    else
        sudo mv cli_v1.1.0 /usr/local/bin/render
    fi
    
    chmod +x /usr/local/bin/render
    
    # Cleanup
    cd - > /dev/null
    rm -rf "$temp_dir"
    
    log "SUCCESS" "Render CLI installed successfully"
}

# Make scripts executable
make_scripts_executable() {
    log "INFO" "Making scripts executable..."
    
    chmod +x "$SCRIPT_DIR/automated-tests.sh"
    chmod +x "$SCRIPT_DIR/react-hydration-test.js"
    chmod +x "$SCRIPT_DIR/setup-tests.sh"
    
    log "SUCCESS" "Scripts made executable"
}

# Create configuration file
create_config() {
    log "INFO" "Creating configuration file..."
    
    local config_file="$PROJECT_ROOT/.test-config"
    
    cat > "$config_file" << 'EOF'
# C&C CRM Test Suite Configuration
# Update these values with your actual service IDs

# Service IDs (get these from your Render dashboard)
API_SERVICE_ID="srv-d29kplfgi27c73cnb74g"
FRONTEND_SERVICE_ID="srv-d29kpcfgi27c73cnanng"
DB_SERVICE_ID="dpg-d29kplfgi27c73cnb74g"
REDIS_SERVICE_ID="dpg-d29kplfgi27c73cnb74g"

# Notification settings
SLACK_WEBHOOK_URL=""
DISCORD_WEBHOOK_URL=""
EMAIL_NOTIFICATIONS="false"

# Test settings
TEST_INTERVAL_HOURS="6"
VERBOSE_LOGGING="false"
EOF
    
    log "SUCCESS" "Configuration file created: $config_file"
    log "INFO" "Please update the service IDs in the configuration file"
}

# Create cron job for automated testing
setup_cron() {
    log "INFO" "Setting up automated testing schedule..."
    
    local cron_job="0 */6 * * * cd $PROJECT_ROOT && ./scripts/automated-tests.sh --notify >> /var/log/c-and-c-crm-tests.log 2>&1"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "automated-tests.sh"; then
        log "WARNING" "Cron job already exists"
    else
        # Add to crontab
        (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
        log "SUCCESS" "Cron job added (runs every 6 hours)"
    fi
}

# Test the setup
test_setup() {
    log "INFO" "Testing the setup..."
    
    local tests_passed=0
    local tests_total=0
    
    # Test if required commands are available
    local commands=("curl" "jq" "node" "render" "git")
    
    for cmd in "${commands[@]}"; do
        tests_total=$((tests_total + 1))
        if command -v "$cmd" >/dev/null 2>&1; then
            log "SUCCESS" "✓ $cmd is available"
            tests_passed=$((tests_passed + 1))
        else
            log "ERROR" "✗ $cmd is not available"
        fi
    done
    
    # Test if scripts are executable
    tests_total=$((tests_total + 1))
    if [[ -x "$SCRIPT_DIR/automated-tests.sh" ]]; then
        log "SUCCESS" "✓ automated-tests.sh is executable"
        tests_passed=$((tests_passed + 1))
    else
        log "ERROR" "✗ automated-tests.sh is not executable"
    fi
    
    # Test React hydration script
    tests_total=$((tests_total + 1))
    if [[ -x "$SCRIPT_DIR/react-hydration-test.js" ]]; then
        log "SUCCESS" "✓ react-hydration-test.js is executable"
        tests_passed=$((tests_passed + 1))
    else
        log "ERROR" "✗ react-hydration-test.js is not executable"
    fi
    
    log "INFO" "Setup test results: $tests_passed/$tests_total passed"
    
    if [[ $tests_passed -eq $tests_total ]]; then
        log "SUCCESS" "Setup completed successfully!"
        return 0
    else
        log "ERROR" "Setup has issues. Please check the errors above."
        return 1
    fi
}

# Show usage instructions
show_usage() {
    echo -e "${BLUE}Usage Instructions:${NC}"
    echo "=================="
    echo ""
    echo "1. Configure your Render API key:"
    echo "   export RENDER_API_KEY=your_api_key_here"
    echo ""
    echo "2. Update service IDs in .test-config"
    echo ""
    echo "3. Run tests manually:"
    echo "   ./scripts/automated-tests.sh"
    echo ""
    echo "4. Run tests with verbose output:"
    echo "   ./scripts/automated-tests.sh --verbose"
    echo ""
    echo "5. Run tests with notifications:"
    echo "   ./scripts/automated-tests.sh --notify"
    echo ""
    echo "6. Test React hydration only:"
    echo "   node scripts/react-hydration-test.js"
    echo ""
    echo "7. View test logs:"
    echo "   tail -f test-results-*.log"
    echo ""
    echo "8. View test reports:"
    echo "   cat test-report-*.md"
    echo ""
}

# Main setup function
main() {
    log "INFO" "Starting C&C CRM test suite setup..."
    
    # Install dependencies
    install_dependencies
    
    # Install Render CLI
    install_render_cli
    
    # Make scripts executable
    make_scripts_executable
    
    # Create configuration
    create_config
    
    # Setup cron job (ask user first)
    echo ""
    read -p "Do you want to set up automated testing every 6 hours? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_cron
    fi
    
    # Test the setup
    test_setup
    
    if [[ $? -eq 0 ]]; then
        echo ""
        show_usage
        echo ""
        log "SUCCESS" "🎉 C&C CRM test suite setup completed!"
        log "INFO" "Next steps:"
        log "INFO" "1. Set your RENDER_API_KEY environment variable"
        log "INFO" "2. Update service IDs in .test-config"
        log "INFO" "3. Run: ./scripts/automated-tests.sh"
    else
        log "ERROR" "Setup failed. Please check the errors above."
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "C&C CRM Test Suite Setup"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h    Show this help message"
        echo "  --test-only   Only run setup tests"
        echo ""
        echo "This script will:"
        echo "1. Install required dependencies"
        echo "2. Install Render CLI"
        echo "3. Make scripts executable"
        echo "4. Create configuration file"
        echo "5. Optionally set up cron job"
        echo "6. Test the setup"
        exit 0
        ;;
    --test-only)
        test_setup
        exit $?
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 