from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserSession, IPAddressLog

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_verified', 'date_joined']
    list_filter = ['user_type', 'is_verified', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone', 'date_of_birth', 'profile_picture', 'is_verified')
        }),
    )

@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'ip_address', 'timestamp', 'is_successful']
    list_filter = ['action', 'is_successful', 'timestamp']
    search_fields = ['user__username', 'ip_address']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'

@admin.register(IPAddressLog)
class IPAddressLogAdmin(admin.ModelAdmin):
    list_display = ['ip_address', 'total_requests', 'first_seen', 'last_seen', 'is_blocked']
    list_filter = ['is_blocked', 'first_seen', 'last_seen']
    search_fields = ['ip_address', 'country', 'city']
    readonly_fields = ['first_seen']