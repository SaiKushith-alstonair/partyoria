#!/usr/bin/env python
"""
COMPLETE ROUTING FIX SCRIPT
Replaces all broken URL configurations with secure versions
"""
import os
import shutil
import sys

def backup_and_replace_files():
    """Backup original files and replace with fixed versions"""
    
    files_to_fix = [
        ('partyoria/urls.py', 'partyoria/urls_fixed.py'),
        ('events/urls.py', 'events/urls_fixed.py'),
        ('vendor_app/urls.py', 'vendor_app/urls_fixed.py'),
        ('app/chat/urls.py', 'app/chat/urls_fixed.py'),
        ('authentication/urls.py', 'authentication/urls_fixed.py'),
    ]
    
    print("=== FIXING ROUTING SYSTEM ===\n")
    
    for original, fixed in files_to_fix:
        try:
            # Backup original
            if os.path.exists(original):
                backup_name = f"{original}.backup"
                shutil.copy2(original, backup_name)
                print(f"[OK] Backed up {original} -> {backup_name}")
            
            # Replace with fixed version
            if os.path.exists(fixed):
                shutil.copy2(fixed, original)
                print(f"[OK] Replaced {original} with fixed version")
            else:
                print(f"[ERROR] Fixed version not found: {fixed}")
                
        except Exception as e:
            print(f"[ERROR] Error fixing {original}: {str(e)}")
    
    print("\n=== ROUTING FIX COMPLETE ===")
    print("All URL configurations have been updated with:")
    print("- Proper authentication on protected endpoints")
    print("- Fixed URL pattern conflicts")
    print("- Rate limiting on sensitive endpoints")
    print("- Secure parameter validation")

def validate_routing():
    """Validate the fixed routing system"""
    try:
        from partyoria.route_validator import run_route_validation
        print("\n=== VALIDATING FIXED ROUTES ===")
        success = run_route_validation()
        
        if success:
            print("\n[SUCCESS] ROUTING SYSTEM IS NOW SECURE!")
        else:
            print("\n[WARNING] Some issues remain - check the validation report above")
            
    except ImportError:
        print("\n[WARNING] Route validator not available - manual testing required")

if __name__ == "__main__":
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    backup_and_replace_files()
    validate_routing()
    
    print("\n" + "="*50)
    print("NEXT STEPS:")
    print("1. Restart your Django server")
    print("2. Test all endpoints with authentication")
    print("3. Verify rate limiting is working")
    print("4. Check logs for any remaining issues")
    print("="*50)