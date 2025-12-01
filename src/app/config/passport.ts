/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import  bcryptjs from 'bcryptjs';


passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) =>{

        try {

        // check user exist
        const isUserExist = await User.findOne({email})
        
        // if(!isUserExist){
        //     return done(null, false, {message: "User does not exist"})
        // }
        if(!isUserExist){
            return done("User does not exist")
        }

        if(!isUserExist.isVerified){
            // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
            return done( "User is not verified")
        }

        if(isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE){
            //   throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
           return done(`User is ${isUserExist.isActive}`)
        }
        if(isUserExist.isDeleted){
            //    throw new AppError(httpStatus.BAD_REQUEST, "Usrer is deleted")
            return done( "User is deleted")
        }
        



        // check user is authenticated with google
        const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider === "google")

        // if(isGoogleAuthenticated){
        //     return done(null, false, {message: "You are authenticated with google. Please login with google or if you want to login with credential please at first login with google and  set a password for your gamil and than login with email and password."})
        // }
        if(isGoogleAuthenticated && !isUserExist.password){
            return done( "You are authenticated with google. Please login with google or if you want to login with credential please at first login with google and  set a password for your gamil and than login with email and password.")
        }


        // check password is matched 
        const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string);
        if(!isPasswordMatched){
            return done (null, false, {message: "Password does not match"})
        }

        return done(null, isUserExist)

        } catch (error) {
            console.log(error)
            done(error)
        }
    })
)


passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL,
        }, async(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) =>{
            try {
                const email = profile.emails?.[0].value;
                
                if(!email){
                    return done(null, false, {message: "Email not found"});
                }

                let isUserExist = await User.findOne({email})

                    if(isUserExist &&!isUserExist.isVerified){
                        return done(null, false, {message: "User is not verified"})
                    }

                    if(isUserExist && (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE)){
                        return done(`User is ${isUserExist.isActive}`)
                    }
                    if(isUserExist && isUserExist.isDeleted){
                        return done(null, false, {message: "User is deleted"})
                    }

                if(!isUserExist){
                    isUserExist = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.USER,
                        isValidated: true,
                        auths:[
                            {
                                provider: "google",
                                providerId: profile.id
                            }
                        ]
                    })
                }

                return done(null, isUserExist)


            } catch (error) {
                console.log('Google strategy error', error);
                return done(error);
            }
        }
    )
)


passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) =>{
    done(null, user._id)
})


passport.deserializeUser(async (id: string, done: any) =>{
    try {
        const usre = User.findById(id)
        done(null, usre)
    } catch (error) {
        done(error);
        console.log(error)
    }
})