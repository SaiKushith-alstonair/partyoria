from django.contrib import admin
from .models import Venue

@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ['id', 'state', 'city', 'get_venue_name']
    list_filter = ['state', 'city']
    search_fields = ['state', 'city', 'venue_details__name']
    
    def get_venue_name(self, obj):
        return obj.venue_details.get('name', 'Unknown')
    get_venue_name.short_description = 'Venue Name'