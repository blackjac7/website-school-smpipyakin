from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            print("Navigating to localhost:3000...")
            # increased timeout and changed wait_until
            page.goto("http://localhost:3000", timeout=60000, wait_until="domcontentloaded")
            print("Navigation complete.")

            # 1. Capture Screenshot
            page.screenshot(path="homepage_fixed.png", full_page=True)
            print("Screenshot captured: homepage_fixed.png")

            # 2. Verify Primary Color
            button = page.locator("button:has-text('Daftar PPDB')").first
            if not button.count():
                button = page.locator(".bg-primary").first

            if button.count():
                bg_color = button.evaluate("el => getComputedStyle(el).backgroundColor")
                print(f"Primary Button Background Color: {bg_color}")
            else:
                print("No primary button found.")

            # 3. Verify Navbar
            navbar = page.locator("header").first
            if navbar.count():
                backdrop = navbar.evaluate("el => getComputedStyle(el).backdropFilter")
                print(f"Navbar Backdrop Filter: {backdrop}")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify()
