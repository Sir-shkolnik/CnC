#!/bin/bash

# C&C CRM Automated Test Suite
# Tests all services and provides comprehensive health checks
# Usage: ./scripts/automated-tests.sh [--verbose] [--notify]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/test-results-$(date +%Y%m%d-%H%M%S).log"
VERBOSE=false
NOTIFY=false

# Service IDs (you'll need to update these with your actual service IDs)
API_SERVICE_ID="srv-d29kplfgi27c73cnb74g"
FRONTEND_SERVICE_ID="srv-d29kpcfgi27c73cnanng"
MOBILE_SERVICE_ID="srv-d29kpcfgi27c73cnanng"  # Same as frontend, different route
STORAGE_SERVICE_ID="srv-d29kpcfgi27c73cnanng" # Same as frontend, different route
DB_SERVICE_ID="dpg-d29kplfgi27c73cnb74g"
REDIS_SERVICE_ID="dpg-d29kplfgi27c73cnb74g"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to log messages
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
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
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="${3:-0}"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    log "INFO" "Running test: $test_name"
    
    if [ "$VERBOSE" = true ]; then
        log "INFO" "Command: $test_command"
    fi
    
    if eval "$test_command" > /dev/null 2>&1; then
        if [ $? -eq "$expected_status" ]; then
            log "SUCCESS" "✓ $test_name passed"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            log "ERROR" "✗ $test_name failed (unexpected exit code: $?)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    else
        log "ERROR" "✗ $test_name failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to check service health
check_service_health() {
    local service_name="$1"
    local service_id="$2"
    local health_url="$3"
    
    log "INFO" "Checking $service_name health..."
    
    # Check if service is running via Render CLI
    if render services --output json --confirm | jq -e ".[] | select(.id == \"$service_id\") | .status == \"live\"" > /dev/null 2>&1; then
        log "SUCCESS" "✓ $service_name is running on Render"
    else
        log "ERROR" "✗ $service_name is not running on Render"
        return 1
    fi
    
    # Check HTTP health endpoint if provided
    if [ -n "$health_url" ]; then
        if curl -s -f "$health_url" > /dev/null 2>&1; then
            log "SUCCESS" "✓ $service_name health endpoint responding"
        else
            log "ERROR" "✗ $service_name health endpoint not responding"
            return 1
        fi
    fi
    
    return 0
}

# Function to test API endpoints
test_api_endpoints() {
    local base_url="https://c-and-c-crm-api.onrender.com"
    
    log "INFO" "Testing API endpoints..."
    
    # Test health endpoint
    run_test "API Health Check" "curl -s -f '$base_url/health' > /dev/null"
    
    # Test authentication endpoint
    run_test "API Auth Endpoint" "curl -s -f '$base_url/auth/companies' > /dev/null"
    
    # Test journey endpoint
    run_test "API Journey Endpoint" "curl -s -f '$base_url/journeys' > /dev/null"
    
    # Test user endpoint
    run_test "API User Endpoint" "curl -s -f '$base_url/users' > /dev/null"
}

# Function to test frontend pages
test_frontend_pages() {
    local base_url="https://c-and-c-crm-frontend.onrender.com"
    
    log "INFO" "Testing frontend pages..."
    
    # Test main frontend
    run_test "Main Frontend" "curl -s -f '$base_url' > /dev/null"
    
    # Test mobile portal
    run_test "Mobile Portal" "curl -s -f '$base_url/mobile' > /dev/null"
    
    # Test storage system
    run_test "Storage System" "curl -s -f '$base_url/storage' > /dev/null"
    
    # Test super admin dashboard
    run_test "Super Admin Dashboard" "curl -s -f '$base_url/super-admin/dashboard' > /dev/null"
    
    # Test authentication pages
    run_test "Login Page" "curl -s -f '$base_url/auth/login' > /dev/null"
    run_test "Register Page" "curl -s -f '$base_url/auth/register' > /dev/null"
}

# Function to check database connectivity
test_database() {
    log "INFO" "Testing database connectivity..."
    
    # Check if we can connect to the database via Render CLI
    if render psql "$DB_SERVICE_ID" --output json --confirm -c "SELECT 1;" > /dev/null 2>&1; then
        log "SUCCESS" "✓ Database connection successful"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log "ERROR" "✗ Database connection failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
}

# Function to check recent deployments
check_recent_deployments() {
    log "INFO" "Checking recent deployments..."
    
    # Check API service deployments
    local api_deploy_status=$(render deploys list "$API_SERVICE_ID" --output json --confirm | jq -r '.[0].status' 2>/dev/null || echo "unknown")
    if [ "$api_deploy_status" = "live" ]; then
        log "SUCCESS" "✓ API service deployment is live"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log "WARNING" "⚠ API service deployment status: $api_deploy_status"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Check frontend service deployments
    local frontend_deploy_status=$(render deploys list "$FRONTEND_SERVICE_ID" --output json --confirm | jq -r '.[0].status' 2>/dev/null || echo "unknown")
    if [ "$frontend_deploy_status" = "live" ]; then
        log "SUCCESS" "✓ Frontend service deployment is live"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log "WARNING" "⚠ Frontend service deployment status: $frontend_deploy_status"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    TESTS_TOTAL=$((TESTS_TOTAL + 2))
}

# Function to check service logs for errors
check_service_logs() {
    log "INFO" "Checking service logs for recent errors..."
    
    # Check API logs for errors in the last hour
    local api_errors=$(render logs "$API_SERVICE_ID" --output json --confirm 2>/dev/null | jq -r '.[] | select(.timestamp > "'$(date -d '1 hour ago' -Iseconds)'") | select(.level == "ERROR") | .message' | wc -l)
    
    if [ "$api_errors" -eq 0 ]; then
        log "SUCCESS" "✓ No recent API errors found"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log "WARNING" "⚠ Found $api_errors recent API errors"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Check frontend logs for errors in the last hour
    local frontend_errors=$(render logs "$FRONTEND_SERVICE_ID" --output json --confirm 2>/dev/null | jq -r '.[] | select(.timestamp > "'$(date -d '1 hour ago' -Iseconds)'") | select(.level == "ERROR") | .message' | wc -l)
    
    if [ "$frontend_errors" -eq 0 ]; then
        log "SUCCESS" "✓ No recent frontend errors found"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log "WARNING" "⚠ Found $frontend_errors recent frontend errors"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    TESTS_TOTAL=$((TESTS_TOTAL + 2))
}

# Function to test React hydration (check for console errors)
test_react_hydration() {
    log "INFO" "Testing React hydration on frontend pages..."
    
    # Use the lightweight Node.js script to check for React errors
    if command -v node >/dev/null 2>&1; then
        if node "$SCRIPT_DIR/react-hydration-test.js" > /dev/null 2>&1; then
            log "SUCCESS" "✓ No React hydration errors detected"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log "ERROR" "✗ React hydration errors detected"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    else
        log "WARNING" "⚠ Node.js not available, skipping React hydration test"
    fi
}

# Function to send notifications
send_notification() {
    if [ "$NOTIFY" = true ]; then
        local message="$1"
        local status="$2"
        
        # You can add notification methods here:
        # - Slack webhook
        # - Email
        # - SMS
        # - Discord webhook
        
        log "INFO" "Notification: $message ($status)"
    fi
}

# Function to generate test report
generate_report() {
    local report_file="$PROJECT_ROOT/test-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# C&C CRM Automated Test Report
Generated: $(date)

## Test Summary
- **Total Tests**: $TESTS_TOTAL
- **Passed**: $TESTS_PASSED
- **Failed**: $TESTS_FAILED
- **Success Rate**: $(( (TESTS_PASSED * 100) / TESTS_TOTAL ))%

## Test Results
$(cat "$LOG_FILE" | grep -E "\[(SUCCESS|ERROR|WARNING)\]" | sed 's/.*\[\([A-Z]*\)\] \(.*\)/- **\1**: \2/')

## Services Status
- **API Service**: $(render services --output json --confirm | jq -r ".[] | select(.id == \"$API_SERVICE_ID\") | .status")
- **Frontend Service**: $(render services --output json --confirm | jq -r ".[] | select(.id == \"$FRONTEND_SERVICE_ID\") | .status")
- **Database**: $(render services --output json --confirm | jq -r ".[] | select(.id == \"$DB_SERVICE_ID\") | .status")
- **Redis**: $(render services --output json --confirm | jq -r ".[] | select(.id == \"$REDIS_SERVICE_ID\") | .status")

## Recommendations
$(if [ $TESTS_FAILED -gt 0 ]; then
    echo "- Investigate failed tests immediately"
    echo "- Check service logs for errors"
    echo "- Verify deployment status"
else
    echo "- All tests passed successfully"
    echo "- System is operating normally"
fi)

EOF
    
    log "INFO" "Test report generated: $report_file"
}

# Function to cleanup
cleanup() {
    # Remove temporary files
    rm -f /tmp/check-react.js 2>/dev/null || true
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --notify)
            NOTIFY=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--verbose] [--notify]"
            echo "  --verbose  Enable verbose output"
            echo "  --notify   Enable notifications"
            echo "  --help     Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Main test execution
main() {
    log "INFO" "Starting C&C CRM automated test suite..."
    log "INFO" "Test log file: $LOG_FILE"
    
    # Check if Render CLI is available
    if ! command -v render >/dev/null 2>&1; then
        log "ERROR" "Render CLI not found. Please install it first."
        exit 1
    fi
    
    # Check if jq is available
    if ! command -v jq >/dev/null 2>&1; then
        log "ERROR" "jq not found. Please install it first."
        exit 1
    fi
    
    # Run all tests
    check_service_health "API Service" "$API_SERVICE_ID" "https://c-and-c-crm-api.onrender.com/health"
    check_service_health "Frontend Service" "$FRONTEND_SERVICE_ID" "https://c-and-c-crm-frontend.onrender.com"
    
    test_api_endpoints
    test_frontend_pages
    test_database
    check_recent_deployments
    check_service_logs
    test_react_hydration
    
    # Generate report
    generate_report
    
    # Send notifications if enabled
    if [ $TESTS_FAILED -gt 0 ]; then
        send_notification "C&C CRM tests failed: $TESTS_FAILED/$TESTS_TOTAL tests failed" "FAILED"
    else
        send_notification "C&C CRM tests passed: $TESTS_PASSED/$TESTS_TOTAL tests passed" "SUCCESS"
    fi
    
    # Print summary
    log "INFO" "Test suite completed!"
    log "INFO" "Results: $TESTS_PASSED passed, $TESTS_FAILED failed out of $TESTS_TOTAL total tests"
    
    # Exit with appropriate code
    if [ $TESTS_FAILED -gt 0 ]; then
        log "ERROR" "Some tests failed. Check the log file for details: $LOG_FILE"
        exit 1
    else
        log "SUCCESS" "All tests passed successfully!"
        exit 0
    fi
}

# Set up trap for cleanup
trap cleanup EXIT

# Run main function
main "$@" 