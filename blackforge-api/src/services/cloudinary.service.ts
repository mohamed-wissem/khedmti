import { v2 as cloudinary } from "cloudinary";
import { config } from "@/config";
import { AppError } from "@/utils/apiError";

let configured = false;

function ensureConfigured(): void {
  if (!config.cloudinary.enabled) {
    throw AppError.serviceUnavailable("Image uploads are not configured");
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
    configured = true;
  }
}

export interface UploadedImage {
  url: string;
  publicId: string;
}

/** Upload an in-memory image buffer to Cloudinary. */
export function uploadImage(
  buffer: Buffer,
  folder = "blackforge/products"
): Promise<UploadedImage> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err || !result) return reject(AppError.internal("Image upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/** Remove an image from Cloudinary by its public id. */
export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}
