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
                time.sleep(1)
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
            
            # Wait for recommendations
            try:
                page.wait_for_selector("text=AI-Powered Recommendations", timeout=10000)
                print("✓ Step 4: AI Recommendations loaded")
                time.sleep(2)
                
                # Step 5: Select a business
                # Click on first recommendation card
                page.click("text=% Match >> nth=0")
                time.sleep(0.5)
                
                # Check if continue button is enabled
                continue_btn = page.locator("button:has-text('Continue')").first
                if continue_btn.is_enabled():
                    print("✓ Step 5: Business selected, Continue enabled")
                    continue_btn.click()
                    time.sleep(0.5)
                    
                    # Step 6: Play Style
                    if page.locator("text=Play Style").count() > 0:
                        print("✓ Step 6: Play Style screen reached")
                        
                        # Select play style
                        page.click("text=Simple Play")
                        time.sleep(0.5)
                        
                        # Click Start Game
                        if page.locator("text=Start Game").count() > 0:
                            print("✓ Step 7: Can start game!")
                        else:
                            print("✗ Start Game button not found")
                    else:
                        print("✗ Play Style screen not reached")
                else:
                    print("✗ Continue button not enabled after selecting business")
                    
            except Exception as e:
                print(f"✗ Error in flow: {e}")
                
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
