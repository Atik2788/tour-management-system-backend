import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";


const createUser = async(payload: Partial<IUser>) =>{
        const {email,password, ...rest} = payload;

        const isUserExist = await User.findOne({email})

        if(isUserExist){
            throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
        }

        const hashPassword = await bcryptjs.hash(password as string, Number(process.env.BCRYPT_SALT_ROUND))

        const authProvider: IAuthProvider = {provider: "credential", providerId: email as string}

        const user = await User.create({
            email,
            password: hashPassword,
            auth: [authProvider],
            ...rest
        })
        return {user}
}


const updateUser = async(userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) =>{

    const ifUserExist = await User.findById(userId);

    if(!ifUserExist){
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist")
    }   


    if(payload.role){
        if(decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE){
            throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update role")
        }

        // if(decodedToken.role === Role.ADMIN){
        //     if(payload.role === Role.SUPER_ADMIN){
        //         throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update role to Super_Admin")
        //     }
        // }

        if(payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN){
            throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update role to Super_Admin")
        }
    }
 

    if(payload.isActive || payload.isDeleted || payload.isValidated){
            if(decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE){
                throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update role")
            }
    }

    if(payload.password){
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
    }

    const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {new: true, runValidators: true})

    return {newUpdateUser}


}


const getAllUsers = async() =>{
    const users = await User.find({})

    const totalUsrs = await User.countDocuments()

    return {
        data: users,
        meta: {
            total: totalUsrs
        }
    }
}


const getSingleUser = async(id:string, decodedToken: string) =>{
    console.log(decodedToken)
    if(!decodedToken){
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token or no token provided")
    }

    if (decodedToken !== id) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to access this user");
    }

    const user = await User.findById(id)

        if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }


    return {
        data: user
    }
}


const getMe = async(decodedToken: string) =>{

    if(!decodedToken){
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token or no token provided")
    }

    const user = await User.findById(decodedToken).select("-password");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return {
        data: user
    }
}





export const UserService = {
    createUser,
    getAllUsers,
    updateUser,
    getMe,
    getSingleUser,
}

