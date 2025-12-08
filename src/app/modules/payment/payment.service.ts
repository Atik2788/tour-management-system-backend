/* eslint-disable @typescript-eslint/no-explicit-any */
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import { Booking } from "../bookings/bookings.model";
import { BOOKING_STATUS } from "../bookings/bookings.interface";
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status";
import { ISSLCommerz } from "../sslcommers/sslcommerz.interface";
import { SSLService } from "../sslcommers/slcommerz.service";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";
import { sendEmail } from "../../utils/sendEmail";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";



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
    if(!updatedPayment){
      throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      updatedPayment?.booking,
      {
        status: BOOKING_STATUS.COMPLETE,
      },
      { new: true, runValidators: true, session }
    ).populate("tour", "title").populate("user", "name email");

    if(!updatedBooking){
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }


    const invoiceData:IInvoiceData = {
      bookingDate:updatedBooking?.createdAt as Date,
      guestCount: updatedBooking?.guestCount,
      totalAmount: updatedPayment?.amount,
      tourTitle: (updatedBooking?.tour as unknown as ITour).title,
      transactionId: updatedPayment?.transactionId,
      userName: (updatedBooking?.user as unknown as IUser).name,     
    }

    const pdfBuffer = await generatePdf(invoiceData)

    const cloudinaryResult  = await uploadBufferToCloudinary(pdfBuffer, "invoice")
    if(!cloudinaryResult){
      throw new AppError(401, "Failed to upload invoice to cloudinary");
    }

    await Payment.findByIdAndUpdate(updatedPayment?._id, {invoiceUrl: cloudinaryResult?.secure_url}, {runValidators: true, session});

    await sendEmail({
      to: (updatedBooking?.user as unknown as IUser).email,
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
        
    })

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

const getInvoiceDownloadURL = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).select("invoiceUrl");
  if(!payment){
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }
  if(!payment.invoiceUrl){
    throw new AppError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  return {
    invoiceUrl: payment.invoiceUrl,
  }
};

export const PaymentService = {
  successPayment,
  failPayment,
  cancelPayment,
  initPayment,
  getInvoiceDownloadURL,
};
