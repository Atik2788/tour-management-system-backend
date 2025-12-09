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
exports.OTPControllers = void 0;
const sendResponse_1 = require("../../utils/sendResponse");
const otp_service_1 = require("./otp.service");
const http_status_1 = __importDefault(require("http-status"));
const sendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name } = req.body;
    yield otp_service_1.OTPService.sendOTP(email, name);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "OTP Sent Successfully",
        data: null
    });
});
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    yield otp_service_1.OTPService.verifyOTP(email, otp);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "OTP Verified Successfully",
        data: null
    });
});
exports.OTPControllers = {
    sendOTP,
    verifyOTP,
};
