import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingService } from "./booking.service";
import { JwtPayload } from "jsonwebtoken";

const createBooking = catchAsync(async(req: Request, res: Response) =>{
    const decodedToken = req.user as JwtPayload;

    const booking = await BookingService.createBooking(req.body, decodedToken.userId);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking create Successfully",
        data: booking,
    })
})

const getUserBookings = catchAsync(async(req: Request, res: Response) =>{
    const bookings = await BookingService.getUserBookings();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Booking retrieved Successfully",
        data: bookings,
    })
})

const getSingleBooking = catchAsync(async(req: Request, res: Response) =>{
    const booking = await BookingService.getSingleBooking();

        sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Single Booking retrieved Successfully",
        data: booking,
    })
})

const getAllBookings = catchAsync(async(req: Request, res: Response) =>{
    const bookings = await BookingService.getAllBookings();
    
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All Bookings retrieved Successfully",
        data: bookings,
    })
})

const updateBookingStatus = catchAsync(async(req: Request, res: Response) =>{
    const update = await BookingService.updateBookingStatus();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Booking status updated Successfully",
        data: update,
    })
})

export const BookingController = {createBooking, getUserBookings, getSingleBooking, getAllBookings, updateBookingStatus}