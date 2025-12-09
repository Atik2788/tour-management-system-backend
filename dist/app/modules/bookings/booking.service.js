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
exports.BookingService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const bookings_interface_1 = require("./bookings.interface");
const bookings_model_1 = require("./bookings.model");
const user_model_1 = require("../user/user.model");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const http_status_1 = __importDefault(require("http-status"));
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const tour_model_1 = require("../tour/tour.model");
const slcommerz_service_1 = require("../sslcommers/slcommerz.service");
const getTransactionId_1 = require("../../utils/getTransactionId");
const createBooking = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = (0, getTransactionId_1.getTranscationId)();
    const session = yield bookings_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.User.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.phone) || !(user === null || user === void 0 ? void 0 : user.address)) {
            throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Please update your profile to book a tour");
        }
        const tour = yield tour_model_1.Tour.findById(payload.tour).select("costFrom");
        if (!(tour === null || tour === void 0 ? void 0 : tour.costFrom)) {
            throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Tour cost is not available");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const amount = Number(tour.costFrom) * Number(payload.guestCount);
        const booking = yield bookings_model_1.Booking.create([Object.assign({ user: userId, status: bookings_interface_1.BOOKING_STATUS.PENDING }, payload)], { session });
        const payment = yield payment_model_1.Payment.create([{
                booking: booking[0]._id,
                status: payment_interface_1.PAYMENT_STATUS.UNPAID,
                transactionId: transactionId,
                amount: amount,
            }], { session });
        const updatedBooking = yield bookings_model_1.Booking
            .findByIdAndUpdate(booking[0]._id, { payment: payment[0]._id }, { new: true, runValidators: true, session }).populate("user", "name email phone address").populate("tour", "title costFrom").populate("payment");
        // SSL PAYMENT: after setting sslCommerzservice adn interface start, 
        const sslPayload = {
            name: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).name,
            email: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).email,
            phoneNumber: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).phone,
            address: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).address,
            transactionId: transactionId,
            amount: amount,
        };
        const sslPayment = yield slcommerz_service_1.SSLService.sslPaymentInit(sslPayload);
        // SSL PAYMENT: after setting sslCommerzservice adn interface end, 3.50
        yield session.commitTransaction();
        session.endSession();
        return {
            paymentURL: sslPayment.GatewayPageURL,
            booking: updatedBooking,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getUserBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const getSingleBooking = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const getAllBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield bookings_model_1.Booking.find()
        .populate("user")
        .populate("tour")
        .populate("payment");
    return bookings;
});
const updateBookingStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
exports.BookingService = {
    createBooking,
    getUserBookings,
    getSingleBooking,
    getAllBookings,
    updateBookingStatus,
};
