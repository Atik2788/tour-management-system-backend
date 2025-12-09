import { User } from "../user/user.model";
import { IsActive } from "../user/user.interface";
import { Tour } from "../tour/tour.model";
import { Booking } from "../bookings/bookings.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  const totalUsersPromise = User.countDocuments();
  const totalActiveUsersPromise = User.countDocuments({
    isActive: IsActive.ACTIVE,
  });
  const totalInActiveUsersPromise = User.countDocuments({
    isActive: IsActive.INACTIVE,
  });
  const totalBlockedUsersPromise = User.countDocuments({
    isActive: IsActive.BLOCKED,
  });

  const newUserInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newUserInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const userByRolePromise = User.aggregate([
    //stage 1: Grouping users by role and count total users in each role

    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const [
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUserInLast7Days,
    newUserInLast30Days,
    userByRole,
  ] = await Promise.all([
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
};

const getTourStats = async () => {
  const totalTourPromise = Tour.countDocuments();

  const totalTourByTourTypePromise = Tour.aggregate([
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

  const avgTourCostPromise = Tour.aggregate([
    // state 1: group the cost form, do sum, and avarage the sum
    {
      $group: {
        _id: null,
        avgCostFrom: { $avg: "$costFrom" },
      },
    },
  ]);

  const totalTourByDivisionPromise = Tour.aggregate([
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

  const totalHiestBookedTourPromise = Booking.aggregate([
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

  const [
    totalTour,
    totalTourByTourType,
    avgTourCost,
    totalTourByDivision,
    totalHiestBookedTour,
  ] = await Promise.all([
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
};

const getBookingStats = async () => {
  const totalBookingPromise = Booking.countDocuments();

  const totalBookingStatusPromise = Booking.aggregate([
    //stage 1: grouping stage
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const bookingsPerTourPromise = Booking.aggregate([
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

  const avgGuestCountPerBookingPromise = Booking.aggregate([
    // stage 1: grouping stage
    {
      $group: {
        _id: null,
        avgGuestCount: {$avg: "$guestCount"}
      }
    },
    {
      $project:{
        _id: null,
        avgGuestCount: {$round: ["$avgGuestCount", 2]}
      }
    }
  ])

  const bookingLast7DaysPromise = Booking.countDocuments({
    createdAt:{$gte: sevenDaysAgo}
  })

  const bookingLast30DaysPromise = Booking.countDocuments({
    createdAt:{$gte: thirtyDaysAgo}
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalBookingsByUniqueUsersPromise = Booking.distinct("user").then((user: any) => user.length)

  const uniqueUserPromise = Booking.aggregate([
    {
      $group: {
        _id: "$user",
        totalBookings: {$sum: 1}
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
    {$unwind: "$userData"},
    {
      $project: {
        _id: 1,
        name: "$userData.name",
        totalBookings: 1
      }
    },
    {$unwind: "$name"},
  ])



  const [totalBooking, totalBookingStatus, bookingsPerTour, avgGuestCount, bookingLast7Days, bookingLast30Days, totalBookingsByUniqueUsers, uniqueUser] = await Promise.all(
    [totalBookingPromise, totalBookingStatusPromise, bookingsPerTourPromise, avgGuestCountPerBookingPromise, bookingLast7DaysPromise, bookingLast30DaysPromise, totalBookingsByUniqueUsersPromise, uniqueUserPromise]
  );

  return {
    totalBooking,
    totalBookingStatus,
    bookingsPerTour,
    avgGuestCount: avgGuestCount[0]?.avgGuestCount,
    bookingLast7Days,
    bookingLast30Days,
    totalBookingsByUniqueUsers,
    uniqueUser,
  };
};

const getPaymentStats = async () => {
  const  totalPaymentPromise = Payment.countDocuments();

  const totalPaymentByStatusPromise = Payment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    }
  ])

  const totalRevenuePromise = Payment.aggregate([
    //stage 1: grouping stage
    {
      $match: {status: PAYMENT_STATUS.PAID},
    },
    {
      $group: {
        _id: null,
        totalRevenue: {$sum: "$amount"}
      },
    },
 ]);

 const avgPaymentPromise = Payment.aggregate([
  //stage 1: grouping stage
  {
    $group: {
      _id: null,
      avgPaymentAmount: {$avg: "$amount"}
    },
  }
 ]);

 const paymentGetwayDataPromise = Payment.aggregate([
  {
    $group: {
      _id: {$ifNull: ["$paymentGetewayData.ststus", "unknown"]},
      count: {$sum: 1}
    }
  }
 ])



    const[totalPayment,totalPaymentByStatus, totalRevenue,avgPayment, paymentGetwayData ] = await Promise.all([totalPaymentPromise, totalRevenuePromise, totalPaymentByStatusPromise, avgPaymentPromise, paymentGetwayDataPromise]);


   return {totalPayment,totalPaymentByStatus, totalRevenue, avgPayment, paymentGetwayData};
};


export const StausService = {
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
