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
exports.StausService = void 0;
const user_model_1 = require("../user/user.model");
const user_interface_1 = require("../user/user.interface");
const tour_model_1 = require("../tour/tour.model");
const bookings_model_1 = require("../bookings/bookings.model");
const payment_model_1 = require("../payment/payment.model");
const payment_interface_1 = require("../payment/payment.interface");
const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const getUserStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsersPromise = user_model_1.User.countDocuments();
    const totalActiveUsersPromise = user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.ACTIVE,
    });
    const totalInActiveUsersPromise = user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.INACTIVE,
    });
    const totalBlockedUsersPromise = user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.BLOCKED,
    });
    const newUserInLast7DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });
    const newUserInLast30DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    const userByRolePromise = user_model_1.User.aggregate([
        //stage 1: Grouping users by role and count total users in each role
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 },
            },
        },
    ]);
    const [totalUsers, totalActiveUsers, totalInActiveUsers, totalBlockedUsers, newUserInLast7Days, newUserInLast30Days, userByRole,] = yield Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUserInLast7DaysPromise,
        newUserInLast30DaysPromise,
        userByRolePromise,
    ]);
    return {
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUserInLast7Days,
        newUserInLast30Days,
        userByRole,
    };
});
const getTourStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalTourPromise = tour_model_1.Tour.countDocuments();
    const totalTourByTourTypePromise = tour_model_1.Tour.aggregate([
        //stage 1: connect Tour type model - lookup stage
        {
            $lookup: {
                from: "tourtypes",
                localField: "tourType",
                foreignField: "_id",
                as: "type",
            },
        },
        //stage 2: unwind the array to object
        {
            $unwind: "$type",
        },
        // stage: 3: grouping tour type
        {
            $group: {
                _id: "$type.name",
                count: { $sum: 1 },
            },
        },
    ]);
    const avgTourCostPromise = tour_model_1.Tour.aggregate([
        // state 1: group the cost form, do sum, and avarage the sum
        {
            $group: {
                _id: null,
                avgCostFrom: { $avg: "$costFrom" },
            },
        },
    ]);
    const totalTourByDivisionPromise = tour_model_1.Tour.aggregate([
        //stage 1: connect Division model - lookup stage
        {
            $lookup: {
                from: "divisions",
                localField: "division",
                foreignField: "_id",
                as: "division",
            },
        },
        //stage 2: unwind the array to object
        {
            $unwind: "$division",
        },
        // stage: 3: grouping tour type
        {
            $group: {
                _id: "$division.name",
                count: { $sum: 1 },
            },
        },
    ]);
    const totalHiestBookedTourPromise = bookings_model_1.Booking.aggregate([
        // stage 1:
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 },
            },
        },
        // stage 2: sort the tour
        {
            $sort: { bookingCount: -1 },
        },
        // stage 3: limit
        {
            $limit: 5,
        },
        // stage 4: lookup stage
        {
            $lookup: {
                from: "tours",
                let: { tourId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$tourId"] },
                        },
                    },
                ],
                as: "tour",
            },
        },
        //stage 5: unwind
        { $unwind: "$tour" },
        // stage 6: Projects stage
        {
            $project: {
                bookingCount: 1,
                "tour.title": 1,
                "tour.slug": 1,
            },
        },
    ]);
    const [totalTour, totalTourByTourType, avgTourCost, totalTourByDivision, totalHiestBookedTour,] = yield Promise.all([
        totalTourPromise,
        totalTourByTourTypePromise,
        avgTourCostPromise,
        totalTourByDivisionPromise,
        totalHiestBookedTourPromise,
    ]);
    return {
        totalTour,
        totalTourByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHiestBookedTour,
    };
});
const getBookingStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const totalBookingPromise = bookings_model_1.Booking.countDocuments();
    const totalBookingStatusPromise = bookings_model_1.Booking.aggregate([
        //stage 1: grouping stage
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);
    const bookingsPerTourPromise = bookings_model_1.Booking.aggregate([
        //stage 1: grouping stage
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 },
            },
        },
        //stage 2: sort
        {
            $sort: { bookingCount: -1 },
        },
        // stage 3: limit
        {
            $limit: 10,
        },
        // stage 4: lookup stage
        {
            $lookup: {
                from: "tours",
                localField: "_id",
                foreignField: "_id",
                as: "tour",
            },
        },
        // stage 5: unwind
        { $unwind: "$tour" },
        //stage 6: Projects stage
        {
            $project: {
                bookingCount: 1,
                _id: 1,
                "tour.title": 1,
                "tour.slug": 1,
            },
        },
    ]);
    const avgGuestCountPerBookingPromise = bookings_model_1.Booking.aggregate([
        // stage 1: grouping stage
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: "$guestCount" }
            }
        },
        {
            $project: {
                _id: null,
                avgGuestCount: { $round: ["$avgGuestCount", 2] }
            }
        }
    ]);
    const bookingLast7DaysPromise = bookings_model_1.Booking.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });
    const bookingLast30DaysPromise = bookings_model_1.Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalBookingsByUniqueUsersPromise = bookings_model_1.Booking.distinct("user").then((user) => user.length);
    const uniqueUserPromise = bookings_model_1.Booking.aggregate([
        {
            $group: {
                _id: "$user",
                totalBookings: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userData"
            }
        },
        { $unwind: "$userData" },
        {
            $project: {
                _id: 1,
                name: "$userData.name",
                totalBookings: 1
            }
        },
        { $unwind: "$name" },
    ]);
    const [totalBooking, totalBookingStatus, bookingsPerTour, avgGuestCount, bookingLast7Days, bookingLast30Days, totalBookingsByUniqueUsers, uniqueUser] = yield Promise.all([totalBookingPromise, totalBookingStatusPromise, bookingsPerTourPromise, avgGuestCountPerBookingPromise, bookingLast7DaysPromise, bookingLast30DaysPromise, totalBookingsByUniqueUsersPromise, uniqueUserPromise]);
    return {
        totalBooking,
        totalBookingStatus,
        bookingsPerTour,
        avgGuestCount: (_a = avgGuestCount[0]) === null || _a === void 0 ? void 0 : _a.avgGuestCount,
        bookingLast7Days,
        bookingLast30Days,
        totalBookingsByUniqueUsers,
        uniqueUser,
    };
});
const getPaymentStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalPaymentPromise = payment_model_1.Payment.countDocuments();
    const totalPaymentByStatusPromise = payment_model_1.Payment.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        }
    ]);
    const totalRevenuePromise = payment_model_1.Payment.aggregate([
        //stage 1: grouping stage
        {
            $match: { status: payment_interface_1.PAYMENT_STATUS.PAID },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" }
            },
        },
    ]);
    const avgPaymentPromise = payment_model_1.Payment.aggregate([
        //stage 1: grouping stage
        {
            $group: {
                _id: null,
                avgPaymentAmount: { $avg: "$amount" }
            },
        }
    ]);
    const paymentGetwayDataPromise = payment_model_1.Payment.aggregate([
        {
            $group: {
                _id: { $ifNull: ["$paymentGetewayData.ststus", "unknown"] },
                count: { $sum: 1 }
            }
        }
    ]);
    const [totalPayment, totalPaymentByStatus, totalRevenue, avgPayment, paymentGetwayData] = yield Promise.all([totalPaymentPromise, totalRevenuePromise, totalPaymentByStatusPromise, avgPaymentPromise, paymentGetwayDataPromise]);
    return { totalPayment, totalPaymentByStatus, totalRevenue, avgPayment, paymentGetwayData };
});
exports.StausService = {
    getUserStats,
    getTourStats,
    getBookingStats,
    getPaymentStats,
};
/*

    await Tour.updateMany(
    {
        $or: [
            {tourType: {$type: "string"}},
            {division: {$type: "string"}}
            
        ]
    },
    [
        {
            $set: {
                tourType: {$toObjectId: "$tourType"},
                division: {$toObjectId: "$division"}
            }
        }
    ]
)
    

*/
