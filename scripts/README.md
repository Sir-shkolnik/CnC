# 🤖 C&C CRM Automated Test Suite

A comprehensive automated testing solution for the C&C CRM system using Render CLI to monitor and test all services continuously.

## 🚀 Features

- **Service Health Monitoring**: Real-time health checks for all C&C CRM services
- **API Endpoint Testing**: Comprehensive API endpoint validation
- **Frontend Page Testing**: All frontend pages and portals tested
- **React Hydration Testing**: Specialized testing for React hydration errors
- **Database Connectivity**: PostgreSQL connection testing
- **Deployment Status**: Monitor recent deployments and their status
- **Log Analysis**: Check service logs for recent errors
- **Automated Reports**: Generate detailed test reports in Markdown format
- **GitHub Actions Integration**: Automated testing on schedule and PRs
- **Notification System**: Configurable notifications for test failures

## 📋 Prerequisites

- **Render CLI**: For interacting with Render services
- **jq**: For JSON parsing
- **Node.js**: For React hydration testing
- **curl**: For HTTP requests
- **Git**: For version control

## 🛠️ Quick Setup

### 1. Run the Setup Script

```bash
# Make the setup script executable
chmod +x scripts/setup-tests.sh

# Run the setup
./scripts/setup-tests.sh
```

The setup script will:
- Install all required dependencies
- Install Render CLI
- Make all scripts executable
- Create configuration file
- Optionally set up cron job for automated testing

### 2. Configure Your Environment

```bash
# Set your Render API key
export RENDER_API_KEY=your_api_key_here

# Update service IDs in .test-config
# Edit the file and replace with your actual service IDs
```

### 3. Run Your First Test

```bash
# Run all tests
./scripts/automated-tests.sh

# Run with verbose output
./scripts/automated-tests.sh --verbose

# Run with notifications
./scripts/automated-tests.sh --notify
```

## 📁 File Structure

```
scripts/
├── automated-tests.sh          # Main test suite script
├── react-hydration-test.js     # React hydration testing
├── setup-tests.sh             # Setup and installation script
└── README.md                  # This file

.github/workflows/
└── automated-tests.yml        # GitHub Actions workflow

.test-config                   # Configuration file (created by setup)
```

## 🔧 Configuration

### Service IDs

Update the service IDs in `.test-config` with your actual Render service IDs:

```bash
# Get your service IDs from Render dashboard
API_SERVICE_ID="srv-your-api-service-id"
FRONTEND_SERVICE_ID="srv-your-frontend-service-id"
DB_SERVICE_ID="dpg-your-database-id"
REDIS_SERVICE_ID="dpg-your-redis-id"
```

### Notification Settings

Configure notifications in `.test-config`:

```bash
# Slack webhook (optional)
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Discord webhook (optional)
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Email notifications (optional)
EMAIL_NOTIFICATIONS="false"
```

## 🧪 Test Categories

### 1. Service Health Tests
- **API Service**: Health endpoint and service status
- **Frontend Service**: Main frontend availability
- **Database**: PostgreSQL connectivity
- **Redis**: Cache service status

### 2. API Endpoint Tests
- **Health Check**: `/health` endpoint
- **Authentication**: `/auth/companies` endpoint
- **Journey Management**: `/journeys` endpoint
- **User Management**: `/users` endpoint

### 3. Frontend Page Tests
- **Main Frontend**: Landing page
- **Mobile Portal**: Mobile field operations
- **Storage System**: Storage management interface
- **Super Admin**: Super admin dashboard
- **Authentication**: Login and register pages

### 4. React Hydration Tests
- **Error Detection**: React errors #418, #423
- **Hydration Issues**: Server/client mismatches
- **Console Errors**: JavaScript console errors
- **Error Patterns**: Common React error patterns

### 5. Deployment Tests
- **Recent Deployments**: Check deployment status
- **Service Logs**: Monitor for recent errors
- **Build Status**: Verify successful builds

## 📊 Test Reports

The test suite generates comprehensive reports:

### Log Files
- `test-results-YYYYMMDD-HHMMSS.log`: Detailed test execution logs
- `test-report-YYYYMMDD-HHMMSS.md`: Markdown test report

### Report Contents
- Test summary with pass/fail counts
- Detailed test results
- Service status overview
- Recommendations for failed tests
- Performance metrics

## 🔄 Automation Options

### 1. Cron Jobs (Local)

Set up automated testing every 6 hours:

```bash
# The setup script will offer to create this automatically
0 */6 * * * cd /path/to/c-and-c-crm && ./scripts/automated-tests.sh --notify
```

### 2. GitHub Actions (Cloud)

The included workflow runs:
- **Every 6 hours** on schedule
- **On every push** to main branch
- **On pull requests** for validation
- **Manual triggers** via workflow dispatch

### 3. CI/CD Integration

Add to your deployment pipeline:

```yaml
# Example: Run tests after deployment
- name: Run Post-Deployment Tests
  run: |
    export RENDER_API_KEY=${{ secrets.RENDER_API_KEY }}
    ./scripts/automated-tests.sh --verbose
```

## 🚨 Notifications

### Slack Integration

```bash
# Add to your .test-config
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# The test suite will automatically send notifications
```

### Discord Integration

```bash
# Add to your .test-config
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/WEBHOOK/URL"
```

### Email Notifications

```bash
# Configure email settings in .test-config
EMAIL_NOTIFICATIONS="true"
EMAIL_SMTP_SERVER="smtp.gmail.com"
EMAIL_USERNAME="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

## 🛠️ Manual Testing

### Run Specific Tests

```bash
# Test only React hydration
node scripts/react-hydration-test.js

# Test specific URL
node scripts/react-hydration-test.js --url https://your-site.com

# Test with verbose output
./scripts/automated-tests.sh --verbose

# Test with notifications
./scripts/automated-tests.sh --notify
```

### View Test Results

```bash
# View latest test log
tail -f test-results-*.log

# View latest test report
cat test-report-*.md

# List all test files
ls -la test-*
```

## 🔍 Troubleshooting

### Common Issues

1. **Render CLI not found**
   ```bash
   # Reinstall Render CLI
   ./scripts/setup-tests.sh --test-only
   ```

2. **Permission denied**
   ```bash
   # Make scripts executable
   chmod +x scripts/*.sh
   chmod +x scripts/*.js
   ```

3. **Service IDs not found**
   ```bash
   # Get service IDs from Render dashboard
   render services --output json
   ```

4. **API key issues**
   ```bash
   # Verify your API key
   export RENDER_API_KEY=your_key
   render services
   ```

### Debug Mode

```bash
# Run with maximum verbosity
./scripts/automated-tests.sh --verbose 2>&1 | tee debug.log
```

## 📈 Monitoring Dashboard

Create a simple monitoring dashboard:

```bash
# Create a monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "=== C&C CRM Service Status ==="
echo "Last updated: $(date)"
echo ""

# Run tests and capture output
./scripts/automated-tests.sh 2>&1 | tee /tmp/test-output.log

# Extract summary
echo "=== Test Summary ==="
grep -E "\[(SUCCESS|ERROR|WARNING)\]" /tmp/test-output.log | tail -10
EOF

chmod +x monitor.sh
```

## 🔧 Advanced Configuration

### Custom Test Intervals

```bash
# Edit .test-config
TEST_INTERVAL_HOURS="2"  # Run every 2 hours
```

### Custom Service URLs

```bash
# Add to automated-tests.sh
CUSTOM_API_URL="https://your-custom-api.com"
CUSTOM_FRONTEND_URL="https://your-custom-frontend.com"
```

### Extended Logging

```bash
# Enable extended logging
VERBOSE_LOGGING="true"
LOG_LEVEL="DEBUG"
```

## 🤝 Contributing

To add new tests:

1. **Add test function** to `automated-tests.sh`
2. **Update test categories** in this README
3. **Add to main execution** in the script
4. **Update GitHub Actions** workflow if needed

### Example: Adding a New Test

```bash
# Add to automated-tests.sh
test_new_feature() {
    log "INFO" "Testing new feature..."
    
    run_test "New Feature Test" "curl -s -f 'https://api.example.com/new-feature' > /dev/null"
}

# Add to main() function
test_new_feature
```

## 📞 Support

For issues and questions:

1. Check the troubleshooting section
2. Review test logs for specific errors
3. Verify service IDs and API keys
4. Test individual components manually

## 📄 License

This test suite is part of the C&C CRM project and follows the same license terms.

---

**Happy Testing! 🎯** 