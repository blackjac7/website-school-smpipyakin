"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getJWTSecret, JWT_CONFIG } from "@/lib/jwt";

// Verify admin permission helper
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_CONFIG.COOKIE_NAME)?.value;

  if (!token) throw new Error("Unauthorized");

  try {
    const { payload } = await jwtVerify(token, getJWTSecret());
    if (payload.role !== "admin") throw new Error("Unauthorized access");
    return payload;
  } catch (error) {
    console.error("Token verification error:", error);
    throw new Error("Invalid token");
  }
}

export async function exportDataAction(dataType: "users" | "students") {
  try {
    // 1. Security Check
    await verifyAdmin();

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
