import requests
import time

BASE_URL = "http://localhost:8000"

print("Testing full onboarding flow simulation...")

# Simulate what frontend does
payload = {
    "user": {
        "capital": 100000,
        "risk_appetite": "medium",
        "experience": "beginner",
        "time_commitment": "moderate",
        "interests": []
    },
    "city": {
        "city": "bangalore",
        "business_type": "",
        "purchasing_power": 0.8,
        "competition_level": 0.5,
        "seasonality": [1,1.1,1.2,1.1,1,0.9,0.8,0.9,1,1.1,1.2,1.3]
    }
}

print("\n1. Testing city selection (bangalore)...")
start = time.time()
resp = requests.post(f"{BASE_URL}/unified/recommendations", json=payload)
elapsed = time.time() - start
print(f"   Status: {resp.status_code}, Time: {elapsed:.3f}s")

if resp.status_code == 200:
    data = resp.json()
    print(f"   ✓ City: {data['city']}")
    print(f"   ✓ Growth: {data['city_growth']*100:.0f}%")
    print(f"   ✓ Top recommendation: {data['recommendations'][0]['business_name']}")
    print(f"   ✓ Score: {data['recommendations'][0]['score']}%")

print("\n2. Testing different city (mumbai)...")
payload["city"]["city"] = "mumbai"
start = time.time()
resp = requests.post(f"{BASE_URL}/unified/recommendations", json=payload)
elapsed = time.time() - start
print(f"   Status: {resp.status_code}, Time: {elapsed:.3f}s")

if resp.status_code == 200:
    data = resp.json()
    print(f"   ✓ City: {data['city']}")
    print(f"   ✓ Recommendations: {len(data['recommendations'])}")

print("\n✅ Full flow test complete!")
