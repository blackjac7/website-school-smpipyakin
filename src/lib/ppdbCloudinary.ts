import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary khusus untuk PPDB
const ppdbCloudinary = cloudinary;

ppdbCloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_PPDB,
  api_key: process.env.CLOUDINARY_API_KEY_PPDB,
  api_secret: process.env.CLOUDINARY_API_SECRET_PPDB,
});

export default ppdbCloudinary;

// Helper function untuk upload dokumen PPDB
export const uploadPPDBDocument = async (
  file: string,
  options: {
    documentType: string;
    nisn: string;
    fileName: string;
  }
) => {
  try {
    const { documentType, nisn, fileName } = options;

    const result = await ppdbCloudinary.uploader.upload(file, {
      folder: `ppdb-documents/${nisn}`,
      public_id: `${documentType}_${Date.now()}`,
      resource_type: "auto", // Support semua jenis file (image, pdf, dll)
      // Preserve original filename
      use_filename: true,
      filename_override: fileName,
      // Security settings
      secure: true,
      // Optimization for documents - convert PDF to image
      quality: "auto",
      fetch_format: "auto",
      flags: "attachment", // Force download when accessed
    });

    return {
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        bytes: result.bytes,
        original_filename: result.original_filename,
        display_name: result.display_name,
      },
    };
  } catch (error) {
    console.error("PPDB Cloudinary upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};

// Helper function untuk delete dokumen PPDB
export const deletePPDBDocument = async (publicId: string) => {
  try {
    const result = await ppdbCloudinary.uploader.destroy(publicId);
    return {
      success: result.result === "ok",
      data: result,
    };
  } catch (error) {
    console.error("PPDB Cloudinary delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
};

// Helper function untuk generate signed URL untuk akses terbatas
export const generateSecurePPDBUrl = (publicId: string, expiryTime = 3600) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000) + expiryTime;

    const signedUrl = ppdbCloudinary.utils.private_download_url(
      publicId,
      "auto",
      {
        expires_at: timestamp,
        attachment: true,
      }
    );

    return {
      success: true,
      url: signedUrl,
      expires_at: timestamp,
    };
  } catch (error) {
    console.error("Generate secure URL error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "URL generation failed",
    };
  }
};
