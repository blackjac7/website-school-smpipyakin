"use server";

import { prisma } from "@/lib/prisma";

export async function getOsisStats() {
  // We don't necessarily need strict user auth for reading stats if the page is protected,
  // but good practice to keep consistent.

  // Calculate:
  // 1. Total Budget Used (Sum of approved activities)
  // 2. Pending Proposals
  // 3. Approved Activities (Count)
  // 4. Upcoming Activities (Next 30 days)

  try {
    const activities = await prisma.osisActivity.findMany();

    const totalBudget = activities
      .filter((a) => a.status === "APPROVED")
      .reduce((sum, a) => sum + a.budget, 0);

    const pendingProposals = activities.filter((a) => a.status === "PENDING").length;
    const approvedCount = activities.filter((a) => a.status === "APPROVED").length;

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    const upcomingCount = activities.filter(
      (a) =>
        a.status === "APPROVED" &&
        a.date >= today &&
        a.date <= nextMonth
    ).length;

    return {
      success: true,
      data: {
        totalBudget,
        pendingProposals,
        approvedCount,
        upcomingCount,
      },
    };
  } catch (error) {
    console.error("Stats error:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
