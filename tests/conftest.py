import pytest
import requests
import os
import sys
from typing import Dict, Any

# Add the project root to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

@pytest.fixture(scope="session")
def base_url():
    """Base URL for API testing"""
    return "http://localhost:8000"

@pytest.fixture(scope="session")
def test_credentials():
    """Test credentials from documentation"""
    return {
        "admin": {
            "email": "sarah.johnson@lgm.com",
            "password": "password123"
        },
        "dispatcher": {
            "email": "mike.chen@lgm.com",
            "password": "password123"
        },
        "driver": {
            "email": "david.rodriguez@lgm.com",
            "password": "password123"
        },
        "franchise_owner": {
            "email": "frank.williams@lgmhamilton.com",
            "password": "password123"
        }
    }

@pytest.fixture(scope="session")
def admin_token(base_url, test_credentials):
    """Get admin authentication token for testing"""
    credentials = test_credentials["admin"]
    
    response = requests.post(
        f"{base_url}/auth/login",
        json=credentials,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code != 200:
        pytest.skip("Could not authenticate with admin credentials")
    
    return response.json()["data"]["token"]

@pytest.fixture(scope="session")
def dispatcher_token(base_url, test_credentials):
    """Get dispatcher authentication token for testing"""
    credentials = test_credentials["dispatcher"]
    
    response = requests.post(
        f"{base_url}/auth/login",
        json=credentials,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code != 200:
        pytest.skip("Could not authenticate with dispatcher credentials")
    
    return response.json()["data"]["token"]

@pytest.fixture(scope="session")
def driver_token(base_url, test_credentials):
    """Get driver authentication token for testing"""
    credentials = test_credentials["driver"]
    
    response = requests.post(
        f"{base_url}/auth/login",
        json=credentials,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code != 200:
        pytest.skip("Could not authenticate with driver credentials")
    
    return response.json()["data"]["token"]

@pytest.fixture(scope="session")
def api_health_check(base_url):
    """Check if API is running before running tests"""
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code != 200:
            pytest.skip("API health check failed")
        return True
    except requests.exceptions.RequestException:
        pytest.skip("API server is not running")

@pytest.fixture(autouse=True)
def check_api_health(api_health_check):
    """Automatically check API health before each test"""
    pass 