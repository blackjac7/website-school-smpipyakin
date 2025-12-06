import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nisn = searchParams.get("nisn");

    if (!nisn) {
      return NextResponse.json({ error: "NISN wajib diisi" }, { status: 400 });
    }

    // Cari aplikasi PPDB berdasarkan NISN
    const application = await prisma.pPDBApplication.findUnique({
      where: { nisn },
      select: {
        nisn: true,
        name: true,
        status: true,
        feedback: true,
        createdAt: true,
        ijazahUrl: true,
        aktaKelahiranUrl: true,
        kartuKeluargaUrl: true,
        pasFotoUrl: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "NISN tidak ditemukan dalam database PPDB" },
        { status: 404 }
      );
    }

    // Format status response
    const statusMessages = {
      PENDING:
        "Pendaftaran Anda sedang dalam tahap verifikasi dokumen. Estimasi waktu: 2-3 hari kerja.",
      ACCEPTED:
        "Selamat! Pendaftaran Anda telah DITERIMA. Silakan lakukan daftar ulang tanggal 16-20 Juli 2025.",
      REJECTED:
        "Mohon maaf, pendaftaran Anda belum dapat diterima. Silakan hubungi admin untuk informasi lebih lanjut.",
    };

    // Count uploaded documents
    const documentsCount = [
      application.ijazahUrl,
      application.aktaKelahiranUrl,
      application.kartuKeluargaUrl,
      application.pasFotoUrl,
    ].filter((url) => url !== null).length;

    // Prepare document info
    const documents = [];
    if (application.ijazahUrl)
      documents.push({ type: "ijazah", url: application.ijazahUrl });
    if (application.aktaKelahiranUrl)
      documents.push({
        type: "aktaKelahiran",
        url: application.aktaKelahiranUrl,
      });
    if (application.kartuKeluargaUrl)
      documents.push({
        type: "kartuKeluarga",
        url: application.kartuKeluargaUrl,
      });
    if (application.pasFotoUrl)
      documents.push({ type: "pasFoto", url: application.pasFotoUrl });

    return NextResponse.json({
      success: true,
      data: {
        nisn: application.nisn,
        name: application.name,
        status: application.status,
        statusMessage:
          statusMessages[application.status as keyof typeof statusMessages],
        feedback: application.feedback,
        submittedAt: application.createdAt,
        documentsCount,
        documents,
      },
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengecek status" },
      { status: 500 }
    );
  }
}
