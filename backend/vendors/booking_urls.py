from django.urls import path
from . import booking_api

urlpatterns = [
    path('create/', booking_api.create_booking_from_quote, name='create_booking'),
    path('customer/', booking_api.get_customer_bookings, name='customer_bookings'),
    path('vendor/', booking_api.get_vendor_bookings, name='vendor_bookings'),
    path('<int:booking_id>/', booking_api.get_booking_detail, name='booking_detail'),
    path('<int:booking_id>/confirm/', booking_api.confirm_booking, name='confirm_booking'),
    path('<int:booking_id>/cancel/', booking_api.cancel_booking, name='cancel_booking'),
]
