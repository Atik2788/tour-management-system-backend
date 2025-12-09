/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelpers/appError";
import Stream from "stream";

// ---------------- Cloudinary Config ----------------
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

// ---------------- Buffer Upload ----------------
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      const public_id = `pdf/${fileName}-${Date.now()}`;
      const bufferStream = new Stream.PassThrough();
      bufferStream.end(buffer);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          public_id: public_id,
          folder: "pdfs",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      bufferStream.pipe(uploadStream);
    });
  } catch (error: any) {
    console.log(error);
    throw new AppError(
      401,
      `Failed to upload file to Cloudinary: ${error.message}`
    );
  }
};

// ---------------- Delete File ----------------
export const deleteImageFromCloudinary = async (url: string) => {
  try {
    // সব ধরনের ফাইল ধরবে (jpg, png, pdf, docx etc.)
    const regex = /\/v\d+\/(.*)$/;
    const match = url.match(regex);

    if (match && match[1]) {
      const public_id = match[1].replace(/\.[^/.]+$/, ""); // extension বাদ
      await cloudinary.uploader.destroy(public_id, { resource_type: "auto" });
      console.log(`File ${public_id} deleted from Cloudinary.`);
    }
  } catch (error: any) {
    throw new AppError(401, error.message);
  }
};



export const cloudinaryUpload = cloudinary;
