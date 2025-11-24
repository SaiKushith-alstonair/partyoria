from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CalendarEvent
from .serializers import CalendarEventSerializer

class CalendarEventViewSet(viewsets.ModelViewSet):
    serializer_class = CalendarEventSerializer
    
    def get_queryset(self):
        return CalendarEvent.objects.filter(vendor=self.request.user).order_by('-event_date')