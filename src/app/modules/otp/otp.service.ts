import crypto from 'crypto';
import { redisClient } from '../../config/redis.config';
import { sendEmail } from '../../utils/sendEmail';
import AppError from '../../errorHelpers/appError';
import { User } from '../user/user.model';


const OTP_EXPIRATION_TIME = 5 * 60; // 5 minutes in seconds

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const generateOtp = (length: number = 6) => {
    const otp = crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
    return otp;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sendOTP = async (email: string, name: string) => {
    const user = await User.findOne({email});
    if(!user){
        throw new AppError(404, 'User not found');
    }

    if(user?.isVerified){
        throw new AppError(404, 'User already verified');
    }

    const otp = generateOtp();
    const redisKey = `otp:${email}`;

    // Store OTP in Redis with expiration
    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION_TIME
        }
    });

    await sendEmail({
        to: email,
        subject: 'Your OTP Code',
        templateName: 'otp',
        templateData: { otp },
    });
    

    return { otp };
}


const verifyOTP = async (email: string, otp: string) => {
    const user = await User.findOne({email});
    if(!user){
        throw new AppError(404, 'User not found');
    }
    if(user?.isVerified){ 
        throw new AppError(404, 'User already verified');
    }
    
    const redisKey = `otp:${email}`;
    const storedOtp = await redisClient.get(redisKey);

    if(!storedOtp){
        throw new AppError(401,'OTP Expired or Not Found');
    }

    if (storedOtp !== otp) {
        throw new AppError(401, 'Invalid OTP');
    }

    await Promise.all([
        User.updateOne({email}, {isVerified: true}, {runValidators: true}),
        redisClient.del(redisKey), // Delete OTP after successful verification
    ])

    return true;
}   




export const OTPService = {
    sendOTP,
    verifyOTP,
};