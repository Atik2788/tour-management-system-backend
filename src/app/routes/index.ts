import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { Authroutes } from "../modules/auth/auth.route";
import { DivisionRoutes } from "../modules/division/division.route";
import { TourRoutes } from "../modules/tour/tour.route";
import { BookingRoutes } from "../modules/bookings/booking.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { OTProutes } from "../modules/otp/otp.route";

export const router = Router()

const moduleRotes = [
    {
        path: "/users",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: Authroutes
    },
    {
        path: "/division",
        route: DivisionRoutes
    },
    {
        path: "/tour",
        route: TourRoutes
    },
    {
        path: "/booking",
        route: BookingRoutes
    },
    {
        path: "/payment",
        route: PaymentRoutes
    },
    {
        path: "/otp",
        route: OTProutes
    }
];


moduleRotes.forEach((route) =>{
    router.use(route.path, route.route)
})