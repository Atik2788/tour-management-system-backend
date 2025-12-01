/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import { createNewRefreshTokenWithAccessToken } from "../../utils/userTokens";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
// import { generateToken } from "../../utils/jwt";
import { IAuthProvider, IsActive } from "../user/user.interface";
import { sendEmail } from "../../utils/sendEmail";



const getNewAccessToken = async (refreshToken: string) =>{
   
   const newAccessToken = await createNewRefreshTokenWithAccessToken(refreshToken)

    return {
        accessToken: newAccessToken
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resetPassword = async (newPassword: string, decodedToken: JwtPayload) =>{
    
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

const forgotPassword = async (email: string) =>{
    const isUserExist = await User.findOne({ email });

    if(!isUserExist){
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }
    if(isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE){
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
    }
    if(isUserExist.isDeleted){
        throw new AppError(httpStatus.BAD_REQUEST, "Usrer is deleted")
    }
    if(!isUserExist.isVerified){
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
    }


    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {expiresIn: "10m"})

    const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`

    sendEmail({
        to: isUserExist.email,
        subject: 'Password Reset Link',
        templateName: "forgetPassword",
        templateData:{
            name: isUserExist.name,
            resetUILink
        }
    })


    return {}

}

/*
    http://localhost:3000/reset-password?id=692b25178c6271b9467b6a5e&
    token=
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTJiMjUxNzhjNjI3MWI5NDY3YjZhNWUiLCJlbWFpbCI6ImFzaGFudG82NTMuZmlAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjQ2MDc2MzYsImV4cCI6MTc2NDYwODIzNn0.A_qVviAv6Lc_6fMMIQ0At9roZQxanwWjQfAKdVi6eLo
*/

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
    forgotPassword,
    
      
}