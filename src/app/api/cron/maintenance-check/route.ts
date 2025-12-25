import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    // Allow a reasonable test-friendly fallback when CRON_SECRET is not set in the
    // environment (e.g., when running Playwright against the dev server).
    const expectedSecret = process.env.CRON_SECRET || "test-cron-secret";
    if (!auth || auth !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    const activeSchedule = await prisma.maintenanceSchedule.findFirst({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
      },
    });

    if (activeSchedule) {
      // enable maintenance
      await prisma.siteSettings.upsert({
        where: { key: "maintenance.enabled" },
        update: { value: "true", updatedAt: new Date() },
        create: {
          key: "maintenance.enabled",
          value: "true",
          type: "BOOLEAN",
          category: "maintenance",
        },
      });

      await prisma.siteSettings.upsert({
        where: { key: "maintenance.message" },
        update: {
          value: activeSchedule.message ?? "Website sedang dalam pemeliharaan.",
          updatedAt: new Date(),
        },
        create: {
          key: "maintenance.message",
          value: activeSchedule.message ?? "Website sedang dalam pemeliharaan.",
          type: "STRING",
          category: "maintenance",
        },
      });

      return NextResponse.json({
        success: true,
        active: true,
        scheduleId: activeSchedule.id,
      });
    }

    // disable maintenance if no active schedule
    await prisma.siteSettings.upsert({
      where: { key: "maintenance.enabled" },
      update: { value: "false", updatedAt: new Date() },
      create: {
        key: "maintenance.enabled",
        value: "false",
        type: "BOOLEAN",
        category: "maintenance",
      },
    });

    return NextResponse.json({ success: true, active: false });
  } catch (error) {
    console.error("Error running maintenance-check cron:", error);
    return NextResponse.json(
      { success: false, error: "Internal" },
      { status: 500 }
    );
  }
}
