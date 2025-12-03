
import { Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import { OTPService } from './otp.service';
import httpStatus from 'http-status';
import { success } from 'zod';


const sendOTP = async (req: Request, res: Response) => {
    const { email, name } = req.body;
     await OTPService.sendOTP(email, name);


    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "OTP Sent Successfully",
        data: null
    });
}

const verifyOTP = async (req: Request, res: Response) => {
    const {email, otp} = req.body;
   await OTPService.verifyOTP(email, otp);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "OTP Verified Successfully",
        data: null
    });
}



export const OTPControllers = {
    sendOTP,
    verifyOTP,
};