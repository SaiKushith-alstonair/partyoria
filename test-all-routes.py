#!/usr/bin/env python
"""Test all routes for both frontend and backend"""
import requests
import json

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def test_backend_routes():
    print("=== Testing Backend Routes ===")
    
    routes = {
        # Admin
        "/admin/": "GET",
        
        # Customer Authentication
        "/api/auth/login/": "POST",
        "/api/auth/register/": "POST",
        "/api/auth/logout/": "POST",
        "/api/auth/profile/": "GET",
        
        # Events API
        "/api/events/": "GET",
        "/api/budgets/": "GET",
        "/api/rsvp/": "GET",
        
        # Vendor Authentication
        "/api/vendor/auth/login/": "POST",
        "/api/vendor/auth/profile/": "GET",
        
        # Vendor Dashboard
        "/api/vendor/dashboard/stats/": "GET",
        "/api/vendor/bookings/": "GET",
        "/api/vendor/services/": "GET",
        "/api/vendor/venues/": "GET",
        
        # Chat
        "/chat/api/conversations/": "GET",
        
        # Static/Media
        "/static/": "GET",
        "/media/": "GET"
    }
    
    results = {}
    for route, method in routes.items():
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{route}", timeout=5)
            else:
                response = requests.post(f"{BASE_URL}{route}", json={}, timeout=5)
            
            status = response.status_code
            if status in [200, 201, 400, 401, 403, 405]:  # Expected statuses
                results[route] = f"✅ {status}"
            else:
                results[route] = f"⚠️ {status}"
                
        except requests.exceptions.ConnectionError:
            results[route] = "❌ Connection Failed"
        except requests.exceptions.Timeout:
            results[route] = "⏱️ Timeout"
        except Exception as e:
            results[route] = f"❌ {str(e)[:30]}"
    
    return results

def test_frontend_routes():
    print("=== Testing Frontend Routes ===")
    
    routes = [
        # Customer Routes
        "/",
        "/login",
        "/signup", 
        "/landing",
        "/event-creation",
        "/event-list",
        "/budget-management",
        "/dashboard",
        "/rsvp",
        
        # Vendor Routes
        "/vendor/",
        "/vendor/login",
        "/vendor/onboarding",
        "/vendor/dashboard",
        "/vendor/dashboard/profile",
        "/vendor/dashboard/bookings",
        "/vendor/dashboard/services",
        "/vendor/dashboard/calendar",
        "/vendor/dashboard/analytics",
        "/vendor/dashboard/verification",
        "/vendor/dashboard/settings"
    ]
    
    results = {}
    for route in routes:
        try:
            response = requests.get(f"{FRONTEND_URL}{route}", timeout=5)
            status = response.status_code
            
            if status == 200:
                results[route] = "✅ 200"
            elif status == 404:
                results[route] = "❌ 404 Not Found"
            else:
                results[route] = f"⚠️ {status}"
                
        except requests.exceptions.ConnectionError:
            results[route] = "❌ Frontend Not Running"
        except requests.exceptions.Timeout:
            results[route] = "⏱️ Timeout"
        except Exception as e:
            results[route] = f"❌ {str(e)[:30]}"
    
    return results

def check_route_conflicts():
    print("=== Checking Route Conflicts ===")
    
    conflicts = []
    
    # Check for duplicate backend routes
    backend_routes = [
        "/api/venues/",  # Could conflict between events and vendors
        "/api/auth/",    # Should be unique to authentication
    ]
    
    # Test if routes return different responses
    for route in backend_routes:
        try:
            response = requests.get(f"{BASE_URL}{route}")
            print(f"{route}: {response.status_code}")
        except:
            print(f"{route}: Not accessible")
    
    return conflicts

def test_api_endpoints_with_auth():
    print("=== Testing API Endpoints with Authentication ===")
    
    # Test vendor login first
    login_data = {"username": "faaran@mail.comf", "password": "defaultPassword123"}
    
    try:
        login_response = requests.post(f"{BASE_URL}/api/vendor/auth/login/", json=login_data)
        
        if login_response.status_code == 200:
            data = login_response.json()
            session_key = data.get('session_key')
            cookies = {'sessionid': session_key} if session_key else {}
            
            # Test authenticated endpoints
            auth_endpoints = [
                "/api/vendor/dashboard/stats/",
                "/api/vendor/bookings/", 
                "/api/vendor/services/",
                "/api/vendor/auth/profile/"
            ]
            
            auth_results = {}
            for endpoint in auth_endpoints:
                try:
                    response = requests.get(f"{BASE_URL}{endpoint}", cookies=cookies)
                    auth_results[endpoint] = f"✅ {response.status_code}"
                except Exception as e:
                    auth_results[endpoint] = f"❌ {str(e)[:30]}"
            
            return auth_results
        else:
            return {"auth_error": f"Login failed: {login_response.status_code}"}
            
    except Exception as e:
        return {"connection_error": str(e)}

def main():
    print("🧪 Testing All PartyOria Routes")
    print("=" * 60)
    
    # Test backend routes
    backend_results = test_backend_routes()
    print("\n📡 Backend Routes:")
    for route, status in backend_results.items():
        print(f"  {route:<35} {status}")
    
    # Test frontend routes  
    frontend_results = test_frontend_routes()
    print("\n🌐 Frontend Routes:")
    for route, status in frontend_results.items():
        print(f"  {route:<35} {status}")
    
    # Test authenticated endpoints
    auth_results = test_api_endpoints_with_auth()
    print("\n🔐 Authenticated Endpoints:")
    for endpoint, status in auth_results.items():
        print(f"  {endpoint:<35} {status}")
    
    # Check for conflicts
    print("\n⚠️ Route Conflicts:")
    check_route_conflicts()
    
    # Summary
    backend_working = sum(1 for status in backend_results.values() if "✅" in status)
    frontend_working = sum(1 for status in frontend_results.values() if "✅" in status)
    auth_working = sum(1 for status in auth_results.values() if "✅" in status)
    
    print("\n" + "=" * 60)
    print("📊 Summary:")
    print(f"Backend Routes: {backend_working}/{len(backend_results)} working")
    print(f"Frontend Routes: {frontend_working}/{len(frontend_results)} working") 
    print(f"Auth Endpoints: {auth_working}/{len(auth_results)} working")
    
    total_working = backend_working + frontend_working + auth_working
    total_routes = len(backend_results) + len(frontend_results) + len(auth_results)
    
    if total_working == total_routes:
        print("🎉 All routes working perfectly!")
    elif total_working > total_routes * 0.8:
        print("✅ Most routes working - minor issues detected")
    else:
        print("⚠️ Multiple route issues detected")

if __name__ == "__main__":
    main()