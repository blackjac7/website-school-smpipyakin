"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasOsisAccess } from "@/lib/roles";
import { isAllowed, resetKey } from "@/lib/rateLimiter";
import {
  createScanOverrideToken,
  SCAN_OVERRIDE_TTL_SECONDS,
} from "@/lib/scan-override";

const OverrideSchema = z.object({
  adminUsername: z.string().trim().min(1).max(100),
  adminPassword: z.string().min(8).max(200),
  mode: z.enum(["lateness", "attribute"]),
});

async function getRequestContext() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  return {
    ip:
      forwarded?.split(",")[0]?.trim() ||
      headerStore.get("x-real-ip") ||
      "unknown",
    userAgent: (headerStore.get("user-agent") || "unknown").slice(0, 500),
  };
}

export async function requestScanTimeOverride(input: unknown) {
  const requester = await getAuthenticatedUser();
  if (!requester) {
    return { success: false, error: "Sesi tidak valid. Silakan login kembali." };
  }

  const osisAccess = await hasOsisAccess(requester.userId, requester.role);
  if (!osisAccess) {
    return { success: false, error: "Akses OSIS diperlukan." };
  }

  const parsed = OverrideSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Kredensial Admin tidak lengkap." };
  }

  const context = await getRequestContext();
  const rateKey = `scan-override:${requester.userId}:${context.ip}`;
  const rateLimit = isAllowed(rateKey, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: "Terlalu banyak percobaan. Coba kembali dalam 15 menit.",
    };
  }

  const admin = await prisma.user.findFirst({
    where: {
      username: parsed.data.adminUsername,
      role: "ADMIN",
    },
    select: { id: true, username: true, password: true },
  });

  const passwordValid = admin
    ? await bcrypt.compare(parsed.data.adminPassword, admin.password)
    : false;

  if (!admin || !passwordValid) {
    console.warn("Scan time override rejected", {
      requesterId: requester.userId,
      adminUsername: parsed.data.adminUsername,
      mode: parsed.data.mode,
      ip: context.ip,
      userAgent: context.userAgent,
    });
    return {
      success: false,
      error: "Username atau password Admin tidak valid.",
      remainingAttempts: rateLimit.remaining,
    };
  }

  resetKey(rateKey);
  const token = await createScanOverrideToken({
    osisUserId: requester.userId,
    adminUserId: admin.id,
    mode: parsed.data.mode,
  });
  const expiresAt = Date.now() + SCAN_OVERRIDE_TTL_SECONDS * 1000;

  console.info("Scan time override approved", {
    requesterId: requester.userId,
    adminId: admin.id,
    mode: parsed.data.mode,
    ip: context.ip,
    expiresAt: new Date(expiresAt).toISOString(),
  });

  return {
    success: true,
    token,
    expiresAt,
    approvedBy: admin.username,
  };
}
