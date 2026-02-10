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
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    // Use database aggregation for better performance
    const [budgetResult, pendingCount, approvedCount, upcomingCount] =
      await Promise.all([
        // Total budget from approved activities
        prisma.osisActivity.aggregate({
          where: { status: "APPROVED" },
          _sum: { budget: true },
        }),
        // Count pending proposals
        prisma.osisActivity.count({
          where: { status: "PENDING" },
        }),
        // Count approved activities
        prisma.osisActivity.count({
          where: { status: "APPROVED" },
        }),
        // Count upcoming approved activities (next 30 days)
        prisma.osisActivity.count({
          where: {
            status: "APPROVED",
            date: {
              gte: today,
              lte: nextMonth,
            },
          },
        }),
      ]);

    return {
      success: true,
      data: {
        totalBudget: budgetResult._sum.budget || 0,
        pendingProposals: pendingCount,
        approvedCount: approvedCount,
        upcomingCount: upcomingCount,
      },
    };
  } catch (error) {
    console.error("Stats error:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
