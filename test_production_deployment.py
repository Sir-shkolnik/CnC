#!/usr/bin/env python3
"""
C&C CRM Production Deployment Testing Script
Tests all deployed services on Render.com
"""

import requests
import json
import time
from datetime import datetime

# Production URLs
PRODUCTION_URLS = {
    'api': 'https://c-and-c-crm-api.onrender.com',
    'frontend': 'https://c-and-c-crm-frontend.onrender.com',
    'mobile': 'https://c-and-c-crm-mobile.onrender.com',
    'storage': 'https://c-and-c-crm-storage.onrender.com'
}

# Test endpoints
TEST_ENDPOINTS = {
    'api_health': '/health',
    'api_docs': '/docs',
    'api_openapi': '/openapi.json',
    'frontend_root': '/',
    'frontend_login': '/auth/login',
    'frontend_dashboard': '/dashboard',
    'mobile_root': '/',
    'storage_root': '/',
    'super_admin': '/super-admin/auth/login'
}

class ProductionTester:
    def __init__(self):
        self.results = []
        self.start_time = datetime.now()
        
    def log_test(self, test_name, success, details=None, response_time=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'timestamp': datetime.now().isoformat(),
            'response_time': response_time,
            'details': details
        }
        self.results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_time:
            print(f"   Response Time: {response_time:.2f}s")
        print()

    def test_api_health(self):
        """Test API health endpoint"""
        try:
            start_time = time.time()
            response = requests.get(f"{PRODUCTION_URLS['api']}/health", timeout=10)
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            details = None
            
            if success:
                try:
                    data = response.json()
                    details = f"Status: {data.get('status', 'unknown')}, Version: {data.get('version', 'unknown')}"
                except:
                    details = "Response received but not JSON"
            else:
                details = f"Status code: {response.status_code}"
                
            self.log_test("API Health Check", success, details, response_time)
            
        except Exception as e:
            self.log_test("API Health Check", False, f"Error: {str(e)}")

    def test_api_documentation(self):
        """Test API documentation endpoint"""
        try:
            start_time = time.time()
            response = requests.get(f"{PRODUCTION_URLS['api']}/docs", timeout=10)
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            details = f"Status code: {response.status_code}"
            
            self.log_test("API Documentation", success, details, response_time)
            
        except Exception as e:
            self.log_test("API Documentation", False, f"Error: {str(e)}")

    def test_api_openapi(self):
        """Test API OpenAPI schema"""
        try:
            start_time = time.time()
            response = requests.get(f"{PRODUCTION_URLS['api']}/openapi.json", timeout=10)
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            details = None
            
            if success:
                try:
                    data = response.json()
                    details = f"Title: {data.get('info', {}).get('title', 'unknown')}, Version: {data.get('info', {}).get('version', 'unknown')}"
                except:
                    details = "Response received but not JSON"
            else:
                details = f"Status code: {response.status_code}"
                
            self.log_test("API OpenAPI Schema", success, details, response_time)
            
        except Exception as e:
            self.log_test("API OpenAPI Schema", False, f"Error: {str(e)}")

    def test_frontend_landing(self):
        """Test frontend landing page"""
        try:
            start_time = time.time()
            response = requests.get(PRODUCTION_URLS['frontend'], timeout=10)
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            details = f"Status code: {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}"
            
            self.log_test("Frontend Landing Page", success, details, response_time)
            
        except Exception as e:
            self.log_test("Frontend Landing Page", False, f"Error: {str(e)}")

    def test_frontend_login(self):
        """Test frontend login page"""
        try:
            start_time = time.time()
            response = requests.get(f"{PRODUCTION_URLS['frontend']}/auth/login", timeout=10)
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            details = f"Status code: {response.status_code}"
            
            self.log_test("Frontend Login Page", success, details, response_time)
            
        except Exception as e:
            self.log_test("Frontend Login Page", False, f"Error: {str(e)}")

    def test_frontend_dashboard(self):
        """Test frontend dashboard (should redirect to login)"""
        try:
            start_time = time.time()
            response = requests.get(f"{PRODUCTION_URLS['frontend']}/dashboard", timeout=10, allow_redirects=False)
            response_time = time.time() - start_time
            
            # Dashboard should redirect to login (302) or require auth (401/403)
            success = response.status_code in [302, 401, 403, 200]
            details = f"Status code: {response.status_code}"
            
            self.log_test("Frontend Dashboard", success, details, response_time)
            
        except Exception as e:
            self.log_test("Frontend Dashboard", False, f"Error: {str(e)}")

    def test_mobile_portal(self):
        """Test mobile portal"""
        try:
            start_time = time.time()
            response = requests.get(PRODUCTION_URLS['mobile'], timeout=10)
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            details = f"Status code: {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}"
            
            self.log_test("Mobile Portal", success, details, response_time)
            
        except Exception as e:
            self.log_test("Mobile Portal", False, f"Error: {str(e)}")

    def test_storage_system(self):
        """Test storage system"""
        try:
            start_time = time.time()
            response = requests.get(PRODUCTION_URLS['storage'], timeout=10)
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            details = f"Status code: {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}"
            
            self.log_test("Storage System", success, details, response_time)
            
        except Exception as e:
            self.log_test("Storage System", False, f"Error: {str(e)}")

    def test_super_admin(self):
        """Test super admin portal"""
        try:
            start_time = time.time()
            response = requests.get(f"{PRODUCTION_URLS['frontend']}/super-admin/auth/login", timeout=10)
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            details = f"Status code: {response.status_code}"
            
            self.log_test("Super Admin Portal", success, details, response_time)
            
        except Exception as e:
            self.log_test("Super Admin Portal", False, f"Error: {str(e)}")

    def test_response_times(self):
        """Test response times for all services"""
        print("🚀 Testing Response Times...")
        print()
        
        for service_name, url in PRODUCTION_URLS.items():
            try:
                start_time = time.time()
                response = requests.get(url, timeout=15)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    if response_time < 2.0:
                        status = "✅ FAST"
                    elif response_time < 5.0:
                        status = "⚠️  SLOW"
                    else:
                        status = "❌ VERY SLOW"
                        
                    print(f"{status} {service_name}: {response_time:.2f}s")
                else:
                    print(f"❌ FAIL {service_name}: Status {response.status_code}")
                    
            except Exception as e:
                print(f"❌ ERROR {service_name}: {str(e)}")
        
        print()

    def run_all_tests(self):
        """Run all tests"""
        print("🧪 C&C CRM Production Deployment Testing")
        print("=" * 50)
        print(f"Test started at: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Run individual tests
        self.test_api_health()
        self.test_api_documentation()
        self.test_api_openapi()
        self.test_frontend_landing()
        self.test_frontend_login()
        self.test_frontend_dashboard()
        self.test_mobile_portal()
        self.test_storage_system()
        self.test_super_admin()
        
        # Test response times
        self.test_response_times()
        
        # Generate summary
        self.generate_summary()

    def generate_summary(self):
        """Generate test summary"""
        total_tests = len(self.results)
        passed_tests = sum(1 for result in self.results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print("📊 Test Summary")
        print("=" * 50)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        if failed_tests > 0:
            print("❌ Failed Tests:")
            for result in self.results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
            print()
        
        # Calculate average response time
        response_times = [r['response_time'] for r in self.results if r['response_time'] is not None]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            print(f"📈 Average Response Time: {avg_response_time:.2f}s")
        
        print()
        print("🎯 Production URLs:")
        for service, url in PRODUCTION_URLS.items():
            print(f"  {service.title()}: {url}")
        
        print()
        print("🔗 Key Endpoints:")
        print(f"  API Health: {PRODUCTION_URLS['api']}/health")
        print(f"  API Docs: {PRODUCTION_URLS['api']}/docs")
        print(f"  Frontend: {PRODUCTION_URLS['frontend']}")
        print(f"  Mobile: {PRODUCTION_URLS['mobile']}")
        print(f"  Storage: {PRODUCTION_URLS['storage']}")
        print(f"  Super Admin: {PRODUCTION_URLS['frontend']}/super-admin/auth/login")
        
        print()
        end_time = datetime.now()
        duration = end_time - self.start_time
        print(f"⏱️  Total Test Duration: {duration.total_seconds():.2f}s")
        
        # Save results to file
        with open('production_test_results.json', 'w') as f:
            json.dump({
                'test_date': self.start_time.isoformat(),
                'duration': duration.total_seconds(),
                'summary': {
                    'total': total_tests,
                    'passed': passed_tests,
                    'failed': failed_tests,
                    'success_rate': (passed_tests/total_tests)*100
                },
                'results': self.results
            }, f, indent=2)
        
        print(f"📄 Results saved to: production_test_results.json")

if __name__ == "__main__":
    tester = ProductionTester()
    tester.run_all_tests() 