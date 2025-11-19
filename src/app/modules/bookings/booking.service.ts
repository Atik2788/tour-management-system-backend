/* eslint-disable @typescript-eslint/no-explicit-any */
import { BOOKING_STATUS, IBooking } from "./bookings.interface";
import { Booking } from "./bookings.model";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { SSLService } from "../sslcommers/slcommerz.service";
import { ISSLCommerz } from "../sslcommers/sslcommerz.interface";

const getTranscationId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}}`;
};

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTranscationId();

  const session = await Booking.startSession();
  session.startTransaction();

  try {

      const user = await User.findById(userId);

      if (!user?.phone || !user?.address) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Please update your profile to book a tour"
        );
      }

      const tour = await Tour.findById(payload.tour).select("costFrom");

      if (!tour?.costFrom) {
        throw new AppError(httpStatus.BAD_REQUEST, "Tour cost is not available");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const amount = Number(tour.costFrom) * Number(payload.guestCount!);

      const booking = await Booking.create([{
        user: userId,
        status: BOOKING_STATUS.PENDING,
        ...payload,
      }], {session});

      const payment = await Payment.create([{
        booking: booking[0]._id,
        status: PAYMENT_STATUS.UNPAID,
        transactionId: transactionId,
        amount: amount,
      }], {session});

      const updatedBooking = await Booking
      .findByIdAndUpdate(
        booking[0]._id, 
        {payment: payment[0]._id},
        {new:true, runValidators: true, session}
      ).populate("user", "name email phone address").populate("tour", "title costFrom").populate("payment");


      // SSL PAYMENT: after setting sslCommerzservice adn interface start, 
      const sslPayload: ISSLCommerz ={
        name: (updatedBooking?.user as any).name,
        email: (updatedBooking?.user as any).email,
        phoneNumber: (updatedBooking?.user as any).phone,
        address: (updatedBooking?.user as any).address,
        transactionId: transactionId,
        amount: amount,
      }

      const sslPayment = await SSLService.sslPaymentInit(sslPayload); 

       // SSL PAYMENT: after setting sslCommerzservice adn interface end, 3.50

      await session.commitTransaction();
      session.endSession();

      return {
        paymentURL: sslPayment.GatewayPageURL,
        booking:updatedBooking,        
      }

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
 
};

const getUserBookings = async () => {
  
  return {};
};
const getSingleBooking = async () => {
  
  return {};
};

const getAllBookings = async () => {
  const bookings = await Booking.find()
    .populate("user")
    .populate("tour")
    .populate("payment");
  return bookings;
};

const updateBookingStatus = async (
 
) => {
  
  return {};
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getSingleBooking,
  getAllBookings,
  updateBookingStatus,
};
