import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface DocumentData {
  cloudinaryId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
}

interface PPDBFormData {
  namaLengkap: string;
  nisn: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamatLengkap: string;
  asalSekolah: string;
  kontakOrtu: string;
  namaOrtu: string;
  emailOrtu: string;
  documents: DocumentData[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PPDBFormData = await request.json();

    console.log("Received form data:", body);

    const {
      namaLengkap,
      nisn,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      alamatLengkap,
      asalSekolah,
      kontakOrtu,
      namaOrtu,
      emailOrtu,
      documents,
    } = body;

    console.log("Extracted data:", {
      namaLengkap,
      nisn,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      alamatLengkap,
      asalSekolah,
      kontakOrtu,
      namaOrtu,
      emailOrtu,
      documentsCount: documents?.length || 0,
      documents: documents, // Log the full documents array
    });

    // Validasi data wajib
    if (
      !namaLengkap ||
      !nisn ||
      !jenisKelamin ||
      !tanggalLahir ||
      !alamatLengkap ||
      !asalSekolah ||
      !kontakOrtu ||
      !namaOrtu
    ) {
      const missingFields = [];
      if (!namaLengkap) missingFields.push("Nama Lengkap");
      if (!nisn) missingFields.push("NISN");
      if (!jenisKelamin) missingFields.push("Jenis Kelamin");
      if (!tanggalLahir) missingFields.push("Tanggal Lahir");
      if (!alamatLengkap) missingFields.push("Alamat Lengkap");
      if (!asalSekolah) missingFields.push("Asal Sekolah");
      if (!kontakOrtu) missingFields.push("Kontak Orang Tua");
      if (!namaOrtu) missingFields.push("Nama Orang Tua");

      return NextResponse.json(
        {
          error: `Data berikut wajib diisi: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 }
      );
    }

    // Cek apakah NISN sudah terdaftar
    const existingApplication = await prisma.pPDBApplication.findUnique({
      where: { nisn },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "NISN sudah terdaftar dalam sistem PPDB" },
        { status: 409 }
      );
    }

    // Convert string ke tipe yang sesuai
    const genderMap: { [key: string]: "MALE" | "FEMALE" } = {
      "laki-laki": "MALE",
      perempuan: "FEMALE",
    };

    const birthDate = tanggalLahir ? new Date(tanggalLahir) : null;

    // Buat aplikasi PPDB dalam transaksi
    const result = await prisma.$transaction(async (tx) => {
      // Prepare document URLs from uploaded documents
      const documentUrls: Record<string, string> = {};

      console.log("Processing documents:", documents);

      if (documents && documents.length > 0) {
        documents.forEach((doc) => {
          console.log("Processing document:", doc.documentType, "->", doc.url);
          switch (doc.documentType) {
            case "ijazah":
              documentUrls.ijazahUrl = doc.url;
              break;
            case "aktaKelahiran":
              documentUrls.aktaKelahiranUrl = doc.url;
              break;
            case "kartuKeluarga":
              documentUrls.kartuKeluargaUrl = doc.url;
              break;
            case "pasFoto":
              documentUrls.pasFotoUrl = doc.url;
              break;
          }
        });
      }

      console.log("Final document URLs:", documentUrls);

      // Buat aplikasi PPDB
      const application = await tx.pPDBApplication.create({
        data: {
          name: namaLengkap,
          nisn,
          gender: genderMap[jenisKelamin] || null,
          birthPlace: tempatLahir || null,
          birthDate,
          address: alamatLengkap || null,
          asalSekolah: asalSekolah || null,
          parentContact: kontakOrtu || null,
          parentName: namaOrtu || null,
          parentEmail: emailOrtu || null,
          status: "PENDING",
          // Add document URLs
          ijazahUrl: documentUrls.ijazahUrl || null,
          aktaKelahiranUrl: documentUrls.aktaKelahiranUrl || null,
          kartuKeluargaUrl: documentUrls.kartuKeluargaUrl || null,
          pasFotoUrl: documentUrls.pasFotoUrl || null,
        },
      });

      console.log("Created application with document URLs:", {
        id: application.id,
        name: application.name,
        ijazahUrl: application.ijazahUrl,
        aktaKelahiranUrl: application.aktaKelahiranUrl,
        kartuKeluargaUrl: application.kartuKeluargaUrl,
        pasFotoUrl: application.pasFotoUrl,
      });

      return application;
    });

    return NextResponse.json({
      success: true,
      message: "Pendaftaran PPDB berhasil dikirim",
      data: {
        id: result.id,
        nisn: result.nisn,
        name: result.name,
        status: result.status,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error("PPDB registration error:", error);

    // Handle unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "NISN sudah terdaftar dalam sistem" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pendaftaran" },
      { status: 500 }
    );
  }
}
