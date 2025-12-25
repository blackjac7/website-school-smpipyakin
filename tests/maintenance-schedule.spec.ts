import { test, expect } from "@playwright/test";
import prisma from "../src/lib/prisma";

const CRON_SECRET = process.env.CRON_SECRET || "test-cron-secret";

test.describe.serial("@nightly Maintenance schedule cron", () => {
  test.beforeEach(async () => {
    // cleanup schedules
    await prisma.maintenanceSchedule.deleteMany();
    await prisma.siteSettings.upsert({
      where: { key: "maintenance.enabled" },
      update: { value: "false" },
      create: {
        key: "maintenance.enabled",
        value: "false",
        type: "BOOLEAN",
        category: "maintenance",
      },
    });
  });

  test("cron should enable maintenance when schedule active", async ({
    request,
  }) => {
    const now = new Date();
    const start = new Date(now.getTime() - 1000 * 60 * 5); // 5 min ago
    const end = new Date(now.getTime() + 1000 * 60 * 10); // 10 min later

    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        title: "Test Window",
        description: "Testing",
        startTime: start,
        endTime: end,
        isActive: true,
        affectedPaths: [],
        message: "Scheduled maintenance test",
      },
    });

    const res = await request.post("/api/cron/maintenance-check", {
      headers: { authorization: `Bearer ${CRON_SECRET}` },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.active).toBe(true);

    // Check status endpoint
    const statusRes = await request.get("/api/maintenance/status");
    const statusBody = await statusRes.json();
    expect(statusBody.success).toBeTruthy();
    expect(statusBody.data.isActive).toBe(true);
    expect(statusBody.data.message).toContain("Scheduled maintenance test");

    // cleanup
    await prisma.maintenanceSchedule.deleteMany({ where: { id: schedule.id } });
  });

  test("cron should disable maintenance when no active schedule", async ({
    request,
  }) => {
    const res = await request.post("/api/cron/maintenance-check", {
      headers: { authorization: `Bearer ${CRON_SECRET}` },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.active).toBe(false);

    const statusRes = await request.get("/api/maintenance/status");
    const statusBody = await statusRes.json();
    expect(statusBody.success).toBeTruthy();
    expect(statusBody.data.isActive).toBe(false);
  });
});
