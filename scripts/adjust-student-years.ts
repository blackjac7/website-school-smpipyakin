/**
 * Script to adjust student entry years (tahun masuk)
 * This script moves all student years back by 1 year
 * Example: Students with year 2026 will be changed to 2025
 *
 * Usage:
 * npx ts-node scripts/adjust-student-years.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function adjustStudentYears() {
  try {
    console.log("🔄 Starting student year adjustment...\n");

    // Get all students with their current years
    const students = await prisma.siswa.findMany({
      where: {
        year: { not: null },
      },
      select: {
        id: true,
        name: true,
        nisn: true,
        class: true,
        year: true,
      },
      orderBy: [{ year: "desc" }, { class: "asc" }],
    });

    console.log(`📊 Found ${students.length} students with year data\n`);

    if (students.length === 0) {
      console.log("✅ No students to update");
      return;
    }

    // Group students by current year
    const yearGroups = students.reduce(
      (acc, student) => {
        const year = student.year!;
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(student);
        return acc;
      },
      {} as Record<number, typeof students>,
    );

    // Display current distribution
    console.log("📋 Current Year Distribution:");
    Object.keys(yearGroups)
      .sort((a, b) => Number(b) - Number(a))
      .forEach((year) => {
        console.log(`   ${year}: ${yearGroups[Number(year)].length} students`);
      });

    console.log("\n🔄 Adjusting years (moving back 1 year)...\n");

    // Update all students - subtract 1 from year
    const updateResult = await prisma.siswa.updateMany({
      where: {
        year: { not: null },
      },
      data: {
        year: {
          decrement: 1,
        },
      },
    });

    console.log(`✅ Updated ${updateResult.count} student records\n`);

    // Verify the changes
    const updatedStudents = await prisma.siswa.findMany({
      where: {
        year: { not: null },
      },
      select: {
        year: true,
      },
    });

    const newYearGroups = updatedStudents.reduce(
      (acc, student) => {
        const year = student.year!;
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    console.log("📋 New Year Distribution:");
    Object.keys(newYearGroups)
      .sort((a, b) => Number(b) - Number(a))
      .forEach((year) => {
        console.log(`   ${year}: ${newYearGroups[Number(year)]} students`);
      });

    console.log("\n✅ Year adjustment completed successfully!");
    console.log(
      "\n💡 Tip: If you need to revert, run this script again but change 'decrement' to 'increment'",
    );
  } catch (error) {
    console.error("❌ Error adjusting student years:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
adjustStudentYears()
  .then(() => {
    console.log("\n🎉 Script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });
