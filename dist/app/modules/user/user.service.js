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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const http_status_1 = __importDefault(require("http-status"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "User Already Exist");
    }
    const hashPassword = yield bcryptjs_1.default.hash(password, Number(process.env.BCRYPT_SALT_ROUND));
    const authProvider = { provider: "credential", providerId: email };
    const user = yield user_model_1.User.create(Object.assign({ email, password: hashPassword, auth: [authProvider] }, rest));
    return { user };
});
const updateUser = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.GUIDE) {
        if (decodedToken.id !== userId) {
            throw new appError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to update this user");
        }
    }
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User does not exist");
    }
    if (decodedToken.role === user_interface_1.Role.ADMIN && ifUserExist.role === user_interface_1.Role.SUPER_ADMIN) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to update Super Admin");
    }
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.GUIDE) {
            throw new appError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to update role");
        }
    }
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.GUIDE) {
            throw new appError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to update role");
        }
    }
    // if(payload.password){
    //     payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
    // }
    const newUpdateUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    return { newUpdateUser };
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({});
    const totalUsrs = yield user_model_1.User.countDocuments();
    return {
        data: users,
        meta: {
            total: totalUsrs
        }
    };
});
const getSingleUser = (id, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(decodedToken);
    if (!decodedToken) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token or no token provided");
    }
    if (decodedToken !== id) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized to access this user");
    }
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return {
        data: user
    };
});
const getMe = (decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!decodedToken) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token or no token provided");
    }
    const user = yield user_model_1.User.findById(decodedToken).select("-password");
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return {
        data: user
    };
});
exports.UserService = {
    createUser,
    getAllUsers,
    updateUser,
    getMe,
    getSingleUser,
};
