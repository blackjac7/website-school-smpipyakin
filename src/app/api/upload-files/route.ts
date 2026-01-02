import { NextRequest, NextResponse } from "next/server";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * API Route for uploading files (PDF, documents) to Cloudflare R2
 * Uses same bucket as PPDB but organized in separate folders:
 * - proposals/    (OSIS proposals)
 * - announcements/ (Admin announcement attachments)
 * - guides/       (PPDB guide PDFs)
 * - ppdb/         (PPDB registration documents)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "misc";
    const fileType = (formData.get("fileType") as string) || "document";

    if (!file) {
      return NextResponse.json({ error: "File harus diisi" }, { status: 400 });
    }

    // Server-side rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { isAllowed } = await import("@/lib/rateLimiter");
    const rlUpload = isAllowed(`file-upload:${ip}`, 20, 60 * 60 * 1000);
    if (!rlUpload.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan upload. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    // Validation - Max 10MB for PDFs
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file tidak boleh lebih dari 10MB" },
        { status: 400 }
      );
    }

    // Allowed file types
    const allowedTypes = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file harus PDF, DOC, DOCX, XLS, atau XLSX" },
        { status: 400 }
      );
    }

    // Generate filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 50);
    const fileName = `${folder}/${fileType}_${timestamp}_${sanitizedFileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to R2 (same bucket as PPDB, organized by folders)
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        fileType: fileType,
      },
    };

    await r2.send(new PutObjectCommand(uploadParams));

    // Construct Public URL (same as PPDB)
    const publicUrl = process.env.R2_PUBLIC_URL
      ? `${process.env.R2_PUBLIC_URL}/${fileName}`
      : `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        key: fileName,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fileType: fileType,
      },
    });
  } catch (error) {
    console.error("R2 Files Upload error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload file ke R2" },
      { status: 500 }
    );
  }
}
