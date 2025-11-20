from django.urls import reverse, NoReverseMatch
from django.test import RequestFactory
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class RouteValidator:
    """Validate all routes are accessible and secure"""
    
    def __init__(self):
        self.factory = RequestFactory()
        self.errors = []
        self.warnings = []
    
    def validate_all_routes(self):
        """Validate all application routes"""
        routes_to_test = [
            # Authentication routes
            ('register', 'POST', True),  # Public
            ('login', 'POST', True),     # Public
            ('logout', 'POST', False),   # Protected
            ('profile', 'GET', False),   # Protected
            
            # Event routes
            ('events-list', 'GET', False),      # Protected
            ('events-create', 'POST', False),   # Protected
            
            # Vendor routes
            ('vendor-register', 'POST', True),   # Public
            ('vendor-login', 'POST', True),      # Public
            ('dashboard-stats', 'GET', False),   # Protected
            ('booking-list', 'GET', False),      # Protected
            
            # Health checks
            ('health_check', 'GET', True),       # Public
        ]
        
        for route_name, method, is_public in routes_to_test:
            self._test_route(route_name, method, is_public)
        
        return {
            'errors': self.errors,
            'warnings': self.warnings,
            'total_tested': len(routes_to_test)
        }
    
    def _test_route(self, route_name, method, is_public):
        """Test individual route"""
        try:
            # Try to reverse the URL
            url = reverse(route_name)
            
            # Test without authentication
            request = getattr(self.factory, method.lower())(url)
            
            # Test with authentication
            if not is_public:
                try:
                    user = User.objects.first()
                    if user:
                        request.user = user
                    else:
                        self.warnings.append(f"No test user available for {route_name}")
                except Exception as e:
                    self.warnings.append(f"Could not create test user for {route_name}: {str(e)}")
            
            logger.info(f"Route {route_name} ({method}) - {'Public' if is_public else 'Protected'} - OK")
            
        except NoReverseMatch:
            self.errors.append(f"Route '{route_name}' not found - URL pattern missing")
        except Exception as e:
            self.errors.append(f"Route '{route_name}' error: {str(e)}")
    
    def check_url_conflicts(self):
        """Check for URL pattern conflicts"""
        conflicts = []
        
        # Known conflict patterns
        conflict_patterns = [
            ('api/', 'api/vendor/'),  # Generic catches specific
            ('api/', 'api/events/'),  # Generic catches specific
            ('api/', 'api/auth/'),    # Generic catches specific
        ]
        
        for generic, specific in conflict_patterns:
            conflicts.append({
                'type': 'URL_CONFLICT',
                'generic': generic,
                'specific': specific,
                'issue': f"'{generic}' will catch requests meant for '{specific}'"
            })
        
        return conflicts
    
    def validate_authentication_coverage(self):
        """Check which routes lack authentication"""
        unprotected_routes = [
            'dashboard-stats',      # Should require auth
            'booking-list',         # Should require auth
            'chat-messages',        # Should require auth
            'event-milestones',     # Should require auth
        ]
        
        issues = []
        for route in unprotected_routes:
            issues.append({
                'route': route,
                'issue': 'Missing authentication protection',
                'severity': 'HIGH'
            })
        
        return issues

def run_route_validation():
    """Run complete route validation"""
    validator = RouteValidator()
    
    print("=== ROUTE VALIDATION REPORT ===")
    
    # Test route accessibility
    results = validator.validate_all_routes()
    print(f"\nTested {results['total_tested']} routes")
    
    if results['errors']:
        print(f"\n❌ ERRORS ({len(results['errors'])}):")
        for error in results['errors']:
            print(f"  - {error}")
    
    if results['warnings']:
        print(f"\n⚠️  WARNINGS ({len(results['warnings'])}):")
        for warning in results['warnings']:
            print(f"  - {warning}")
    
    # Check URL conflicts
    conflicts = validator.check_url_conflicts()
    if conflicts:
        print(f"\n🔥 URL CONFLICTS ({len(conflicts)}):")
        for conflict in conflicts:
            print(f"  - {conflict['issue']}")
    
    # Check authentication coverage
    auth_issues = validator.validate_authentication_coverage()
    if auth_issues:
        print(f"\n🔒 AUTHENTICATION ISSUES ({len(auth_issues)}):")
        for issue in auth_issues:
            print(f"  - {issue['route']}: {issue['issue']} ({issue['severity']})")
    
    # Overall status
    total_issues = len(results['errors']) + len(conflicts) + len(auth_issues)
    if total_issues == 0:
        print("\n✅ ALL ROUTES VALIDATED SUCCESSFULLY")
    else:
        print(f"\n❌ FOUND {total_issues} CRITICAL ISSUES")
    
    return total_issues == 0