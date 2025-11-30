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
import { User } from "./user.model";



const createUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
        const user = await UserService.createUser(req.body);
        
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
        const verifiedToken = req.user;



        const user = await UserService.updateUser(userid, payload, verifiedToken as JwtPayload );

        
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

const getMe = catchAsync(async(req: Request, res: Response, next: NextFunction) =>{

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

interface TJwtPayload extends JwtPayload {
    userId: string;
}

const getSingleUser = catchAsync(async(req: Request, res: Response, next: NextFunction) =>{
        const id = req.params.id;
        const verifiedToken = req.user;

        const result = await UserService.getSingleUser(id, verifiedToken as TJwtPayload);

            sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "User retrieved successfully",
            data: result.data,
        })
})



export const UserController = {
    createUser,
    getAllUsers,
    updateUser,
    getMe,
    getSingleUser,
}