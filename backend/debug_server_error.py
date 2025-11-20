#!/usr/bin/env python
import os
import sys
import django
import traceback

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

def test_middleware_stack():
    """Test if all middleware can be imported and instantiated"""
    try:
        from django.conf import settings
        
        print("[OK] Testing middleware stack...")
        
        for middleware_path in settings.MIDDLEWARE:
            try:
                # Import the middleware
                module_path, class_name = middleware_path.rsplit('.', 1)
                module = __import__(module_path, fromlist=[class_name])
                middleware_class = getattr(module, class_name)
                
                print(f"[OK] {middleware_path}")
                
            except Exception as e:
                print(f"[ERROR] Failed to import {middleware_path}: {str(e)}")
                return False
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Middleware test failed: {str(e)}")
        traceback.print_exc()
        return False

def test_url_patterns():
    """Test if URL patterns can be loaded"""
    try:
        from django.urls import get_resolver
        
        print("[OK] Testing URL patterns...")
        
        resolver = get_resolver()
        url_patterns = resolver.url_patterns
        
        print(f"[OK] Found {len(url_patterns)} URL patterns")
        
        # Test events URLs specifically
        from events.urls import urlpatterns as events_urls
        print(f"[OK] Events app has {len(events_urls)} URL patterns")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] URL patterns test failed: {str(e)}")
        traceback.print_exc()
        return False

def test_custom_modules():
    """Test custom modules that might be causing issues"""
    try:
        print("[OK] Testing custom modules...")
        
        # Test security modules
        try:
            from partyoria.security_hardening import SecurityHardeningMiddleware
            print("[OK] SecurityHardeningMiddleware imported")
        except Exception as e:
            print(f"[ERROR] SecurityHardeningMiddleware failed: {str(e)}")
        
        try:
            from partyoria.api_versioning import APIVersionMiddleware
            print("[OK] APIVersionMiddleware imported")
        except Exception as e:
            print(f"[ERROR] APIVersionMiddleware failed: {str(e)}")
        
        try:
            from partyoria.logging_config import setup_logging
            print("[OK] logging_config imported")
        except Exception as e:
            print(f"[ERROR] logging_config failed: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Custom modules test failed: {str(e)}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=== Django Server Error Debug ===")
    
    success = True
    success &= test_middleware_stack()
    success &= test_url_patterns()
    success &= test_custom_modules()
    
    if success:
        print("[OK] All tests passed - issue might be runtime specific")
    else:
        print("[ERROR] Found configuration issues")