import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET: Fetch all students for card generation with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get("year");
    const classParam = searchParams.get("class");
    const searchParam = searchParams.get("search");

    const where: Prisma.SiswaWhereInput = {};
    const conditions: Prisma.SiswaWhereInput[] = [];

    if (yearParam) {
      conditions.push({ year: parseInt(yearParam) });
    }

    if (classParam && classParam !== "all") {
      conditions.push({ class: classParam });
    }

    if (searchParam) {
      conditions.push({
        OR: [
          { name: { contains: searchParam, mode: "insensitive" } },
          { nisn: { contains: searchParam } },
        ],
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Get filtered students
    const students = await prisma.siswa.findMany({
      where,
      select: {
        id: true,
        nisn: true,
        name: true,
        class: true,
        year: true,
        gender: true,
        birthDate: true,
        birthPlace: true,
        qrToken: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { class: "asc" }, { name: "asc" }],
    });

    // Transform data untuk client
    const formattedStudents = students.map((student) => ({
      id: student.id,
      nisn: student.nisn,
      name: student.name || student.user.username,
      class: student.class,
      year: student.year,
      gender: student.gender,
      birthDate: student.birthDate ? student.birthDate.toISOString() : null,
      birthPlace: student.birthPlace,
    }));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error("Error fetching students for card generation:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}
