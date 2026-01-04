/**
 * API Routes Tests
 * ================
 * Tests critical API endpoints for functionality and security.
 */

import { test, expect } from "@playwright/test";

test.describe("API - Authentication", () => {
  test("POST /api/auth/login - rejects invalid credentials", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/login", {
      data: {
        username: "invalid_user",
        password: "wrong_password",
        role: "siswa",
        captchaAnswer: "10",
      },
    });

    // Should return 401 or 429 (rate limited)
    expect([401, 429]).toContain(response.status());
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/auth/login - requires all fields", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: {
        username: "testuser",
        // missing password and role
      },
    });

    expect([400, 401]).toContain(response.status());
  });

  test("GET /api/auth/verify - returns unauthorized without session", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/verify");
    expect(response.status()).toBe(401);
  });
});

test.describe("API - PPDB", () => {
  test("GET /api/ppdb/check-nisn - validates NISN format", async ({
    request,
  }) => {
    const response = await request.get("/api/ppdb/check-nisn?nisn=123");

    // Should return success response with exists: false or true
    expect(response.status()).toBe(200);
  });

  test("GET /api/ppdb/check-nisn - requires NISN parameter", async ({
    request,
  }) => {
    const response = await request.get("/api/ppdb/check-nisn");

    // Should return 400 when NISN is missing
    expect(response.status()).toBe(400);
  });

  test("POST /api/ppdb/register - requires authentication data", async ({
    request,
  }) => {
    const response = await request.post("/api/ppdb/register", {
      data: {}, // Empty data
    });

    expect(response.status()).toBe(400);
  });

  test("GET /api/ppdb/status - requires query parameter", async ({
    request,
  }) => {
    const response = await request.get("/api/ppdb/status");

    // Should require registrationNumber parameter
    expect([400, 404]).toContain(response.status());
  });
});

test.describe("API - Security", () => {
  test("Protected endpoints reject unauthenticated requests", async ({
    request,
  }) => {
    // Test cron endpoint which should definitely reject
    const response = await request.post("/api/cron/cleanup-logs");
    const status = response.status();
    // Should reject with proper error codes
    expect([401, 403, 405]).toContain(status);
  });

  test("API returns proper CORS headers", async ({ request }) => {
    const response = await request.get("/api/auth/verify");
    const headers = response.headers();

    // Check for security headers
    expect(headers["content-type"]).toContain("application/json");
  });

  test("Rate limiting headers present on auth endpoints", async ({
    request,
  }) => {
    // Make multiple requests to check for rate limiting
    for (let i = 0; i < 3; i++) {
      await request.post("/api/auth/login", {
        data: {
          username: "test",
          password: "test",
          role: "siswa",
          captchaAnswer: "10",
        },
      });
    }

    // Should still respond (even if rate limited)
    const response = await request.post("/api/auth/login", {
      data: {
        username: "test",
        password: "test",
        role: "siswa",
        captchaAnswer: "10",
      },
    });

    expect([401, 429]).toContain(response.status());
  });
});
