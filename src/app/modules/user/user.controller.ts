/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserService } from "./user.service";
import { catchAsync } from './../../utils/catchAsync';
import { success } from "zod";
import { sendResponse } from "../../utils/sendResponse";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";



// const createUser = async(req: Request, res: Response, next: NextFunction) => {
//     try {
//         // throw new AppError(httpStatus.BAD_REQUEST, "fake error for testing global handler")
//         const user = await UserService.createUser(req.body);
//         res.status(httpStatus.CREATED).json({
//             message: "User created successfully",
//             user, 
//         })        
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error:any) {
//         // console.log(error);
//         // res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//         //      message: `Error creating user ${error.message}`,
//         // })
//         next(error)
// }}

const createUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
        const user = await UserService.createUser(req.body);

        // res.status(httpStatus.CREATED).json({
        //     message: "User created successfully",
        //     user, 
        // }) 
        
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "User created successfully",
            data: user
        })
})


const updateUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
        const userid = req.params.id;
        const payload = req.body;

        // const token = req.headers.authorization;
        // const verifiedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload
        const verifiedToken = req.user;



        const user = await UserService.updateUser(userid, payload, verifiedToken as JwtPayload );

        // res.status(httpStatus.CREATED).json({
        //     message: "User created successfully",
        //     user, 
        // }) 
        
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "User updated successfully",
            data: user
        })
})


const getAllUsers = catchAsync(async(req: Request, res: Response, next: NextFunction) =>{

        const result = await UserService.getAllUsers();

        // res.status(httpStatus.OK).json({
        //     success: true,
        //     message: "Users retrieved successfully",
        //     users,
        // })
            sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "All Users retrieved successfully",
            data: result.data,
            meta: result.meta
        })
})



export const UserController = {
    createUser,
    getAllUsers,
    updateUser
}