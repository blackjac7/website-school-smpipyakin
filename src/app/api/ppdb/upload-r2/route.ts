import { NextRequest, NextResponse } from "next/server";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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

    // Server-side rate limiting (per IP) to prevent abuse of upload endpoint
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { isAllowed } = await import("@/lib/rateLimiter");
    // Limit uploads to 20 per hour per IP
    const rlUpload = isAllowed(`ppdb-upload:${ip}`, 20, 60 * 60 * 1000);
    if (!rlUpload.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan upload. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file tidak boleh lebih dari 5MB" },
        { status: 400 }
      );
    }

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

    const fileExtension = file.name.split(".").pop();
    const fileName = `${nisn}/${documentType}_${Date.now()}.${fileExtension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to R2
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };

    await r2.send(new PutObjectCommand(uploadParams));

    // Construct Public URL
    const publicUrl = process.env.R2_PUBLIC_URL
      ? `${process.env.R2_PUBLIC_URL}/${fileName}`
      : `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        cloudinaryId: fileName, // Reuse this field for the key/path
        url: publicUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        documentType,
      },
    });
  } catch (error) {
    console.error("R2 Upload error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload file ke R2" },
      { status: 500 }
    );
  }
}
