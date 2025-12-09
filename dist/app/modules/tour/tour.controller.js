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
exports.TourController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const tour_service_1 = require("./tour.service");
const cloudinary_config_1 = require("../../config/cloudinary.config");
/* ------------------ TOUR  CONTROLLERS -------------------- */
const createTour = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let imagesUrls = [];
    if (req.body.imagesBase64 && Array.isArray(req.body.imagesBase64)) {
        imagesUrls = yield Promise.all(req.body.imagesBase64.map((base64, idx) => __awaiter(void 0, void 0, void 0, function* () {
            const buffer = Buffer.from(base64, 'base64');
            const result = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(buffer, `tour-image-${idx}`);
            return (result === null || result === void 0 ? void 0 : result.secure_url) || '';
        })));
    }
    const payload = Object.assign(Object.assign({}, req.body), { images: imagesUrls });
    const result = yield tour_service_1.TourService.createTour(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Tour created successfully",
        data: result,
    });
}));
const getAllTours = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield tour_service_1.TourService.getAllTours(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "All Tours retrieved successfully",
        data: result
    });
}));
const updateTour = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    let imagesUrls = [];
    if (req.body.imagesBase64 && Array.isArray(req.body.imagesBase64)) {
        imagesUrls = yield Promise.all(req.body.imagesBase64.map((base64, idx) => __awaiter(void 0, void 0, void 0, function* () {
            const buffer = Buffer.from(base64, 'base64');
            const result = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(buffer, `tour-image-${idx}`);
            return (result === null || result === void 0 ? void 0 : result.secure_url) || '';
        })));
    }
    const payload = Object.assign(Object.assign({}, req.body), (imagesUrls.length && { images: imagesUrls }));
    const result = yield tour_service_1.TourService.updateTour(id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Tour updated successfully",
        data: result
    });
}));
const deleteTour = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tour_service_1.TourService.deleteTour(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Tour deleted successfully",
        data: result
    });
}));
/* ------------------ TOUR TYPE CONTROLLERS -------------------- */
const getAllTourTypes = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tour_service_1.TourService.getAllTourTypes();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "All Tour Types retrieved successfully",
        data: result
    });
}));
const createTourType = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tour_service_1.TourService.createTourType(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Tour Type created successfully",
        data: result
    });
}));
const updateTourType = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield tour_service_1.TourService.updateTourType(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Tour Type updated successfully",
        data: result
    });
}));
const deleteTourType = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tour_service_1.TourService.deleteTourType(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Tour Type deleted successfully",
        data: result
    });
}));
exports.TourController = {
    getAllTourTypes,
    createTourType,
    updateTourType,
    deleteTourType,
    createTour,
    getAllTours,
    updateTour,
    deleteTour
};
