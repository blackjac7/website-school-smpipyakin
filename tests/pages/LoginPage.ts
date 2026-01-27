/**
 * Page Object Model - Login Page
 * ================================
 * Encapsulates all login page interactions
 *
 * Features:
 * - Handles username, password, and role selection
 * - Handles math CAPTCHA automatically
 * - Proper wait strategies for navigation
 */

import { Page, Locator, expect } from "@playwright/test";
import { TEST_USERS, UserRole } from "../fixtures/test-fixtures";

// Mapping role dari test ke role form
const FORM_ROLE_MAP: Record<UserRole, string> = {
  siswa: "siswa",
  ppdb: "ppdb_admin",
  admin: "admin",
  kesiswaan: "kesiswaan",
  osis: "osis",
};

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly submitButton: Locator;
  readonly passwordToggle: Locator;
  readonly errorMessage: Locator;
  readonly heading: Locator;
  readonly captchaInput: Locator;
  readonly captchaQuestion: Locator;

  constructor(page: Page) {
    this.page = page;
    // Username input - using id selector for accuracy
    this.usernameInput = page.locator("#username");
    // Password input
    this.passwordInput = page.locator("#password");
    // Role select dropdown
    this.roleSelect = page.locator("#role");
    // Submit button
    this.submitButton = page.locator('button[type="submit"]');
    // Password visibility toggle
    this.passwordToggle = page.locator(
      '[aria-label*="password"], button:has([data-lucide="eye"])',
    );
    // Error message
    this.errorMessage = page.locator(
      '[role="alert"], .error, [class*="error"]',
    );
    // Page heading
    this.heading = page.locator("h1, h2").first();
    // Captcha elements
    this.captchaInput = page.locator('input[type="number"]');
    this.captchaQuestion = page.locator(".font-mono.font-bold");
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    // Use networkidle and a slightly longer timeout to be resilient on CI/dev servers
    try {
      await this.page.goto("/login", {
        waitUntil: "networkidle",
        timeout: 60000,
      });
    } catch (err) {
      // Retry once if navigation times out
      await this.page.goto("/login", {
        waitUntil: "networkidle",
        timeout: 60000,
      });
    }
  }

  /**
   * Fill login form with role selection
   */
  async fillForm(
    username: string,
    password: string,
    formRole?: string,
  ): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    // Select role if provided
    if (formRole) {
      await this.roleSelect.selectOption(formRole);
    }
  }

  /**
   * Solve math CAPTCHA automatically
   * Reads the question "X + Y = ?" and fills the answer
   */
  async solveCaptcha(): Promise<void> {
    // Wait for captcha to be visible
    const captchaVisible = await this.captchaInput
      .isVisible()
      .catch(() => false);

    if (!captchaVisible) {
      return; // No captcha needed
    }

    // Get the captcha question text
    const questionText = await this.captchaQuestion.textContent();

    if (!questionText) {
      return;
    }

    // Parse "X + Y = ?" format
    const match = questionText.match(/(\d+)\s*\+\s*(\d+)/);

    if (match) {
      const num1 = parseInt(match[1], 10);
      const num2 = parseInt(match[2], 10);
      const answer = num1 + num2;

      await this.captchaInput.fill(answer.toString());
    }
  }

  /**
   * Submit login form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Login with credentials (without role)
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillForm(username, password);
    await this.solveCaptcha();
    await this.submit();
  }

  /**
   * Login as specific role with full form handling
   */
  async loginAs(role: UserRole): Promise<void> {
    const user = TEST_USERS[role];
    const formRole = FORM_ROLE_MAP[role];

    // Ensure requests are attributed to a unique client IP in tests so server-side
    // rate-limiting does not aggregate all test attempts into a single 'unknown' IP.
    // Use a randomized local IP octet per test run.
    const randomOctet = Math.floor(Math.random() * 254) + 1;
    await this.page.setExtraHTTPHeaders({
      "x-forwarded-for": `127.0.0.${randomOctet}`,
      // Indicate to the server that this request is coming from a Playwright test
      // so server-side rate limits can be relaxed or bypassed in test mode.
      "x-playwright-test": "true",
    });

    await this.goto();

    // Wait for form to be attached first, then visible (replaces waitForTimeout)
    await this.usernameInput.waitFor({ state: "attached", timeout: 20000 });
    await this.usernameInput.waitFor({ state: "visible", timeout: 15000 });

    // Fill the form with correct role
    await this.fillForm(user.username, user.password, formRole);

    // Solve the CAPTCHA
    await this.solveCaptcha();

    // Submit and capture auth response
    const [authResponse] = await Promise.all([
      this.page
        .waitForResponse(
          (resp) =>
            resp.url().includes("/api/auth/login") &&
            resp.request().method() === "POST",
          { timeout: 10000 },
        )
        .catch(() => null),
      this.submit(),
    ]);

    // Wait for login animation to complete (animation takes 3.5s)
    // Look for "Login Berhasil" text and wait for redirect
    try {
      // Wait for success message to appear
      await this.page
        .locator("text=Login Berhasil")
        .waitFor({ state: "visible", timeout: 10000 })
        .catch(() => {});

      // Wait for redirect with longer timeout (animation is 3.5s)
      await this.page.waitForURL((url) => !url.pathname.includes("/login"), {
        timeout: 30000,
      });
    } catch {
      // Log auth response if available
      if (authResponse) {
        try {
          console.log(`Login response status: ${authResponse.status()}`);
          const ctype = authResponse.headers()["content-type"] || "";
          let body = "";
          if (ctype.includes("application/json")) {
            body = JSON.stringify(await authResponse.json());
          } else {
            body = await authResponse.text();
          }
          console.log(`Login failed response body: ${body}`);
        } catch (e) {
          console.log("Failed to read login response body", e);
        }
      }

      // Check if we're still on login (possible login failure)
      const currentUrl = this.page.url();
      if (currentUrl.includes("/login")) {
        // Check for error message
        const hasError = await this.errorMessage.isVisible().catch(() => false);
        if (hasError) {
          const errorText = await this.errorMessage
            .textContent()
            .catch(() => "");
          // Only log if there's actual error text
          if (errorText && errorText.trim()) {
            console.log(`Login failed with error: ${errorText}`);
          }
        }

        // If we are still on the login page, surface a clear failure with diagnostics
        console.error(
          "Login did not redirect away from /login. Current URL:",
          currentUrl,
        );
        console.error(
          "Auth response headers might help; checking any recent responses is recommended.",
        );
        console.error(
          "Cookies:",
          JSON.stringify(await this.page.context().cookies(), null, 2),
        );
        throw new Error("Login failed or did not complete (still on /login)");
      }
    }

    // Additional wait for page to stabilize
    // Prefer waiting for main content to become visible (helps when client-side
    // dashboard scaffolding shows a loading placeholder). Fallback to DOMContentLoaded
    // if main content doesn't appear within the timeout.
    await this.page
      .waitForSelector("main, #main-content", {
        state: "visible",
        timeout: 20000,
      })
      .catch(async () => {
        await this.page.waitForLoadState("domcontentloaded");
      });
  }

  /**
   * Assert login page is displayed correctly
   */
  async assertDisplayed(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Assert still on login page (login failed)
   */
  async assertStillOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/login/);
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    if ((await this.passwordToggle.count()) > 0) {
      await this.passwordToggle.first().click();
    }
  }

  /**
   * Assert error message is shown
   */
  async assertErrorShown(): Promise<void> {
    await expect(this.errorMessage.first()).toBeVisible();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if captcha is visible
   */
  async isCaptchaVisible(): Promise<boolean> {
    return await this.captchaInput.isVisible().catch(() => false);
  }

  /**
   * Assert captcha is displayed
   */
  async assertCaptchaDisplayed(): Promise<void> {
    await expect(this.captchaInput).toBeVisible();
    await expect(this.captchaQuestion).toBeVisible();
  }
}
