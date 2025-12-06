import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function untuk upload image
export const uploadImage = async (
  file: string,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: Record<string, unknown>;
    resource_type?: "image" | "video" | "raw" | "auto";
  } = {}
) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || "school-uploads",
      public_id: options.public_id,
      transformation: options.transformation,
      resource_type: options.resource_type || "image",
      // Optimize images automatically
      quality: "auto",
      fetch_format: "auto",
    });

    return {
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};

// Helper function untuk delete image
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === "ok",
      data: result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
};

// Helper function untuk generate URL dengan transformasi
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
) => {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || "fill",
    quality: options.quality || "auto",
    format: options.format || "auto",
    secure: true,
  });
};
