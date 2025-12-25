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

    // ensure server is responsive
    const health = await request.get("/");
    expect(health.ok()).toBeTruthy();

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

    // ensure server is responsive
    const health = await request.get("/");
    expect(health.ok()).toBeTruthy();

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

  test.afterAll(async () => {
    // reset
    await prisma.siteSettings.update({
      where: { key: "ppdb.enabled" },
      data: { value: "true" },
    });
  });
});
