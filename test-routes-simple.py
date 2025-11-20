#!/usr/bin/env python
"""Test all routes for both frontend and backend"""
import requests

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def test_backend_routes():
    print("=== Testing Backend Routes ===")
    
    routes = {
        "/admin/": "GET",
        "/api/auth/login/": "POST",
        "/api/auth/register/": "POST", 
        "/api/events/": "GET",
        "/api/vendor/auth/login/": "POST",
        "/api/vendor/auth/profile/": "GET",
        "/api/vendor/dashboard/stats/": "GET",
        "/api/vendor/bookings/": "GET",
        "/api/vendor/services/": "GET",
        "/api/vendor/venues/": "GET",
        "/chat/api/conversations/": "GET"
    }
    
    results = {}
    for route, method in routes.items():
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{route}", timeout=3)
            else:
                response = requests.post(f"{BASE_URL}{route}", json={}, timeout=3)
            
            status = response.status_code
            if status in [200, 201, 400, 401, 403, 405]:
                results[route] = f"OK {status}"
            else:
                results[route] = f"WARN {status}"
                
        except requests.exceptions.ConnectionError:
            results[route] = "FAIL Connection"
        except Exception as e:
            results[route] = "FAIL Error"
    
    return results

def test_frontend_routes():
    print("=== Testing Frontend Routes ===")
    
    routes = [
        "/",
        "/login", 
        "/signup",
        "/dashboard",
        "/vendor/",
        "/vendor/login",
        "/vendor/dashboard",
        "/vendor/dashboard/profile",
        "/vendor/dashboard/services"
    ]
    
    results = {}
    for route in routes:
        try:
            response = requests.get(f"{FRONTEND_URL}{route}", timeout=3)
            if response.status_code == 200:
                results[route] = "OK 200"
            else:
                results[route] = f"FAIL {response.status_code}"
                
        except requests.exceptions.ConnectionError:
            results[route] = "FAIL Not Running"
        except Exception:
            results[route] = "FAIL Error"
    
    return results

def main():
    print("Testing All PartyOria Routes")
    print("=" * 50)
    
    # Test backend
    backend_results = test_backend_routes()
    print("\nBackend Routes:")
    for route, status in backend_results.items():
        print(f"  {route:<30} {status}")
    
    # Test frontend
    frontend_results = test_frontend_routes()
    print("\nFrontend Routes:")
    for route, status in frontend_results.items():
        print(f"  {route:<30} {status}")
    
    # Summary
    backend_ok = sum(1 for s in backend_results.values() if "OK" in s)
    frontend_ok = sum(1 for s in frontend_results.values() if "OK" in s)
    
    print(f"\nSummary:")
    print(f"Backend: {backend_ok}/{len(backend_results)} working")
    print(f"Frontend: {frontend_ok}/{len(frontend_results)} working")

if __name__ == "__main__":
    main()