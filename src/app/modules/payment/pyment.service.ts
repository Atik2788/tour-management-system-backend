/* eslint-disable @typescript-eslint/no-explicit-any */
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Booking } from "../bookings/bookings.model";
import { BOOKING_STATUS } from "../bookings/bookings.interface";
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status";
import { ISSLCommerz } from "../sslcommers/sslcommerz.interface";
import { SSLService } from "../sslcommers/slcommerz.service";

const successPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.PAID,
      },
      { runValidators: true, session }
    );

    await Booking.findOneAndUpdate(
      updatedPayment?.booking,
      {
        status: BOOKING_STATUS.COMPLETE,
      },
      { runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: "Payment Completed Successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const failPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.FAILED,
      },
      { runValidators: true, session }
    );

    await Booking.findOneAndUpdate(
      updatedPayment?.booking,
      {
        status: BOOKING_STATUS.FAILED,
      },
      { runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: false, message: "Payment Failed" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cancelPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.CANCLED,
      },
      { runValidators: true, session }
    );

    await Booking.findOneAndUpdate(
      updatedPayment?.booking,
      {
        status: BOOKING_STATUS.CANCLED,
      },
      { runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: false, message: "Payment Canceled" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const initPayment = async (bookingId: string) => {
  const payment = await Payment.findOne({ booking: bookingId });
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  const booking = await Booking.findById(payment.booking)

  // SSL PAYMENT: after setting sslCommerzservice adn interface start,
  const sslPayload: ISSLCommerz = {
    name: (booking?.user as any).name,
    email: (booking?.user as any).email,
    phoneNumber: (booking?.user as any).phone,
    address: (booking?.user as any).address,
    transactionId: payment.transactionId,
    amount: payment.amount,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return{
     paymentURL: sslPayment.GatewayPageURL,
  }
};

export const PaymentService = {
  successPayment,
  failPayment,
  cancelPayment,
  initPayment,
};
