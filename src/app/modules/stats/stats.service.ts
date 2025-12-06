import { User } from "../user/user.model";
import { IsActive } from "../user/user.interface";
import { Tour, TourType } from "../tour/tour.model";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {  
    const totalUsersPromise = User.countDocuments();
    const totalActiveUsersPromise = User.countDocuments({ isActive: IsActive.ACTIVE });
    const totalInActiveUsersPromise = User.countDocuments({ isActive: IsActive.INACTIVE });
    const totalBlockedUsersPromise = User.countDocuments({ isActive: IsActive.BLOCKED });


    const newUserInLast7DaysPromise = User.countDocuments({
        createdAt: {$gte: sevenDaysAgo}
    })
    const newUserInLast30DaysPromise = User.countDocuments({
        createdAt: {$gte: thirtyDaysAgo}
    })

    const userByRolePromise = User.aggregate([
        //stage 1: Grouping users by role and count total users in each role

        {
            $group: {
                _id: "$role",
                count: {$sum: 1}
            }
        }

    ])


    const [totalUsers, totalActiveUsers, totalInActiveUsers, totalBlockedUsers, newUserInLast7Days, newUserInLast30Days, userByRole] = await Promise.all([
        totalUsersPromise, 
        totalActiveUsersPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUserInLast7DaysPromise,
        newUserInLast30DaysPromise,
        userByRolePromise
    ]);

    return {
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUserInLast7Days,
        newUserInLast30Days,
        userByRole,
    }
}

const getTourStats = async () => {
    const totalTourPromise = Tour.countDocuments();

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

    const totalTourByTourTypePromise = Tour.aggregate([
        //stage 1: connect Tour type model - lookup stage
        {
            $lookup : {
                from: "tourtypes",
                localField: "tourType",
                foreignField: "_id",
                as: "type"
            }
        }        
    ])

    const [totalTour, totalTourByTourType] = await Promise.all([
        totalTourPromise,
        totalTourByTourTypePromise,       
    ])

    return {
        totalTour,
        totalTourByTourType
    }
}

const getPaymentStats = async () => {


    return {}
}


const getBookingStats = async () => {
    

    return {}
}






export const StausService = {
    getUserStats,
    getTourStats,
    getBookingStats,
    getPaymentStats,
}
