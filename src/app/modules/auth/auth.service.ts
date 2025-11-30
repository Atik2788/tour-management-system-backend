/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import { createNewRefreshTokenWithAccessToken } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
// import { generateToken } from "../../utils/jwt";
import { IAuthProvider } from "../user/user.interface";

// const credentialLogin = async (payload: Partial<IUser>) =>{
//     const {email, password} = payload;

//     const isUserExist = await User.findOne({email})

//     if(!isUserExist){
//         throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
//     }

//     const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string);
//     if(!isPasswordMatched){
//         throw new AppError(httpStatus.BAD_REQUEST, "Password does not match")
//     }

//     // // jwt perameter valiable
//     // const jwtPayload = {
//     //     userId: isUserExist._id,
//     //     email: isUserExist.email,
//     //     role: isUserExist.role
//     // }
//     // const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)
//     // const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)

//     const userTokens = createUserTokens(isUserExist)


//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const {password: pass, ...rest} = isUserExist.toObject();


//     return {
//         accessToken: userTokens.accessToken,
//         refreshToken: userTokens.refreshToken,
//         user: rest
//     }
// }


const getNewAccessToken = async (refreshToken: string) =>{
   
   const newAccessToken = await createNewRefreshTokenWithAccessToken(refreshToken)

    return {
        accessToken: newAccessToken
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) =>{
    return {}
}

const setPassword = async (userId: string, plainPassword: string) =>{
    const user = await User.findById(userId)
    console.log('hit set')

    if(!user){
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    if(user.password && user.auths.some(providerObject => providerObject.provider === "google")){
       throw new AppError(httpStatus.BAD_REQUEST, "Password is already set for google authenticated user") 
    }

    console.log('salt pass')
    const hashedPassword = await bcryptjs.hash(plainPassword, Number(envVars.BCRYPT_SALT_ROUND || 10));
    console.log('salt pass', hashedPassword)

    const credentialProvider: IAuthProvider = {
        provider: "credential",
        providerId: user.email
    }

    const auth: IAuthProvider[] = [...user.auths, credentialProvider]

    user.password = hashedPassword;
    user.auths = auth;

    await user.save();


    return {}
}

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) =>{

    const user = await User.findById(decodedToken.userId)

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string )

    if(!isOldPasswordMatch){
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match")
    }

     user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));
    user!.save();
}

export const AuthServices = {
    // credentialLogin,
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword,
      
}