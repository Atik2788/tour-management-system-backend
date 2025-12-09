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
exports.AuthServices = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = require("../user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userTokens_1 = require("../../utils/userTokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
// import { generateToken } from "../../utils/jwt";
const user_interface_1 = require("../user/user.interface");
const sendEmail_1 = require("../../utils/sendEmail");
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userTokens_1.createNewRefreshTokenWithAccessToken)(refreshToken);
    return {
        accessToken: newAccessToken
    };
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resetPassword = (newPassword, id, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (decodedToken.userId !== id) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized to reset password for this user");
    }
    const isUserExist = yield user_model_1.User.findById(decodedToken.userId);
    if (!isUserExist) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    isUserExist.password = hashedPassword;
    yield isUserExist.save();
    return {};
});
const setPassword = (userId, plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    console.log('hit set');
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Password is already set for google authenticated user");
    }
    console.log('salt pass');
    const hashedPassword = yield bcryptjs_1.default.hash(plainPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND || 10));
    console.log('salt pass', hashedPassword);
    const credentialProvider = {
        provider: "credential",
        providerId: user.email
    };
    const auth = [...user.auths, credentialProvider];
    user.password = hashedPassword;
    user.auths = auth;
    yield user.save();
    return {};
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "User does not exist");
    }
    if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED || isUserExist.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, `User is ${isUserExist.isActive}`);
    }
    if (isUserExist.isDeleted) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Usrer is deleted");
    }
    if (!isUserExist.isVerified) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "User is not verified");
    }
    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    };
    const resetToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_ACCESS_SECRET, { expiresIn: "10m" });
    const resetUILink = `${env_1.envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;
    (0, sendEmail_1.sendEmail)({
        to: isUserExist.email,
        subject: 'Password Reset Link',
        templateName: "forgetPassword",
        templateData: {
            name: isUserExist.name,
            resetUILink
        }
    });
    return {};
});
const changePassword = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId);
    const isOldPasswordMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Old Password does not match");
    }
    user.password = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    user.save();
});
exports.AuthServices = {
    // credentialLogin,
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword,
    forgotPassword,
};
