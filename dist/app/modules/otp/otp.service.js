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
exports.OTPService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_config_1 = require("../../config/redis.config");
const sendEmail_1 = require("../../utils/sendEmail");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const user_model_1 = require("../user/user.model");
const OTP_EXPIRATION_TIME = 5 * 60; // 5 minutes in seconds
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const generateOtp = (length = 6) => {
    const otp = crypto_1.default.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
    return otp;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sendOTP = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        throw new appError_1.default(404, 'User not found');
    }
    if (user === null || user === void 0 ? void 0 : user.isVerified) {
        throw new appError_1.default(404, 'User already verified');
    }
    const otp = generateOtp();
    const redisKey = `otp:${email}`;
    // Store OTP in Redis with expiration
    yield redis_config_1.redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION_TIME
        }
    });
    yield (0, sendEmail_1.sendEmail)({
        to: email,
        subject: 'Your OTP Code',
        templateName: 'otp',
        templateData: { otp },
    });
    return { otp };
});
const verifyOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        throw new appError_1.default(404, 'User not found');
    }
    if (user === null || user === void 0 ? void 0 : user.isVerified) {
        throw new appError_1.default(404, 'User already verified');
    }
    const redisKey = `otp:${email}`;
    const storedOtp = yield redis_config_1.redisClient.get(redisKey);
    if (!storedOtp) {
        throw new appError_1.default(401, 'OTP Expired or Not Found');
    }
    if (storedOtp !== otp) {
        throw new appError_1.default(401, 'Invalid OTP');
    }
    yield Promise.all([
        user_model_1.User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redis_config_1.redisClient.del(redisKey), // Delete OTP after successful verification
    ]);
    return true;
});
exports.OTPService = {
    sendOTP,
    verifyOTP,
};
