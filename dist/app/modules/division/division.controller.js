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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const division_service_1 = require("./division.service");
const sendResponse_1 = require("../../utils/sendResponse");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const createDivision = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let thumbnailUrl;
    if (req.body.thumbnailBase64) { // ফ্রন্টএন্ড থেকে base64 অথবা buffer পাঠাতে হবে
        const buffer = Buffer.from(req.body.thumbnailBase64, 'base64');
        const uploadResult = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(buffer, "division-thumbnail");
        thumbnailUrl = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    const payload = Object.assign(Object.assign({}, req.body), { thumbnail: thumbnailUrl });
    const result = yield division_service_1.DivisionService.createDevision(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Division created successfully",
        data: result
    });
}));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllDivisions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield division_service_1.DivisionService.getAllDivisions();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "All Divisions retrieved successfully",
        data: result
    });
}));
const getSingleDivision = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const result = yield division_service_1.DivisionService.getSingleDivision(slug);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Single Division retrieved successfully",
        data: result
    });
}));
const updateDivision = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    let thumbnailUrl;
    if (req.body.thumbnailBase64) {
        const buffer = Buffer.from(req.body.thumbnailBase64, 'base64');
        const uploadResult = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(buffer, "division-thumbnail");
        thumbnailUrl = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    const payload = Object.assign(Object.assign({}, req.body), (thumbnailUrl && { thumbnail: thumbnailUrl }));
    const result = yield division_service_1.DivisionService.updateDivision(id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Division Updated",
        data: result
    });
}));
const deleteDivision = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield division_service_1.DivisionService.deleteDivision(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Division deleted successfully",
        data: result
    });
}));
exports.DivisionControllers = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
};
