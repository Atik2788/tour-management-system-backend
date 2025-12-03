import express from 'express';
import { OTPControllers } from './otp.controller';


const router = express.Router();

router.post("/send", OTPControllers.sendOTP);
router.post("/verify", OTPControllers.verifyOTP);

export const OTProutes = router;
