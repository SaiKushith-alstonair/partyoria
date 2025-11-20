from events.models import QuoteRequest

# Test JSON array filtering
vendor_name = "Sai Kusith M"

print(f"Testing JSON array filtering for vendor: {vendor_name}\n")

# OLD WAY (WRONG)
print("OLD WAY: selected_vendors__contains=[vendor_name]")
try:
    qrs_old = QuoteRequest.objects.filter(
        selected_vendors__contains=[vendor_name]
    )
    print(f"  Result: {qrs_old.count()} quote requests")
except Exception as e:
    print(f"  ERROR: {e}")

# NEW WAY (CORRECT)
print("\nNEW WAY: selected_vendors__contains=vendor_name")
try:
    qrs_new = QuoteRequest.objects.filter(
        selected_vendors__contains=vendor_name
    )
    print(f"  Result: {qrs_new.count()} quote requests")
    for qr in qrs_new:
        print(f"    - Quote #{qr.id}: {qr.event_name}, Vendors: {qr.selected_vendors}")
except Exception as e:
    print(f"  ERROR: {e}")

# Test with empty array
print("\nTesting with quote that has empty vendor array:")
empty_qr = QuoteRequest.objects.filter(selected_vendors=[]).first()
if empty_qr:
    print(f"  Found quote #{empty_qr.id} with empty vendors: {empty_qr.selected_vendors}")
    print(f"  Searching for '{vendor_name}' in empty array...")
    result = QuoteRequest.objects.filter(
        id=empty_qr.id,
        selected_vendors__contains=vendor_name
    )
    print(f"  Result: {result.count()} (should be 0)")
