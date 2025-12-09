"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryUpload = exports.deleteImageFromCloudinary = exports.uploadBufferToCloudinary = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
const appError_1 = __importDefault(require("../errorHelpers/appError"));
const stream_1 = __importDefault(require("stream"));
// ---------------- Cloudinary Config ----------------
cloudinary_1.v2.config({
    cloud_name: env_1.envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: env_1.envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: env_1.envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});
// ---------------- Buffer Upload ----------------
const uploadBufferToCloudinary = (buffer, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return new Promise((resolve, reject) => {
            const public_id = `pdf/${fileName}-${Date.now()}`;
            const bufferStream = new stream_1.default.PassThrough();
            bufferStream.end(buffer);
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                resource_type: "auto",
                public_id: public_id,
                folder: "pdfs",
            }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
            bufferStream.pipe(uploadStream);
        });
    }
    catch (error) {
        console.log(error);
        throw new appError_1.default(401, `Failed to upload file to Cloudinary: ${error.message}`);
    }
});
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
// ---------------- Delete File ----------------
const deleteImageFromCloudinary = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // সব ধরনের ফাইল ধরবে (jpg, png, pdf, docx etc.)
        const regex = /\/v\d+\/(.*)$/;
        const match = url.match(regex);
        if (match && match[1]) {
            const public_id = match[1].replace(/\.[^/.]+$/, ""); // extension বাদ
            yield cloudinary_1.v2.uploader.destroy(public_id, { resource_type: "auto" });
            console.log(`File ${public_id} deleted from Cloudinary.`);
        }
    }
    catch (error) {
        throw new appError_1.default(401, error.message);
    }
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
exports.cloudinaryUpload = cloudinary_1.v2;
