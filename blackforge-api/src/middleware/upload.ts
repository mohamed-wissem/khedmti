import multer from "multer";
import { AppError } from "@/utils/apiError";

/** In-memory multipart upload for images (buffers are streamed to Cloudinary). */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(AppError.badRequest("Only image files are allowed"));
  },
});
