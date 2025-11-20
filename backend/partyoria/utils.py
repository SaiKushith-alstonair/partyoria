def add_cache_headers(headers, path, url):
    """Add cache headers for static files"""
    if path.endswith(('.css', '.js')):
        headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    elif path.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg')):
        headers['Cache-Control'] = 'public, max-age=2592000'  # 30 days
    elif path.endswith(('.woff', '.woff2', '.ttf', '.eot')):
        headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    else:
        headers['Cache-Control'] = 'public, max-age=86400'  # 1 day