import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/utils/security";
import { prisma } from "@/lib/prisma";
import { PPDBStatus } from "@prisma/client";

type ApplicationData = {
  id: string;
  name: string;
  nisn: string;
  gender: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  address: string | null;
  asalSekolah: string | null;
  parentContact: string | null;
  parentName: string | null;
  parentEmail: string | null;
  status: string;
  feedback: string | null;
  ijazahUrl: string | null;
  aktaKelahiranUrl: string | null;
  kartuKeluargaUrl: string | null;
  pasFotoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is ppdb-officer
    if (payload.role !== "ppdb-officer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: {
      status?: PPDBStatus;
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        nisn?: { contains: string; mode: "insensitive" };
        asalSekolah?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    if (status && status !== "all") {
      const statusUpper = status.toUpperCase();
      if (['PENDING', 'ACCEPTED', 'REJECTED'].includes(statusUpper)) {
        whereClause.status = statusUpper as PPDBStatus;
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nisn: { contains: search, mode: "insensitive" } },
        { asalSekolah: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get applications with pagination
    const applications = await prisma.pPDBApplication.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        nisn: true,
        gender: true,
        birthPlace: true,
        birthDate: true,
        address: true,
        asalSekolah: true,
        parentContact: true,
        parentName: true,
        parentEmail: true,
        status: true,
        feedback: true,
        ijazahUrl: true,
        aktaKelahiranUrl: true,
        kartuKeluargaUrl: true,
        pasFotoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.pPDBApplication.count({
      where: whereClause,
    });

    // Format the response
    const formattedApplications = applications.map((app: ApplicationData) => ({
      id: app.id,
      name: app.name,
      nisn: app.nisn,
      gender: app.gender,
      birthPlace: app.birthPlace,
      birthDate: app.birthDate,
      address: app.address,
      asalSekolah: app.asalSekolah,
      parentContact: app.parentContact,
      parentName: app.parentName,
      parentEmail: app.parentEmail,
      status: app.status,
      statusColor: getStatusColor(app.status),
      feedback: app.feedback,
      documents: {
        ijazah: !!app.ijazahUrl,
        akta: !!app.aktaKelahiranUrl,
        kk: !!app.kartuKeluargaUrl,
        foto: !!app.pasFotoUrl,
      },
      documentUrls: {
        ijazahUrl: app.ijazahUrl,
        aktaKelahiranUrl: app.aktaKelahiranUrl,
        kartuKeluargaUrl: app.kartuKeluargaUrl,
        pasFotoUrl: app.pasFotoUrl,
      },
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedApplications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching PPDB applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "ACCEPTED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
