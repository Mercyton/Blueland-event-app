from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/event-frontend")

    # Click the login button to open the modal
    page.click("#loginBtn")

    # Fill in the login form with admin credentials
    # I will assume the first user is the admin as per the previous implementation.
    # I will use a dummy email and password for the first user.
    page.fill("#loginEmail", "admin@example.com")
    page.fill("#loginPassword", "password123")

    # Click the login button
    page.click("#loginForm button[type='submit']")

    # Wait for the admin panel to be visible
    page.wait_for_selector("#adminPanel", state="visible")

    # Take a screenshot of the admin panel
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
