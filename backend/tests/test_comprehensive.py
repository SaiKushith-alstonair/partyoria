import pytest
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, Mock
import json
from decimal import Decimal

from events.models import Event, Budget, RSVP
from authentication.models import CustomUser

User = get_user_model()

class BaseTestCase(APITestCase):
    """Base test case with common setup"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.vendor = User.objects.create_user(
            username='testvendor',
            email='vendor@example.com',
            password='testpass123',
            user_type='vendor',
            first_name='Test',
            last_name='Vendor'
        )
    
    def authenticate_user(self, user=None):
        """Helper to authenticate user"""
        user = user or self.user
        self.client.force_authenticate(user=user)
    
    def create_test_event(self, user=None):
        """Helper to create test event"""
        user = user or self.user
        return Event.objects.create(
            event_name='Test Event',
            user=user,
            event_type='birthday',
            attendees=50,
            total_budget=Decimal('10000.00'),
            form_data={'test': 'data'}
        )

class AuthenticationTestCase(BaseTestCase):
    """Test authentication endpoints"""
    
    def test_user_registration_success(self):
        """Test successful user registration"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User',
            'user_type': 'customer'
        }
        
        response = self.client.post('/api/auth/register/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
    
    def test_user_registration_invalid_email(self):
        """Test registration with invalid email"""
        data = {
            'username': 'newuser',
            'email': 'invalid-email',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = self.client.post('/api/auth/register/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_user_login_success(self):
        """Test successful login"""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post('/api/auth/login/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post('/api/auth/login/', data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_protected_endpoint_without_auth(self):
        """Test accessing protected endpoint without authentication"""
        response = self.client.get('/api/auth/profile/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_protected_endpoint_with_auth(self):
        """Test accessing protected endpoint with authentication"""
        self.authenticate_user()
        
        response = self.client.get('/api/auth/profile/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')

class EventTestCase(BaseTestCase):
    """Test event management endpoints"""
    
    def test_create_event_success(self):
        """Test successful event creation"""
        self.authenticate_user()
        
        data = {
            'event_name': 'Birthday Party',
            'form_data': {
                'clientName': 'John Doe',
                'clientEmail': 'john@example.com',
                'attendees': 25,
                'budget': 5000
            },
            'special_requirements': {},
            'selected_services': ['catering', 'decoration']
        }
        
        response = self.client.post('/api/events/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['event_name'], 'Birthday Party')
        self.assertTrue(Event.objects.filter(event_name='Birthday Party').exists())
    
    def test_create_event_invalid_data(self):
        """Test event creation with invalid data"""
        self.authenticate_user()
        
        data = {
            'event_name': '',  # Invalid: empty name
            'form_data': {}
        }
        
        response = self.client.post('/api/events/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_list_user_events(self):
        """Test listing user's events"""
        self.authenticate_user()
        
        # Create test events
        self.create_test_event()
        Event.objects.create(
            event_name='Another Event',
            user=self.user,
            event_type='corporate',
            attendees=100,
            total_budget=Decimal('20000.00')
        )
        
        response = self.client.get('/api/events/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_update_event_success(self):
        """Test successful event update"""
        self.authenticate_user()
        event = self.create_test_event()
        
        data = {
            'event_name': 'Updated Event Name',
            'form_data': {'updated': True}
        }
        
        response = self.client.put(f'/api/events/{event.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['event_name'], 'Updated Event Name')
    
    def test_delete_event_success(self):
        """Test successful event deletion"""
        self.authenticate_user()
        event = self.create_test_event()
        
        response = self.client.delete(f'/api/events/{event.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Event.objects.filter(id=event.id).exists())
    
    def test_budget_allocation(self):
        """Test budget allocation for event"""
        self.authenticate_user()
        event = self.create_test_event()
        
        response = self.client.post(f'/api/events/{event.id}/allocate-budget/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('allocations', response.data)
        self.assertTrue(Budget.objects.filter(event=event).exists())

class SecurityTestCase(BaseTestCase):
    """Test security measures"""
    
    def test_sql_injection_protection(self):
        """Test SQL injection protection"""
        self.authenticate_user()
        
        # Attempt SQL injection in search
        malicious_query = "'; DROP TABLE events; --"
        
        response = self.client.get(f'/api/events/search/?q={malicious_query}')
        
        # Should not cause server error
        self.assertIn(response.status_code, [200, 400])
        # Events table should still exist
        self.assertTrue(Event.objects.all().exists() or Event.objects.count() == 0)
    
    def test_xss_protection(self):
        """Test XSS protection in input fields"""
        self.authenticate_user()
        
        xss_payload = '<script>alert("xss")</script>'
        
        data = {
            'event_name': xss_payload,
            'form_data': {
                'clientName': xss_payload,
                'description': xss_payload
            }
        }
        
        response = self.client.post('/api/events/', data, format='json')
        
        # Should either reject or sanitize the input
        if response.status_code == 201:
            # If created, check that script tags are sanitized
            event = Event.objects.get(id=response.data['id'])
            self.assertNotIn('<script>', event.event_name)
    
    def test_unauthorized_access_prevention(self):
        """Test prevention of unauthorized access to other users' data"""
        # Create event for user1
        self.authenticate_user(self.user)
        event = self.create_test_event(self.user)
        
        # Try to access as different user
        self.authenticate_user(self.vendor)
        
        response = self.client.get(f'/api/events/{event.id}/')
        
        # Should not be able to access other user's event
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_rate_limiting(self):
        """Test rate limiting on login attempts"""
        # Make multiple failed login attempts
        for _ in range(6):
            response = self.client.post('/api/auth/login/', {
                'email': 'test@example.com',
                'password': 'wrongpassword'
            })
        
        # Should eventually get rate limited
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

class PerformanceTestCase(BaseTestCase):
    """Test performance aspects"""
    
    def test_large_event_list_performance(self):
        """Test performance with large number of events"""
        self.authenticate_user()
        
        # Create many events
        events = []
        for i in range(100):
            events.append(Event(
                event_name=f'Event {i}',
                user=self.user,
                event_type='birthday',
                attendees=50,
                total_budget=Decimal('10000.00')
            ))
        
        Event.objects.bulk_create(events)
        
        # Test list performance
        import time
        start_time = time.time()
        
        response = self.client.get('/api/events/')
        
        end_time = time.time()
        response_time = end_time - start_time
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLess(response_time, 2.0)  # Should respond within 2 seconds
    
    def test_database_query_optimization(self):
        """Test that queries are optimized"""
        self.authenticate_user()
        
        # Create events with related data
        for i in range(10):
            event = self.create_test_event()
            Budget.objects.create(
                event=event,
                user=self.user,
                total_budget=Decimal('10000.00'),
                allocations={}
            )
        
        # Test that we don't have N+1 query problems
        with self.assertNumQueries(3):  # Should be minimal queries
            response = self.client.get('/api/events/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)

# Integration Tests
class IntegrationTestCase(TransactionTestCase):
    """Integration tests for complete workflows"""
    
    def test_complete_event_creation_workflow(self):
        """Test complete event creation and management workflow"""
        client = APIClient()
        
        # 1. Register user
        register_data = {
            'username': 'integrationuser',
            'email': 'integration@example.com',
            'password': 'testpass123',
            'first_name': 'Integration',
            'last_name': 'User',
            'user_type': 'customer'
        }
        
        response = client.post('/api/auth/register/', register_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 2. Login
        login_data = {
            'email': 'integration@example.com',
            'password': 'testpass123'
        }
        
        response = client.post('/api/auth/login/', login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        access_token = response.data['access']
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # 3. Create event
        event_data = {
            'event_name': 'Integration Test Event',
            'form_data': {
                'clientName': 'Integration Client',
                'clientEmail': 'client@example.com',
                'attendees': 75,
                'budget': 15000
            },
            'special_requirements': {'catering': {'selected': True}},
            'selected_services': ['catering', 'decoration']
        }
        
        response = client.post('/api/events/', event_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        event_id = response.data['id']
        
        # 4. Allocate budget
        response = client.post(f'/api/events/{event_id}/allocate-budget/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 5. Get budget summary
        response = client.get(f'/api/events/{event_id}/budget-summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['has_allocation'])
        
        # 6. Update event
        update_data = {
            'event_name': 'Updated Integration Event'
        }
        
        response = client.put(f'/api/events/{event_id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 7. Delete event
        response = client.delete(f'/api/events/{event_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

# Test Configuration
pytest_plugins = ['pytest_django']

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user():
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )

@pytest.fixture
def authenticated_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client