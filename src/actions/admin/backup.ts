"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getJWTSecret, JWT_CONFIG } from "@/lib/jwt";

// Verify admin permission helper - returns result object instead of throwing
async function verifyAdmin(): Promise<{ authorized: boolean; error?: string; payload?: unknown }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_CONFIG.COOKIE_NAME)?.value;

  if (!token) {
    return { authorized: false, error: "Unauthorized" };
  }

  try {
    const { payload } = await jwtVerify(token, getJWTSecret());
    // Accept both lowercase (from token) and uppercase (normalized)
    if (payload.role !== "admin" && payload.role !== "ADMIN") {
      return { authorized: false, error: "Unauthorized access" };
    }
    return { authorized: true, payload };
  } catch (error) {
    console.error("Token verification error:", error);
    return { authorized: false, error: "Invalid token" };
  }
}

export async function exportDataAction(dataType: "users" | "students") {
  // 1. Security Check
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error || "Unauthorized" };
  }

  try {

    let data;
    let filename;

    // 2. Fetch Data based on type
    if (dataType === "users") {
      data = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          // Exclude password!
        },
        orderBy: { createdAt: "desc" },
      });
      filename = `users_backup_${new Date().toISOString().split("T")[0]}.json`;
    } else if (dataType === "students") {
      data = await prisma.siswa.findMany({
        include: {
          user: {
            select: { username: true, email: true },
          },
        },
        orderBy: { name: "asc" },
      });
      filename = `students_backup_${new Date().toISOString().split("T")[0]}.json`;
    } else {
      return { success: false, error: "Invalid data type" };
    }

    // 3. Return data stringified
    // Note: In a real component, you'd trigger a download.
    // Since server actions return data, the client component must handle the Blob creation.
    return {
      success: true,
      data: JSON.stringify(data, null, 2),
      filename,
    };
  } catch (error) {
    console.error("Export error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed",
    };
  }
}
