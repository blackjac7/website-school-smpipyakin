import { NextRequest, NextResponse } from "next/server";
import { uploadPPDBDocument } from "@/lib/ppdbCloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string;
    const nisn = formData.get("nisn") as string;

    if (!file || !documentType || !nisn) {
      return NextResponse.json(
        { error: "File, document type, dan NISN harus diisi" },
        { status: 400 }
      );
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file tidak boleh lebih dari 5MB" },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file harus JPG, PNG, atau PDF" },
        { status: 400 }
      );
    }

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload ke Cloudinary
    const uploadResult = await uploadPPDBDocument(base64, {
      documentType,
      nisn,
      fileName: file.name,
    });

    if (!uploadResult.success || !uploadResult.data) {
      return NextResponse.json(
        { error: uploadResult.error || "Upload gagal" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        cloudinaryId: uploadResult.data.public_id,
        url: uploadResult.data.secure_url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        documentType,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload file" },
      { status: 500 }
    );
  }
}
