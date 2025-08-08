#!/usr/bin/env python3
"""
🔍 SmartMoving API Test Script
==============================

This script tests the correct SmartMoving API endpoints and structure.
"""

import requests
import json
import sys
from datetime import datetime

# SmartMoving API Configuration
SMARTMOVING_BASE_URL = "https://api-public.smartmoving.com/v1"
API_KEY = "185840176c73420fbd3a473c2fdccedb"

def test_smartmoving_endpoints():
    """Test different SmartMoving API endpoints"""
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    print("🔍 Testing SmartMoving API endpoints...")
    
    # Test different possible endpoints
    endpoints_to_test = [
        "/api/health",
        "/health",
        "/api/status",
        "/status",
        "/api/customers",
        "/customers",
        "/api/opportunities", 
        "/opportunities",
        "/api/jobs",
        "/jobs"
    ]
    
    for endpoint in endpoints_to_test:
        try:
            url = f"{SMARTMOVING_BASE_URL}{endpoint}"
            print(f"\n📡 Testing: {endpoint}")
            
            response = requests.get(url, headers=headers, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success: {type(data)}")
                if isinstance(data, dict):
                    print(f"   📊 Keys: {list(data.keys())[:5]}...")
                elif isinstance(data, list):
                    print(f"   📊 Items: {len(data)} items")
            elif response.status_code == 404:
                print(f"   ❌ Not Found")
            elif response.status_code == 401:
                print(f"   🔐 Unauthorized")
            else:
                print(f"   ⚠️  Other: {response.text[:100]}...")
                
        except Exception as e:
            print(f"   💥 Error: {e}")

def test_smartmoving_customers():
    """Test SmartMoving customers endpoint"""
    print("\n👥 Testing SmartMoving customers...")
    
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    try:
        # Try different customer endpoints
        endpoints = ["/customers", "/api/customers"]
        
        for endpoint in endpoints:
            url = f"{SMARTMOVING_BASE_URL}{endpoint}"
            print(f"📡 Testing: {endpoint}")
            
            response = requests.get(url, headers=headers, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Found data structure: {type(data)}")
                print(f"   📊 Response keys: {list(data.keys())}")
                
                # Check if it's a paginated response
                if 'pageResults' in data:
                    customers = data['pageResults']
                    print(f"   📋 Customers: {len(customers)}")
                    
                    if customers and len(customers) > 0:
                        customer = customers[0]
                        print(f"   📋 Sample customer:")
                        print(f"      Name: {customer.get('name', 'N/A')}")
                        print(f"      Email: {customer.get('emailAddress', 'N/A')}")
                        print(f"      Phone: {customer.get('phoneNumber', 'N/A')}")
                        print(f"      Customer keys: {list(customer.keys())}")
                        
                        # Check for opportunities
                        opportunities = customer.get('opportunities')
                        if opportunities is not None:
                            print(f"      Opportunities: {len(opportunities)}")
                            
                            if opportunities:
                                opp = opportunities[0]
                                print(f"      Sample Opportunity:")
                                print(f"        Quote: {opp.get('quoteNumber', 'N/A')}")
                                print(f"        Status: {opp.get('status', 'N/A')}")
                                
                                # Check for jobs
                                jobs = opp.get('jobs')
                                if jobs is not None:
                                    print(f"        Jobs: {len(jobs)}")
                                    
                                    if jobs:
                                        job = jobs[0]
                                        print(f"        Sample Job:")
                                        print(f"          Job Number: {job.get('jobNumber', 'N/A')}")
                                        print(f"          Date: {job.get('jobDate', 'N/A')}")
                                        print(f"          Type: {job.get('type', 'N/A')}")
                                        print(f"          Confirmed: {job.get('confirmed', 'N/A')}")
                                else:
                                    print(f"        Jobs: None")
                        else:
                            print(f"      Opportunities: None")
                        
                        # Look for jobs directly in customer
                        jobs = customer.get('jobs')
                        if jobs is not None:
                            print(f"      Direct Jobs: {len(jobs)}")
                            if jobs:
                                job = jobs[0]
                                print(f"      Sample Direct Job:")
                                print(f"        Job Number: {job.get('jobNumber', 'N/A')}")
                                print(f"        Date: {job.get('jobDate', 'N/A')}")
                                print(f"        Type: {job.get('type', 'N/A')}")
                                print(f"        Confirmed: {job.get('confirmed', 'N/A')}")
                        else:
                            print(f"      Direct Jobs: None")
                else:
                    # Direct array response
                    print(f"   📋 Direct response with {len(data)} items")
                    if data and len(data) > 0:
                        customer = data[0]
                        print(f"   📋 Sample customer:")
                        print(f"      Name: {customer.get('name', 'N/A')}")
                        print(f"      Email: {customer.get('emailAddress', 'N/A')}")
                        print(f"      Phone: {customer.get('phoneNumber', 'N/A')}")
                
                return True
            else:
                print(f"   ❌ Failed: {response.text[:100]}...")
                
    except Exception as e:
        print(f"   💥 Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_smartmoving_jobs():
    """Test SmartMoving jobs endpoint"""
    print("\n📋 Testing SmartMoving jobs...")
    
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    try:
        # Try different job endpoints
        endpoints = ["/jobs", "/api/jobs"]
        
        for endpoint in endpoints:
            url = f"{SMARTMOVING_BASE_URL}{endpoint}"
            print(f"📡 Testing: {endpoint}")
            
            # Try with and without parameters
            params_variations = [
                {},
                {"PageSize": 10},
                {"JobDate": today},
                {"PageSize": 10, "JobDate": today}
            ]
            
            for params in params_variations:
                print(f"   📊 Params: {params}")
                
                response = requests.get(url, headers=headers, params=params, timeout=10)
                print(f"      Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"      ✅ Success: {type(data)}")
                    
                    if isinstance(data, dict):
                        print(f"      📊 Keys: {list(data.keys())}")
                        if 'pageResults' in data:
                            jobs = data['pageResults']
                            print(f"      📋 Jobs: {len(jobs)}")
                            
                            if jobs:
                                job = jobs[0]
                                print(f"      📋 Sample Job:")
                                print(f"        Job Number: {job.get('jobNumber', 'N/A')}")
                                print(f"        Date: {job.get('jobDate', 'N/A')}")
                                print(f"        Status: {job.get('status', 'N/A')}")
                    
                    return True
                else:
                    print(f"      ❌ Failed: {response.text[:100]}...")
                    
    except Exception as e:
        print(f"   💥 Error: {e}")
        return False

def find_customers_with_jobs():
    """Find customers that have opportunities and jobs"""
    print("\n🔍 Finding customers with jobs...")
    
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    try:
        url = f"{SMARTMOVING_BASE_URL}/api/customers"
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            customers = data.get('pageResults', [])
            
            print(f"📊 Total customers: {len(customers)}")
            
            customers_with_opportunities = []
            customers_with_jobs = []
            
            for i, customer in enumerate(customers):
                opportunities = customer.get('opportunities')
                
                if opportunities is not None and len(opportunities) > 0:
                    customers_with_opportunities.append(customer)
                    
                    # Check for jobs in opportunities
                    for opp in opportunities:
                        jobs = opp.get('jobs')
                        if jobs is not None and len(jobs) > 0:
                            customers_with_jobs.append({
                                'customer': customer,
                                'opportunity': opp,
                                'jobs': jobs
                            })
                            break
            
            print(f"📋 Customers with opportunities: {len(customers_with_opportunities)}")
            print(f"📋 Customers with jobs: {len(customers_with_jobs)}")
            
            if customers_with_jobs:
                print("\n📋 Sample customer with jobs:")
                sample = customers_with_jobs[0]
                customer = sample['customer']
                opportunity = sample['opportunity']
                jobs = sample['jobs']
                
                print(f"   Customer: {customer.get('name', 'N/A')}")
                print(f"   Email: {customer.get('emailAddress', 'N/A')}")
                print(f"   Phone: {customer.get('phoneNumber', 'N/A')}")
                print(f"   Opportunity Quote: {opportunity.get('quoteNumber', 'N/A')}")
                print(f"   Jobs: {len(jobs)}")
                
                for i, job in enumerate(jobs[:3]):  # Show first 3 jobs
                    print(f"   Job {i+1}:")
                    print(f"     Job Number: {job.get('jobNumber', 'N/A')}")
                    print(f"     Date: {job.get('jobDate', 'N/A')}")
                    print(f"     Type: {job.get('type', 'N/A')}")
                    print(f"     Confirmed: {job.get('confirmed', 'N/A')}")
                    print(f"     Addresses: {len(job.get('jobAddresses', []))}")
                
                return customers_with_jobs
            else:
                print("❌ No customers found with jobs")
                return []
        else:
            print(f"❌ Failed to get customers: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"💥 Error: {e}")
        import traceback
        traceback.print_exc()
        return []

def main():
    """Main function"""
    print("🔍 SmartMoving API Structure Test")
    print("=" * 50)
    print(f"⏰ Test Time: {datetime.now().isoformat()}")
    
    # Test all endpoints
    test_smartmoving_endpoints()
    
    # Test specific data endpoints
    customers_ok = test_smartmoving_customers()
    jobs_ok = test_smartmoving_jobs()
    
    # Find customers with jobs
    customers_with_jobs = find_customers_with_jobs()
    
    print("\n" + "=" * 50)
    print("🎯 Test Results Summary")
    print("=" * 50)
    
    print(f"👥 Customers API: {'✅ WORKING' if customers_ok else '❌ FAILED'}")
    print(f"📋 Jobs API: {'✅ WORKING' if jobs_ok else '❌ FAILED'}")
    print(f"📋 Customers with jobs: {len(customers_with_jobs)}")
    
    if customers_ok and customers_with_jobs:
        print("\n🎉 SmartMoving API is accessible and has job data!")
        print("📊 Ready to integrate with C&C CRM")
        return True
    elif customers_ok:
        print("\n⚠️  SmartMoving API accessible but no job data found")
        print("🔧 May need to check different date ranges or filters")
        return False
    else:
        print("\n⚠️  SmartMoving API endpoints failed")
        print("🔧 Check the details above for issues")
        return False

if __name__ == "__main__":
    main() 