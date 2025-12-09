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
exports.PaymentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
const bookings_model_1 = require("../bookings/bookings.model");
const bookings_interface_1 = require("../bookings/bookings.interface");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const http_status_1 = __importDefault(require("http-status"));
const slcommerz_service_1 = require("../sslcommers/slcommerz.service");
const invoice_1 = require("../../utils/invoice");
const sendEmail_1 = require("../../utils/sendEmail");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const successPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield bookings_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.PAID,
        }, { runValidators: true, session });
        if (!updatedPayment) {
            throw new appError_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
        }
        const updatedBooking = yield bookings_model_1.Booking.findOneAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: bookings_interface_1.BOOKING_STATUS.COMPLETE,
        }, { new: true, runValidators: true, session }).populate("tour", "title").populate("user", "name email");
        if (!updatedBooking) {
            throw new appError_1.default(http_status_1.default.NOT_FOUND, "Booking not found");
        }
        const invoiceData = {
            bookingDate: updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.createdAt,
            guestCount: updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.guestCount,
            totalAmount: updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.amount,
            tourTitle: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.tour).title,
            transactionId: updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.transactionId,
            userName: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).name,
        };
        const pdfBuffer = yield (0, invoice_1.generatePdf)(invoiceData);
        const cloudinaryResult = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(pdfBuffer, "invoice");
        if (!cloudinaryResult) {
            throw new appError_1.default(401, "Failed to upload invoice to cloudinary");
        }
        yield payment_model_1.Payment.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment._id, { invoiceUrl: cloudinaryResult === null || cloudinaryResult === void 0 ? void 0 : cloudinaryResult.secure_url }, { runValidators: true, session });
        yield (0, sendEmail_1.sendEmail)({
            to: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).email,
            subject: "Your Booking Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf",
                }
            ]
        });
        yield session.commitTransaction();
        session.endSession();
        return { success: true, message: "Payment Completed Successfully" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const failPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield bookings_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.FAILED,
        }, { runValidators: true, session });
        yield bookings_model_1.Booking.findOneAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: bookings_interface_1.BOOKING_STATUS.FAILED,
        }, { runValidators: true, session });
        yield session.commitTransaction();
        session.endSession();
        return { success: false, message: "Payment Failed" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const cancelPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield bookings_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.CANCLED,
        }, { runValidators: true, session });
        yield bookings_model_1.Booking.findOneAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: bookings_interface_1.BOOKING_STATUS.CANCLED,
        }, { runValidators: true, session });
        yield session.commitTransaction();
        session.endSession();
        return { success: false, message: "Payment Canceled" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const initPayment = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findOne({ booking: bookingId });
    if (!payment) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
    }
    const booking = yield bookings_model_1.Booking.findById(payment.booking);
    // SSL PAYMENT: after setting sslCommerzservice adn interface start,
    const sslPayload = {
        name: (booking === null || booking === void 0 ? void 0 : booking.user).name,
        email: (booking === null || booking === void 0 ? void 0 : booking.user).email,
        phoneNumber: (booking === null || booking === void 0 ? void 0 : booking.user).phone,
        address: (booking === null || booking === void 0 ? void 0 : booking.user).address,
        transactionId: payment.transactionId,
        amount: payment.amount,
    };
    const sslPayment = yield slcommerz_service_1.SSLService.sslPaymentInit(sslPayload);
    return {
        paymentURL: sslPayment.GatewayPageURL,
    };
});
const getInvoiceDownloadURL = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findById(paymentId).select("invoiceUrl");
    if (!payment) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
    }
    if (!payment.invoiceUrl) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "Invoice not found");
    }
    return {
        invoiceUrl: payment.invoiceUrl,
    };
});
exports.PaymentService = {
    successPayment,
    failPayment,
    cancelPayment,
    initPayment,
    getInvoiceDownloadURL,
};
