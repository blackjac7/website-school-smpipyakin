"use server";

import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { getAuthenticatedUser } from "@/lib/auth";

export async function uploadImageAction(formData: FormData) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.",
      };
    }

    // Validate file size (5MB)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || "5242880");
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
      };
    }

    // Convert file to buffer then to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadResult = await uploadImage(base64File, {
      folder: `school/${folder}`,
      public_id: `${user.userId}_${Date.now()}`,
    });

    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    return {
      success: true,
      data: {
        url: uploadResult.data?.secure_url,
        public_id: uploadResult.data?.public_id,
        width: uploadResult.data?.width,
        height: uploadResult.data?.height,
        format: uploadResult.data?.format,
        bytes: uploadResult.data?.bytes,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteImageAction(publicId: string) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!publicId) {
      return { success: false, error: "Public ID is required" };
    }

    const deleteResult = await deleteImage(publicId);

    if (!deleteResult.success) {
      return { success: false, error: deleteResult.error };
    }

    return { success: true, message: "Image deleted successfully" };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Internal server error" };
  }
}
