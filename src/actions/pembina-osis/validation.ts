"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { isRoleMatch } from "@/lib/roles";
import { StatusApproval } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper to verify Pembina OSIS access
async function verifyPembinaOsisAccess() {
  const user = await getAuthenticatedUser();
  if (!user || !isRoleMatch(user.role, ["pembina_osis", "admin"])) {
    return {
      authorized: false,
      error: "Unauthorized: Pembina OSIS access required",
    };
  }
  return { authorized: true, user };
}

export async function getPendingOsisActivities() {
  const auth = await verifyPembinaOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error, data: [] };
  }

  try {
    const activities = await prisma.osisActivity.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    return { success: true, data: activities };
  } catch (error) {
    console.error("Error fetching pending activities:", error);
    return { success: false, error: "Failed to fetch activities", data: [] };
  }
}

export async function getOsisActivityHistory() {
  const auth = await verifyPembinaOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error, data: [] };
  }

  try {
    const activities = await prisma.osisActivity.findMany({
      where: {
        status: {
          not: "PENDING",
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 50,
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    return { success: true, data: activities };
  } catch (error) {
    console.error("Error fetching activity history:", error);
    return { success: false, error: "Failed to fetch history", data: [] };
  }
}

export async function validateOsisActivity(
  id: string,
  action: "APPROVE" | "REJECT",
  rejectionNote?: string
) {
  const auth = await verifyPembinaOsisAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const status =
      action === "APPROVE" ? StatusApproval.APPROVED : StatusApproval.REJECTED;

    await prisma.osisActivity.update({
      where: { id },
      data: {
        status,
        rejectionNote: action === "REJECT" ? rejectionNote : null,
      },
    });

    revalidatePath("/dashboard-pembina-osis");
    revalidatePath("/dashboard-osis");
    return { success: true, message: `Program kerja berhasil ${action === "APPROVE" ? "disetujui" : "ditolak"}` };
  } catch (error) {
    console.error("Error validating activity:", error);
    return { success: false, error: "Gagal memvalidasi program kerja" };
  }
}
