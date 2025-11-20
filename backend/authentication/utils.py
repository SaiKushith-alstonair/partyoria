def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_user_agent(request):
    """Extract user agent from request"""
    return request.META.get('HTTP_USER_AGENT', '')

def log_user_session(user, action, request, is_successful=True, failure_reason=None):
    """Log user session with IP address and other details"""
    from .models import UserSession, IPAddressLog
    
    ip_address = get_client_ip(request)
    user_agent = get_user_agent(request)
    session_key = request.session.session_key
    
    # Create user session log
    UserSession.objects.create(
        user=user,
        action=action,
        ip_address=ip_address,
        user_agent=user_agent,
        session_key=session_key,
        is_successful=is_successful,
        failure_reason=failure_reason
    )
    
    # Update IP address log
    ip_log, created = IPAddressLog.objects.get_or_create(
        ip_address=ip_address,
        defaults={'total_requests': 1}
    )
    if not created:
        ip_log.total_requests += 1
        ip_log.save()
    
    return ip_address