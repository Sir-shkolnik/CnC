#!/usr/bin/env python3
"""
Super Admin System Test Script
Tests all super admin functionality including authentication, company management, and cross-company data access
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
SUPER_ADMIN_CREDENTIALS = {
    "username": "udi.shkolnik",
    "password": "Id200633048!"
}

class SuperAdminTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session_token = None
        self.current_company_id = None
        
    def print_section(self, title: str):
        """Print a formatted section header"""
        print(f"\n{'='*60}")
        print(f"🧪 {title}")
        print(f"{'='*60}")
    
    def print_test(self, test_name: str, success: bool, details: str = ""):
        """Print test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")
    
    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> dict:
        """Make HTTP request and return response"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {}
        
        if self.session_token:
            headers["Authorization"] = f"Bearer {self.session_token}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=data)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data)
            elif method.upper() == "PATCH":
                response = requests.patch(url, headers=headers, json=data)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return {
                "status_code": response.status_code,
                "data": response.json() if response.content else None,
                "success": response.status_code < 400
            }
            
        except Exception as e:
            return {
                "status_code": 0,
                "data": {"error": str(e)},
                "success": False
            }
    
    def test_health_check(self):
        """Test API health check"""
        self.print_section("Health Check")
        
        result = self.make_request("GET", "/health")
        success = result["success"] and result["data"]["success"]
        
        self.print_test(
            "API Health Check",
            success,
            f"Status: {result['status_code']}, Response: {result['data']}"
        )
        
        return success
    
    def test_super_admin_login(self):
        """Test super admin login"""
        self.print_section("Super Admin Authentication")
        
        # Test login
        result = self.make_request("POST", "/super-admin/auth/login", SUPER_ADMIN_CREDENTIALS)
        success = result["success"] and result["data"]["success"]
        
        if success:
            self.session_token = result["data"]["data"]["access_token"]
            self.print_test(
                "Super Admin Login",
                True,
                f"Token: {self.session_token[:20]}..."
            )
        else:
            self.print_test(
                "Super Admin Login",
                False,
                f"Error: {result['data']}"
            )
        
        return success
    
    def test_get_profile(self):
        """Test getting super admin profile"""
        self.print_section("Super Admin Profile")
        
        result = self.make_request("GET", "/super-admin/auth/me")
        success = result["success"] and result["data"]["success"]
        
        if success:
            profile = result["data"]["data"]
            self.print_test(
                "Get Profile",
                True,
                f"Username: {profile['username']}, Role: {profile['role']}"
            )
            
            # Check available companies
            companies = profile.get("available_companies", [])
            self.print_test(
                "Available Companies",
                len(companies) > 0,
                f"Found {len(companies)} companies"
            )
            
            # Store first company for testing
            if companies:
                self.current_company_id = companies[0]["id"]
                self.print_test(
                    "Company Context",
                    True,
                    f"Selected company: {companies[0]['name']}"
                )
        else:
            self.print_test(
                "Get Profile",
                False,
                f"Error: {result['data']}"
            )
        
        return success
    
    def test_company_management(self):
        """Test company management functionality"""
        self.print_section("Company Management")
        
        # Test get all companies
        result = self.make_request("GET", "/super-admin/companies")
        success = result["success"] and result["data"]["success"]
        
        if success:
            companies = result["data"]["data"]["companies"]
            self.print_test(
                "Get All Companies",
                True,
                f"Found {len(companies)} companies"
            )
            
            # Test get specific company
            if companies:
                company_id = companies[0]["id"]
                result = self.make_request("GET", f"/super-admin/companies/{company_id}")
                success_detail = result["success"] and result["data"]["success"]
                
                self.print_test(
                    "Get Company Details",
                    success_detail,
                    f"Company: {companies[0]['name']}"
                )
        else:
            self.print_test(
                "Get All Companies",
                False,
                f"Error: {result['data']}"
            )
        
        return success
    
    def test_company_switching(self):
        """Test company context switching"""
        self.print_section("Company Context Switching")
        
        if not self.current_company_id:
            self.print_test("Company Switching", False, "No company available for testing")
            return False
        
        # Test switch company context
        result = self.make_request("POST", "/super-admin/auth/switch-company", {
            "company_id": self.current_company_id
        })
        success = result["success"] and result["data"]["success"]
        
        if success:
            company_name = result["data"]["data"]["current_company"]["name"]
            self.print_test(
                "Switch Company Context",
                True,
                f"Switched to: {company_name}"
            )
        else:
            self.print_test(
                "Switch Company Context",
                False,
                f"Error: {result['data']}"
            )
        
        return success
    
    def test_user_management(self):
        """Test user management functionality"""
        self.print_section("User Management")
        
        # Test get all users
        result = self.make_request("GET", "/super-admin/users")
        success = result["success"] and result["data"]["success"]
        
        if success:
            users = result["data"]["data"]["users"]
            self.print_test(
                "Get All Users",
                True,
                f"Found {len(users)} users"
            )
            
            # Test get users by company
            if self.current_company_id:
                result = self.make_request("GET", "/super-admin/users", {
                    "company_id": self.current_company_id
                })
                success_filter = result["success"] and result["data"]["success"]
                
                if success_filter:
                    filtered_users = result["data"]["data"]["users"]
                    self.print_test(
                        "Get Users by Company",
                        True,
                        f"Found {len(filtered_users)} users in company"
                    )
                else:
                    self.print_test(
                        "Get Users by Company",
                        False,
                        f"Error: {result['data']}"
                    )
            
            # Test get specific user
            if users:
                user_id = users[0]["id"]
                result = self.make_request("GET", f"/super-admin/users/{user_id}")
                success_detail = result["success"] and result["data"]["success"]
                
                self.print_test(
                    "Get User Details",
                    success_detail,
                    f"User: {users[0]['username']}"
                )
        else:
            self.print_test(
                "Get All Users",
                False,
                f"Error: {result['data']}"
            )
        
        return success
    
    def test_analytics(self):
        """Test analytics functionality"""
        self.print_section("Analytics & Reporting")
        
        # Test overview analytics
        result = self.make_request("GET", "/super-admin/analytics/overview")
        success = result["success"] and result["data"]["success"]
        
        if success:
            analytics = result["data"]["data"]
            self.print_test(
                "Get Analytics Overview",
                True,
                f"Companies: {analytics['total_companies']}, Users: {analytics['total_users']}, Journeys: {analytics['total_journeys']}"
            )
        else:
            self.print_test(
                "Get Analytics Overview",
                False,
                f"Error: {result['data']}"
            )
        
        return success
    
    def test_audit_logs(self):
        """Test audit logging functionality"""
        self.print_section("Audit Logs")
        
        # Test get audit logs
        result = self.make_request("GET", "/super-admin/audit-logs")
        success = result["success"] and result["data"]["success"]
        
        if success:
            logs = result["data"]["data"]["logs"]
            self.print_test(
                "Get Audit Logs",
                True,
                f"Found {len(logs)} audit log entries"
            )
            
            # Test filtered audit logs
            result = self.make_request("GET", "/super-admin/audit-logs", {
                "action_type": "LOGIN"
            })
            success_filter = result["success"] and result["data"]["success"]
            
            if success_filter:
                filtered_logs = result["data"]["data"]["logs"]
                self.print_test(
                    "Get Filtered Audit Logs",
                    True,
                    f"Found {len(filtered_logs)} login events"
                )
            else:
                self.print_test(
                    "Get Filtered Audit Logs",
                    False,
                    f"Error: {result['data']}"
                )
        else:
            self.print_test(
                "Get Audit Logs",
                False,
                f"Error: {result['data']}"
            )
        
        return success
    
    def test_logout(self):
        """Test super admin logout"""
        self.print_section("Logout")
        
        result = self.make_request("POST", "/super-admin/auth/logout")
        success = result["success"] and result["data"]["success"]
        
        if success:
            self.session_token = None
            self.print_test("Super Admin Logout", True, "Successfully logged out")
        else:
            self.print_test("Super Admin Logout", False, f"Error: {result['data']}")
        
        return success
    
    def run_all_tests(self):
        """Run all super admin tests"""
        print("🚀 Starting Super Admin System Tests")
        print(f"📡 Testing API at: {self.base_url}")
        print(f"👤 Super Admin: {SUPER_ADMIN_CREDENTIALS['username']}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        tests = [
            ("Health Check", self.test_health_check),
            ("Authentication", self.test_super_admin_login),
            ("Profile", self.test_get_profile),
            ("Company Management", self.test_company_management),
            ("Company Switching", self.test_company_switching),
            ("User Management", self.test_user_management),
            ("Analytics", self.test_analytics),
            ("Audit Logs", self.test_audit_logs),
            ("Logout", self.test_logout),
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append((test_name, result))
            except Exception as e:
                print(f"❌ ERROR in {test_name}: {str(e)}")
                results.append((test_name, False))
        
        # Summary
        self.print_section("Test Summary")
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        print(f"📊 Results: {passed}/{total} tests passed")
        print(f"📈 Success Rate: {(passed/total)*100:.1f}%")
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
        
        if passed == total:
            print("\n🎉 All tests passed! Super Admin system is working correctly.")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Please check the implementation.")
        
        return passed == total

def main():
    """Main test runner"""
    tester = SuperAdminTester(BASE_URL)
    
    # Check if API is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print(f"❌ API is not responding correctly. Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to API at {BASE_URL}. Error: {e}")
        print("💡 Make sure the API server is running: uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        return False
    
    # Run tests
    return tester.run_all_tests()

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 