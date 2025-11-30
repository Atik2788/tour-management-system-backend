/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import AppError from "../../errorHelpers/appError";
import { AuthServices } from "./auth.service";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";


const credentialLogin = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
 
        passport.authenticate("local", async (err: any, user: any, info: any) =>{

            if(err){
                // return new AppError(401, err)
                return next(new AppError(401, err))
            }


            if(!user){
                // return new AppError(401, info.message)
                return next(new AppError(401, info.message))
            }


            const userTokens =await createUserTokens(user)

            const {passport, ...rest} = user.toObject();

            setAuthCookie(res, userTokens)        
            sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "User Logged in successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest
            }
        })

        })(req, res, next)            
        
})



const getNewAccessToken = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken){
            throw new AppError(httpStatus.BAD_REQUEST, "Refresh token not found")
        }

        const tokenInfo = await AuthServices.getNewAccessToken(refreshToken) 

        // res.cookie("accessToken", tokenInfo.accessToken,{
        //     httpOnly: true,
        //     secure: false
        // })

        setAuthCookie(res, tokenInfo)
        
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "New Access Token Retrieved Successfully",
            data: tokenInfo
        })
})


const logout = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "User Logged Out successfully",
            data: null
        })
})


const changePassword = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword;
    const decodedToken = req.user;

    await AuthServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password Reset Successfully",
        data: null
    })
})


const resetPassword = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword;
    const decodedToken = req.user;

    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password Reset Successfully",
        data: null
    })
})

const setPassword = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const decodedToken = req.user as JwtPayload;
    const {password} = req.body;

    await AuthServices.setPassword(decodedToken.userId, password)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password Reset Successfully",
        data: null
    })
})


const googleCallbackControler = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    
    let redirectTo = req.query.state ? req.query.state as string : "" 

    if(redirectTo.startsWith("/")){
        redirectTo = redirectTo.slice(1)
    }


    const user = req.user;
    console.log('user', user)
    
    if(!user){
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    const tokenInfo = createUserTokens(user)

    setAuthCookie(res, tokenInfo)

     res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
})



export const AuthControllers = {
    credentialLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallbackControler,
    changePassword,
    setPassword,
}