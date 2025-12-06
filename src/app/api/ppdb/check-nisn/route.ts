import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nisn = searchParams.get("nisn");

    if (!nisn) {
      return NextResponse.json({ error: "NISN harus diisi" }, { status: 400 });
    }

    console.log("Checking NISN:", nisn);

    // Cek apakah NISN sudah terdaftar
    const existingApplication = await prisma.pPDBApplication.findUnique({
      where: { nisn },
      select: { id: true, name: true, createdAt: true },
    });

    if (existingApplication) {
      return NextResponse.json({
        exists: true,
        message: `NISN ${nisn} sudah terdaftar atas nama ${existingApplication.name}`,
        data: existingApplication,
      });
    }

    return NextResponse.json({
      exists: false,
      message: `NISN ${nisn} tersedia untuk pendaftaran`,
    });
  } catch (error) {
    console.error("NISN check error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengecek NISN" },
      { status: 500 }
    );
  }
}
