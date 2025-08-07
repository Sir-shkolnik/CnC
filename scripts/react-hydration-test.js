#!/usr/bin/env node

/**
 * C&C CRM React Hydration Test
 * Lightweight test to check for React hydration errors without Puppeteer
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const TEST_URLS = [
  'https://c-and-c-crm-frontend.onrender.com/mobile',
  'https://c-and-c-crm-frontend.onrender.com/storage',
  'https://c-and-c-crm-frontend.onrender.com/super-admin/dashboard'
];

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  const color = colors[level] || colors.reset;
  console.log(`${color}[${timestamp}] [${level.toUpperCase()}]${colors.reset} ${message}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'C&C-CRM-Test-Suite/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function checkForReactErrors(html) {
  const errors = [];
  
  // Check for common React error patterns
  const errorPatterns = [
    /React error #418/gi,
    /React error #423/gi,
    /hydration mismatch/gi,
    /hydration error/gi,
    /server.*client.*mismatch/gi,
    /minified react error/gi
  ];
  
  errorPatterns.forEach((pattern, index) => {
    const matches = html.match(pattern);
    if (matches) {
      errors.push(`Pattern ${index + 1}: ${matches.length} matches found`);
    }
  });
  
  // Check for console.error patterns in inline scripts
  const consoleErrorPattern = /console\.error\(/gi;
  const consoleErrors = html.match(consoleErrorPattern);
  if (consoleErrors) {
    errors.push(`Console errors: ${consoleErrors.length} found`);
  }
  
  // Check for error classes or error states
  const errorClassPattern = /class.*error/gi;
  const errorClasses = html.match(errorClassPattern);
  if (errorClasses) {
    errors.push(`Error classes: ${errorClasses.length} found`);
  }
  
  return errors;
}

function checkForHydrationIssues(html) {
  const issues = [];
  
  // Check for hydration-specific issues
  const hydrationIssues = [
    /isMounted/gi,
    /useEffect.*\[\]/gi,
    /client.*only/gi,
    /suppressHydrationWarning/gi
  ];
  
  hydrationIssues.forEach((pattern, index) => {
    const matches = html.match(pattern);
    if (matches) {
      issues.push(`Hydration pattern ${index + 1}: ${matches.length} matches`);
    }
  });
  
  return issues;
}

async function testUrl(url) {
  try {
    log('info', `Testing: ${url}`);
    
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      log('error', `HTTP ${response.statusCode} for ${url}`);
      return { success: false, errors: [`HTTP ${response.statusCode}`] };
    }
    
    // Check for React errors
    const reactErrors = checkForReactErrors(response.body);
    const hydrationIssues = checkForHydrationIssues(response.body);
    
    // Check if page loads without obvious errors
    const hasErrorIndicators = response.body.includes('error') || 
                              response.body.includes('Error') ||
                              response.body.includes('ERROR');
    
    if (reactErrors.length > 0) {
      log('error', `React errors found in ${url}: ${reactErrors.join(', ')}`);
      return { success: false, errors: reactErrors };
    }
    
    if (hydrationIssues.length > 0) {
      log('warning', `Hydration issues found in ${url}: ${hydrationIssues.join(', ')}`);
    }
    
    if (hasErrorIndicators) {
      log('warning', `Potential error indicators found in ${url}`);
    }
    
    log('success', `✓ ${url} loaded successfully`);
    return { success: true, warnings: hydrationIssues };
    
  } catch (error) {
    log('error', `Failed to test ${url}: ${error.message}`);
    return { success: false, errors: [error.message] };
  }
}

async function runTests() {
  log('info', 'Starting React hydration tests...');
  
  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  for (const url of TEST_URLS) {
    totalTests++;
    const result = await testUrl(url);
    results.push({ url, ...result });
    
    if (result.success) {
      passedTests++;
    } else {
      failedTests++;
    }
  }
  
  // Print summary
  log('info', 'Test Summary:');
  log('info', `Total tests: ${totalTests}`);
  log('info', `Passed: ${passedTests}`);
  log('info', `Failed: ${failedTests}`);
  
  // Print detailed results
  console.log('\nDetailed Results:');
  results.forEach((result, index) => {
    const status = result.success ? '✓' : '✗';
    const color = result.success ? colors.green : colors.red;
    console.log(`${color}${status}${colors.reset} ${result.url}`);
    
    if (result.errors && result.errors.length > 0) {
      result.errors.forEach(error => {
        console.log(`  ${colors.red}Error:${colors.reset} ${error}`);
      });
    }
    
    if (result.warnings && result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        console.log(`  ${colors.yellow}Warning:${colors.reset} ${warning}`);
      });
    }
  });
  
  // Exit with appropriate code
  if (failedTests > 0) {
    log('error', 'Some tests failed!');
    process.exit(1);
  } else {
    log('success', 'All tests passed!');
    process.exit(0);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
C&C CRM React Hydration Test

Usage: node react-hydration-test.js [options]

Options:
  --help, -h    Show this help message
  --url <url>   Test a specific URL instead of the default set

Examples:
  node react-hydration-test.js
  node react-hydration-test.js --url https://example.com
`);
  process.exit(0);
}

// Check for custom URL
const urlIndex = process.argv.indexOf('--url');
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
  const customUrl = process.argv[urlIndex + 1];
  log('info', `Testing custom URL: ${customUrl}`);
  testUrl(customUrl).then(result => {
    if (result.success) {
      log('success', 'Custom URL test passed!');
      process.exit(0);
    } else {
      log('error', 'Custom URL test failed!');
      process.exit(1);
    }
  }).catch(error => {
    log('error', `Custom URL test error: ${error.message}`);
    process.exit(1);
  });
} else {
  // Run all tests
  runTests().catch(error => {
    log('error', `Test suite error: ${error.message}`);
    process.exit(1);
  });
} 