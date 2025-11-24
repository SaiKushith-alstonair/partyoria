from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, QuoteRequestViewSet, RSVPViewSet, event_milestones

from .budget_api import allocate_budget, update_budget, validate_budget, rebalance_budget, get_budget_summary, get_market_insights, get_competitor_analysis
from .quote_views import (
    send_quote_requests, vendor_quote_requests, quote_request_detail,
    submit_quote, event_quotes, accept_quote
)
from .quote_tracking import (
    customer_quote_status, vendor_pending_quotes, vendor_submit_quote_response,
    quote_responses_for_event
)

# Create routers
router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')

quote_router = DefaultRouter()
quote_router.register(r'', QuoteRequestViewSet, basename='quote')

rsvp_router = DefaultRouter()
rsvp_router.register(r'', RSVPViewSet, basename='rsvp')

urlpatterns = [
    # SPECIFIC PATTERNS FIRST - CRITICAL ORDER
    

    # Budget API endpoints
    path('events/<int:event_id>/budget/allocate/', allocate_budget, name='allocate-budget'),
    path('events/<int:event_id>/budget/update/', update_budget, name='update-budget'),
    path('events/<int:event_id>/budget/rebalance/', rebalance_budget, name='rebalance-budget'),
    path('events/<int:event_id>/budget/summary/', get_budget_summary, name='budget_summary'),
    path('events/<int:event_id>/budget/insights/', get_market_insights, name='market-insights'),
    path('budget/validate/', validate_budget, name='validate-budget'),
    path('budget/competitor-analysis/', get_competitor_analysis, name='competitor-analysis'),
    
    # Quote Management endpoints - MUST BE BEFORE ROUTER
    path('events/<int:event_id>/send-quotes/', send_quote_requests, name='send-quote-requests'),
    path('events/<int:event_id>/quotes/', event_quotes, name='event-quotes'),
    path('events/<int:event_id>/quote-status/', customer_quote_status, name='customer-quote-status'),
    path('events/<int:event_id>/quote-responses/', quote_responses_for_event, name='quote-responses'),
    path('events/<int:event_id>/milestones/', event_milestones, name='event-milestones'),
    
    # Quote specific endpoints
    path('quotes/<int:quote_id>/accept/', accept_quote, name='accept-quote'),
    
    # Vendor Quote endpoints
    path('events/vendor/pending-quotes/', vendor_pending_quotes, name='vendor-pending-quotes'),
    path('events/vendor/quotes/<int:quote_id>/submit/', vendor_submit_quote_response, name='vendor-submit-quote'),
    
    # Separate routers
    path('quote-requests/', include(quote_router.urls)),
    path('rsvps/', include(rsvp_router.urls)),
    
    # MAIN ROUTER - This will handle /api/events/
    path('', include(router.urls)),
]