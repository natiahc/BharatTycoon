import requests
import json
import time
import sys
import subprocess
import os
import signal

BASE_URL = "http://localhost:8000"
BACKEND_DIR = "/Users/natiahc/sandbox/repo/BharatTycoon/BharatTycoon-backend"
backend_process = None

def start_backend():
    global backend_process
    print("Starting backend server...")
    os.chdir(BACKEND_DIR)
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    # Wait for server to be ready
    for i in range(10):
        try:
            requests.get(f"{BASE_URL}/", timeout=1)
            print("Backend ready!")
            return True
        except:
            time.sleep(1)
    print("WARNING: Backend may not be ready")
    return False

def stop_backend():
    global backend_process
    if backend_process:
        print("Stopping backend...")
        backend_process.terminate()
        backend_process.wait()

def test_root():
    print("\n=== Test: Root Endpoint ===")
    try:
        resp = requests.get(f"{BASE_URL}/")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")
    except Exception as e:
        print(f"ERROR: {e}")

def test_recommendations():
    print("\n=== Test: /unified/recommendations ===")
    payload = {
        "user": {
            "capital": 100000,
            "risk_appetite": "medium",
            "experience": "beginner",
            "time_commitment": "moderate",
            "interests": []
        },
        "city": {
            "city": "mumbai",
            "business_type": "",
            "purchasing_power": 0.8,
            "competition_level": 0.5,
            "seasonality": [1,1.1,1.2,1.1,1,0.9,0.8,0.9,1,1.1,1.2,1.3]
        }
    }
    try:
        start = time.time()
        resp = requests.post(f"{BASE_URL}/unified/recommendations", json=payload)
        elapsed = time.time() - start
        print(f"Status: {resp.status_code}")
        print(f"Time: {elapsed:.3f}s")
        if resp.status_code == 200:
            data = resp.json()
            print(f"City: {data.get('city')}")
            print(f"Recommendations count: {len(data.get('recommendations', []))}")
            if data.get('recommendations'):
                print(f"Top rec: {data['recommendations'][0].get('business_name')}")
        else:
            print(f"Error: {resp.text}")
    except Exception as e:
        print(f"ERROR: {e}")

def test_economic_indicators():
    print("\n=== Test: /economic/indicators ===")
    try:
        resp = requests.get(f"{BASE_URL}/economic/indicators")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")
    except Exception as e:
        print(f"ERROR: {e}")

def test_news():
    print("\n=== Test: /news/mumbai ===")
    try:
        resp = requests.get(f"{BASE_URL}/news/mumbai")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")
    except Exception as e:
        print(f"ERROR: {e}")

def test_all_cities():
    print("\n=== Test: All Cities Recommendations ===")
    cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'hyderabad', 'kolkata']
    for city in cities:
        payload = {
            "user": {"capital": 100000, "risk_appetite": "medium", "experience": "beginner", "time_commitment": "moderate", "interests": []},
            "city": {"city": city, "business_type": "", "purchasing_power": 0.8, "competition_level": 0.5, "seasonality": [1]*12}
        }
        try:
            start = time.time()
            resp = requests.post(f"{BASE_URL}/unified/recommendations", json=payload)
            elapsed = time.time() - start
            if resp.status_code == 200:
                data = resp.json()
                print(f"  {city}: {elapsed:.3f}s - {len(data.get('recommendations', []))} recs")
            else:
                print(f"  {city}: ERROR {resp.status_code}")
        except Exception as e:
            print(f"  {city}: ERROR {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("  BharatTycoon API - Automated Tests")
    print("=" * 50)
    
    # Check if server is already running
    server_running = False
    try:
        requests.get(f"{BASE_URL}/", timeout=1)
        server_running = True
        print("Backend already running!")
    except:
        if not start_backend():
            print("ERROR: Could not start backend")
            sys.exit(1)
    
    try:
        test_root()
        test_recommendations()
        test_economic_indicators()
        test_news()
        test_all_cities()
        print("\n" + "=" * 50)
        print("  ALL TESTS COMPLETE!")
        print("=" * 50)
    finally:
        if not server_running:
            stop_backend()
