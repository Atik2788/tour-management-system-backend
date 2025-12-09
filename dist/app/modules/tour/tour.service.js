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
exports.TourService = void 0;
const tour_constant_1 = require("./tour.constant");
const tour_model_1 = require("./tour.model");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const cloudinary_config_1 = require("../../config/cloudinary.config");
/* ------------------ TOUR SERVICE -------------------- */
const createTour = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingtour = yield tour_model_1.Tour.findOne({ title: payload.title });
    if (existingtour) {
        throw new Error("Tour already exist");
    }
    const createdTour = yield tour_model_1.Tour.create(payload);
    return createdTour;
});
const getAllTours = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.Tour.find(), query);
    const tours = yield queryBuilder
        .search(tour_constant_1.tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    // const meta = await queryBuilder.getMeta()
    const [data, meta] = yield Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const updateTour = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingtour = yield tour_model_1.Tour.findById(id);
    if (!existingtour) {
        throw new Error("Tour does not exist");
    }
    // নতুন images add করা
    if (payload.images && payload.images.length && existingtour.images && existingtour.images.length) {
        payload.images = [...payload.images, ...existingtour.images];
    }
    // পুরোনো images delete করা
    if (payload.deleteImages && payload.deleteImages.length && existingtour.images && existingtour.images.length) {
        const restDBImages = existingtour.images.filter(imgUrl => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imgUrl)); });
        const updatedImages = (payload.images || [])
            .filter(imgUrl => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imgUrl)); })
            .filter(imgUrl => !restDBImages.includes(imgUrl));
        payload.images = [...restDBImages, ...updatedImages];
    }
    // DB update
    const updatedTour = yield tour_model_1.Tour.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    // Cloudinary থেকে delete করা
    if (payload.deleteImages && payload.deleteImages.length && existingtour.images && existingtour.images.length) {
        yield Promise.all(payload.deleteImages.map(url => (0, cloudinary_config_1.deleteImageFromCloudinary)(url)));
    }
    return updatedTour;
});
const deleteTour = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingtour = yield tour_model_1.Tour.findById(id);
    if (!existingtour) {
        throw new Error("Tour does not exist");
    }
    const result = yield tour_model_1.Tour.findByIdAndDelete(id);
    return result;
});
/* ------------------ TOUR TYPE SERVICE -------------------- */
const getAllTourTypes = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield tour_model_1.TourType.find({});
});
const createTourType = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findOne({ name: payload.name });
    if (existingTourType) {
        throw new Error("Tour Type already exist");
    }
    return yield tour_model_1.TourType.create(payload);
});
const updateTourType = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour Type does not exist");
    }
    ;
    const updateTourType = yield tour_model_1.TourType.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    return updateTourType;
});
const deleteTourType = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour Type does not exist");
    }
    const result = yield tour_model_1.TourType.findByIdAndDelete(id);
    return result;
});
exports.TourService = {
    getAllTourTypes,
    createTourType,
    updateTourType,
    deleteTourType,
    createTour,
    getAllTours,
    updateTour,
    deleteTour
};
