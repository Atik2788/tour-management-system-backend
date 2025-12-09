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
exports.DivisionService = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const division_model_1 = require("./division.model");
const createDevision = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingDivision = yield division_model_1.Division.findOne({ name: payload.name });
    if (existingDivision) {
        throw new Error("Division already exist");
    }
    const division = yield division_model_1.Division.create(payload);
    return division;
});
const getAllDivisions = () => __awaiter(void 0, void 0, void 0, function* () {
    const getDivision = yield division_model_1.Division.find({});
    const totalDivision = yield division_model_1.Division.countDocuments();
    return {
        data: getDivision,
        meta: {
            totalDivision
        }
    };
});
const getSingleDivision = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const division = yield division_model_1.Division.findOne({ slug });
    return {
        data: division
    };
});
const updateDivision = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingDivision = yield division_model_1.Division.findById(id);
    if (!existingDivision) {
        throw new Error("Division does not exist");
    }
    const duplicateDivision = yield division_model_1.Division.findOne({
        name: payload.name,
        _id: { $ne: id }
    });
    if (duplicateDivision) {
        throw new Error("A division with this name already exists.");
    }
    const updateDivision = yield division_model_1.Division.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (payload.thumbnail && existingDivision.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(existingDivision.thumbnail);
    }
    return updateDivision;
});
const deleteDivision = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingDivision = yield division_model_1.Division.findById(id);
    if (!existingDivision)
        throw new Error("Division does not exist");
    if (existingDivision.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(existingDivision.thumbnail);
    }
    yield division_model_1.Division.findByIdAndDelete(id);
    return null;
});
exports.DivisionService = {
    createDevision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
};
