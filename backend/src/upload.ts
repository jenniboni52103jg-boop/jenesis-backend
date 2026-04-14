import dotenv from "dotenv";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function configureCloudinary() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  console.log("CLOUDINARY_URL =", cloudinaryUrl ? "OK" : "MISSING");

  if (!cloudinaryUrl) {
    throw new Error("Missing CLOUDINARY_URL");
  }

  const withoutPrefix = cloudinaryUrl.replace("cloudinary://", "");
  const [authPart, cloudName] = withoutPrefix.split("@");
  const [apiKey, apiSecret] = authPart.split(":");

  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error("Invalid CLOUDINARY_URL format");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function uploadBuffer(buffer: Buffer) {
  configureCloudinary();

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "ai-effects",
      },
      (err, result) => {
        if (err) {
          console.error("CLOUDINARY RAW ERROR =", err);
          return reject(err);
        }

        if (!result?.secure_url) {
          return reject(new Error("Cloudinary upload failed"));
        }

        console.log("CLOUDINARY UPLOAD URL =", result.secure_url);
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}