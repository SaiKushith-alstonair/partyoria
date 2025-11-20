#!/usr/bin/env python
"""Fix all @/ imports in vendor directory"""
import os
import re

def fix_imports_in_file(file_path):
    """Fix @/ imports in a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix different types of imports based on file location
    if 'components/ui/' in file_path:
        # UI components - fix @/lib/utils and @/components/ui/
        content = re.sub(r'from "@/lib/utils"', 'from "../../lib/utils"', content)
        content = re.sub(r'from "@/components/ui/([^"]+)"', r'from "./\1"', content)
        content = re.sub(r'from "@/hooks/([^"]+)"', r'from "../../hooks/\1"', content)
    
    elif 'components/dashboard/' in file_path:
        # Dashboard components
        content = re.sub(r'from "@/components/ui/([^"]+)"', r'from "../ui/\1"', content)
    
    elif 'components/VerificationPopup.tsx' in file_path:
        # Verification popup
        content = re.sub(r'from "@/components/ui/([^"]+)"', r'from "./ui/\1"', content)
    
    elif 'pages/dashboard/' in file_path:
        # Dashboard pages
        content = re.sub(r'from "@/components/ui/([^"]+)"', r'from "../../components/ui/\1"', content)
        content = re.sub(r'from "@/services/api"', 'from "../../services/api"', content)
    
    elif 'pages/' in file_path and 'dashboard' not in file_path:
        # Top-level pages
        content = re.sub(r'from "@/components/ui/([^"]+)"', r'from "../components/ui/\1"', content)
        content = re.sub(r'from "@/services/api"', 'from "../services/api"', content)
    
    elif 'hooks/' in file_path:
        # Hooks
        content = re.sub(r'from "@/components/ui/([^"]+)"', r'from "../components/ui/\1"', content)
        content = re.sub(r'from "@/services/api"', 'from "../services/api"', content)
    
    # Write back if changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {file_path}")
        return True
    return False

def main():
    vendor_dir = r"C:\Users\User\OneDrive\Desktop\event creation\frontend\src\vendor"
    
    fixed_count = 0
    for root, dirs, files in os.walk(vendor_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                file_path = os.path.join(root, file)
                if fix_imports_in_file(file_path):
                    fixed_count += 1
    
    print(f"Fixed {fixed_count} files")

if __name__ == "__main__":
    main()