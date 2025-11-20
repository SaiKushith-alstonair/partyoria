import requests

tests = [
    ('Photography', '0-20000', 'Budget'),
    ('Photography', '0-35000', 'Budget+'),
    ('Photography', '30000-60000', 'Mid-Range'),
    ('Catering', '0-400', 'Budget'),
    ('DJ', '0-15000', 'Budget'),
    ('DJ', '20000-45000', 'Mid-Range'),
    ('Decoration', '0-25000', 'Budget'),
    ('Makeup Artist', '0-12000', 'Budget'),
]

print("=== MARKETPLACE BUDGET FILTER TESTS ===\n")

for category, price_range, tier in tests:
    url = f"http://127.0.0.1:8000/api/vendor/marketplace/?category={category}&price_range={price_range}"
    r = requests.get(url)
    data = r.json()
    count = data.get('count', 0)
    print(f"{category} ({tier} tier: Rs.{price_range}): {count} vendors")
    if count > 0:
        for v in data.get('results', [])[:2]:
            total = sum(s['service_price'] for s in v['services'])
            print(f"  - {v['full_name']}: Rs.{total:,.0f}")

print("\n=== OVERALL STATS ===")
r = requests.get("http://127.0.0.1:8000/api/vendor/marketplace/")
data = r.json()
print(f"Total vendors: {data.get('count')}")
print(f"Categories: {len(set(v['business'] for v in data.get('results', [])))}")
