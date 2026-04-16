"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBuffer = uploadBuffer;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
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
    cloudinary_1.v2.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
}
async function uploadBuffer(buffer) {
    configureCloudinary();
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            resource_type: "image",
            folder: "ai-effects",
        }, (err, result) => {
            if (err) {
                console.error("CLOUDINARY RAW ERROR =", err);
                return reject(err);
            }
            if (!result?.secure_url) {
                return reject(new Error("Cloudinary upload failed"));
            }
            console.log("CLOUDINARY UPLOAD URL =", result.secure_url);
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
}
