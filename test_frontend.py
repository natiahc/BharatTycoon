import subprocess
import sys
import time

# Check/install playwright
print("Installing Playwright...")
subprocess.run([sys.executable, "-m", "pip", "install", "playwright", "-q"])
subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"])

from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8081"
BACKEND_URL = "http://localhost:8000"

def test_frontend_loads():
    print("\n=== Test: Frontend Loads ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            page.goto(BASE_URL, timeout=10000)
            print(f"✓ Page loaded: {page.title()}")
            
            # Check for main elements
            content = page.content()
            if "BharatTycoon" in content or "Capital" in content:
                print("✓ Onboarding flow visible")
            else:
                print("✗ Onboarding content not found")
                
        except Exception as e:
            print(f"✗ Error: {e}")
        finally:
            browser.close()

def test_onboarding_flow():
    print("\n=== Test: Onboarding Flow ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            page.goto(BASE_URL, timeout=10000)
            time.sleep(1)
            
            # Step 1: Capital selection - check for slider
            if page.locator("input[type='range']").count() > 0:
                print("✓ Step 1: Capital slider found")
            else:
                print("✗ Capital slider not found")
            
            # Click Continue
            page.click("button:has-text('Continue')")
            time.sleep(0.5)
            
            # Step 2: State selection
            if page.locator("text=Maharashtra").count() > 0:
                print("✓ Step 2: State selection found")
                page.click("text=Maharashtra")
                time.sleep(0.5)
                page.click("button:has-text('Continue')")
                time.sleep(0.5)
            else:
                print("✗ State selection not found")
            
            # Step 3: City selection
            if page.locator("text=Mumbai").count() > 0:
                print("✓ Step 3: City selection found")
            else:
                print("✗ City selection not found")
            
            # Select Mumbai
            page.click("text=Mumbai")
            time.sleep(0.5)
            
            # Click Get AI Recommendations
            page.click("button:has-text('Get AI Recommendations')")
            print("✓ Clicked Get AI Recommendations")
            
            # Wait for loading or results (max 5 seconds)
            print("   Waiting for AI recommendations...")
            start = time.time()
            
            # Wait for either loading or results
            try:
                page.wait_for_selector("text=AI-Powered Recommendations", timeout=8000)
                elapsed = time.time() - start
                print(f"✓ Step 4: AI Recommendations loaded in {elapsed:.2f}s")
                
                # Wait a bit more for actual data
                time.sleep(2)
                
                # Get page content
                content = page.inner_text("body")
                
                # Check for recommendations
                if "Service" in content or "Restaurant" in content or "Grocery" in content:
                    print("✓ Business recommendations displayed")
                else:
                    print("✗ Business recommendations not found")
                    
                if "%" in content and "Match" in content:
                    print("✓ Score percentages shown")
                elif "Score" in content:
                    print("✓ Score info found")
                else:
                    print("? Checking scores...")
                    
            except Exception as e:
                elapsed = time.time() - start
                print(f"✗ Recommendations failed to load after {elapsed:.2f}s: {e}")
                
                # Take screenshot for debugging
                page.screenshot(path="debug_frontend.png")
                print("   Saved screenshot to debug_frontend.png")
                
        except Exception as e:
            print(f"✗ Error: {e}")
            page.screenshot(path="debug_error.png")
        finally:
            browser.close()

def test_backend_connection():
    print("\n=== Test: Backend Connection ===")
    import requests
    try:
        resp = requests.get(f"{BACKEND_URL}/", timeout=2)
        print(f"✓ Backend responding: {resp.json()}")
    except Exception as e:
        print(f"✗ Backend error: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("  BharatTycoon Frontend Tests")
    print("=" * 50)
    
    test_backend_connection()
    test_frontend_loads()
    test_onboarding_flow()
    
    print("\n" + "=" * 50)
    print("  Tests Complete!")
    print("=" * 50)
