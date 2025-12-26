import { test, expect, request } from "@playwright/test";
import prisma from "../src/lib/prisma";

const samplePayload = (nisn: string) => ({
  namaLengkap: "Test User",
  nisn,
  jenisKelamin: "laki-laki",
  tempatLahir: "Jakarta",
  tanggalLahir: "2012-01-01",
  alamatLengkap: "Jl. Contoh",
  asalSekolah: "SD Contoh",
  kontakOrtu: "081234567890",
  namaOrtu: "Ortu Test",
  emailOrtu: "ortu@example.com",
  documents: [],
});

test.describe.serial("@smoke PPDB public registration gating", () => {
  test.beforeEach(async () => {
    // ensure settings seeded
    await prisma.siteSettings.upsert({
      where: { key: "ppdb.enabled" },
      update: { value: "false" },
      create: {
        key: "ppdb.enabled",
        value: "false",
        type: "BOOLEAN",
        category: "ppdb",
      },
    });
  });

  test("should reject registration when PPDB is closed", async ({
    request,
  }) => {
    // ensure closed
    await prisma.siteSettings.update({
      where: { key: "ppdb.enabled" },
      data: { value: "false" },
    });

    const nisn = `closed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // ensure no leftover application with same nisn
    await prisma.pPDBApplication.deleteMany({ where: { nisn } });

    // ensure server is responsive (retry a few times)
    let health = null as any;
    for (let i = 0; i < 6; i++) {
      try {
        health = await request.get("/");
        if (health.ok()) break;
      } catch (e) {
        // ignore transient errors
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    expect(health && health.ok()).toBeTruthy();

    // increase timeout for API post to reduce flakiness on slow CI machines
    const res = await request.post("/api/ppdb/register", {
      data: samplePayload(nisn),
      timeout: 30000,
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toBeTruthy();

    // ensure no application was created
    const existing = await prisma.pPDBApplication.findUnique({
      where: { nisn },
    });
    expect(existing).toBeNull();
  });

  test("should accept registration when PPDB is open", async ({ request }) => {
    // open PPDB
    await prisma.siteSettings.update({
      where: { key: "ppdb.enabled" },
      data: { value: "true" },
    });

    const nisn = `open-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    // ensure no leftover application with same nisn
    await prisma.pPDBApplication.deleteMany({ where: { nisn } });

    // ensure server is responsive (retry a few times)
    let health = null as any;
    for (let i = 0; i < 6; i++) {
      try {
        health = await request.get("/");
        if (health.ok()) break;
      } catch (e) {
        // ignore transient errors
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    expect(health && health.ok()).toBeTruthy();

    const res = await request.post("/api/ppdb/register", {
      data: samplePayload(nisn),
      timeout: 30000,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBeTruthy();

    // cleanup created application
    await prisma.pPDBApplication.deleteMany({ where: { nisn } });
  });

  test("should allow exactly one re-registration after rejection", async ({
    request,
  }) => {
    // open PPDB
    await prisma.siteSettings.update({
      where: { key: "ppdb.enabled" },
      data: { value: "true" },
    });

    const nisn = `retest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await prisma.pPDBApplication.deleteMany({ where: { nisn } });

    // 1) initial registration
    const res1 = await request.post("/api/ppdb/register", {
      data: samplePayload(nisn),
      timeout: 30000,
    });
    expect(res1.status()).toBe(200);

    // 2) admin rejects the application
    await prisma.pPDBApplication.updateMany({
      where: { nisn },
      data: { status: "REJECTED", feedback: "Dokumen tidak valid" },
    });

    // 3) applicant tries to register again (allowed once)
    const res2 = await request.post("/api/ppdb/register", {
      data: samplePayload(nisn),
      timeout: 30000,
    });
    expect(res2.status()).toBe(200);

    // 4) admin rejects again
    await prisma.pPDBApplication.updateMany({
      where: { nisn },
      data: { status: "REJECTED", feedback: "Masih belum lengkap" },
    });

    // 5) third attempt should be blocked
    const res3 = await request.post("/api/ppdb/register", {
      data: samplePayload(nisn),
      timeout: 30000,
    });
    expect(res3.status()).toBe(409);

    // cleanup
    await prisma.pPDBApplication.deleteMany({ where: { nisn } });
  });

  test("should enforce IP rate limit on registration", async ({ request }) => {
    // open PPDB
    await prisma.siteSettings.update({
      where: { key: "ppdb.enabled" },
      data: { value: "true" },
    });

    const base = `ratetest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const created: string[] = [];

    // The server limit is 5 per hour; attempt 6 registrations with unique NISNs
    for (let i = 0; i < 6; i++) {
      const nisn = `${base}-${i}`;
      const res = await request.post("/api/ppdb/register", {
        data: samplePayload(nisn),
        timeout: 30000,
      });
      if (i < 5) {
        expect(res.status()).toBe(200);
        created.push(nisn);
      } else {
        // last attempt should be rate-limited
        expect(res.status()).toBe(429);
      }
    }

    // cleanup created applications
    await prisma.pPDBApplication.deleteMany({
      where: { nisn: { in: created } },
    });
  });

  test.afterAll(async () => {
    // reset
    await prisma.siteSettings.update({
      where: { key: "ppdb.enabled" },
      data: { value: "true" },
    });
  });
});
