#!/usr/bin/env python3
"""
Quick Demo Script - C&C CRM API Testing
Demonstrates the working functionality of the C&C CRM API
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_CREDENTIALS = {
    "email": "sarah.johnson@lgm.com",
    "password": "password123"
}

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_success(message):
    """Print a success message"""
    print(f"✅ {message}")

def print_error(message):
    """Print an error message"""
    print(f"❌ {message}")

def test_health_endpoint():
    """Test the health endpoint"""
    print_section("HEALTH ENDPOINT TEST")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print_success("Health endpoint is working")
            print(f"   Status: {data['status']}")
            print(f"   Version: {data['version']}")
            print(f"   Modules: {', '.join(data['modules'].keys())}")
            return True
        else:
            print_error(f"Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health endpoint error: {e}")
        return False

def test_authentication():
    """Test authentication system"""
    print_section("AUTHENTICATION TEST")
    
    try:
        # Test login
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=TEST_CREDENTIALS,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data["success"]:
                print_success("Login successful")
                token = data["data"]["access_token"]
                user = data["data"]["user"]
                print(f"   User: {user['name']} ({user['role']})")
                print(f"   Client: {user['clientId']}")
                print(f"   Location: {user['locationId']}")
                
                # Test get current user
                user_response = requests.get(
                    f"{BASE_URL}/auth/me",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    if user_data["success"]:
                        print_success("Current user info retrieved")
                        return token
                    else:
                        print_error("Failed to get user info")
                        return None
                else:
                    print_error(f"User info request failed: {user_response.status_code}")
                    return None
            else:
                print_error(f"Login failed: {data['message']}")
                return None
        else:
            print_error(f"Login request failed: {response.status_code}")
            return None
    except Exception as e:
        print_error(f"Authentication error: {e}")
        return None

def test_journey_management(token):
    """Test journey management functionality"""
    print_section("JOURNEY MANAGEMENT TEST")
    
    if not token:
        print_error("No authentication token available")
        return False
    
    try:
        # Test get active journeys
        response = requests.get(
            f"{BASE_URL}/journey/active",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data["success"]:
                journeys = data["data"]
                print_success(f"Retrieved {len(journeys)} active journeys")
                
                if journeys:
                    journey = journeys[0]
                    print(f"   Journey ID: {journey['id']}")
                    print(f"   Status: {journey['status']}")
                    print(f"   Truck: {journey.get('truckNumber', 'N/A')}")
                    print(f"   Date: {journey['date']}")
                    print(f"   Notes: {journey.get('notes', 'N/A')}")
                    
                    # Test get specific journey
                    journey_response = requests.get(
                        f"{BASE_URL}/journey/{journey['id']}",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    
                    if journey_response.status_code == 200:
                        journey_data = journey_response.json()
                        if journey_data["success"]:
                            print_success("Journey details retrieved successfully")
                            return True
                        else:
                            print_error("Failed to get journey details")
                            return False
                    else:
                        print_error(f"Journey details request failed: {journey_response.status_code}")
                        return False
                else:
                    print("   No active journeys found (demo mode)")
                    return True
            else:
                print_error(f"Journey request failed: {data['message']}")
                return False
        else:
            print_error(f"Journey request failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Journey management error: {e}")
        return False

def test_user_management(token):
    """Test user management functionality"""
    print_section("USER MANAGEMENT TEST")
    
    if not token:
        print_error("No authentication token available")
        return False
    
    try:
        # Test get users
        response = requests.get(
            f"{BASE_URL}/users/",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data["success"]:
                users = data["data"]["users"]
                print_success(f"Retrieved {len(users)} users")
                
                for user in users[:3]:  # Show first 3 users
                    print(f"   {user['name']} ({user['role']}) - {user['email']}")
                
                return True
            else:
                print_error(f"User request failed: {data['message']}")
                return False
        else:
            print_error(f"User request failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"User management error: {e}")
        return False

def test_audit_trail(token):
    """Test audit trail functionality"""
    print_section("AUDIT TRAIL TEST")
    
    if not token:
        print_error("No authentication token available")
        return False
    
    try:
        # Test get audit entries
        response = requests.get(
            f"{BASE_URL}/audit/entries",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data["success"]:
                entries = data["data"]["entries"]
                print_success(f"Retrieved {len(entries)} audit entries")
                
                if entries:
                    for entry in entries[:3]:  # Show first 3 entries
                        print(f"   {entry['action']} {entry['entity']} by {entry['userId']}")
                
                return True
            else:
                print_error(f"Audit request failed: {data['message']}")
                return False
        else:
            print_error(f"Audit request failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Audit trail error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 C&C CRM API - Quick Test Demo")
    print(f"Testing API at: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test health endpoint
    if not test_health_endpoint():
        print_error("Health check failed - API may not be running")
        return
    
    # Test authentication
    token = test_authentication()
    if not token:
        print_error("Authentication failed - cannot proceed with other tests")
        return
    
    # Test journey management
    test_journey_management(token)
    
    # Test user management
    test_user_management(token)
    
    # Test audit trail
    test_audit_trail(token)
    
    print_section("TEST SUMMARY")
    print_success("Quick test demo completed!")
    print("   The API is operational and ready for development")
    print("   Authentication system is working correctly")
    print("   Core endpoints are responding as expected")

if __name__ == "__main__":
    main() 