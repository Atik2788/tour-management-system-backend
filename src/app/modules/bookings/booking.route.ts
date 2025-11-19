
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { Role } from '../user/user.interface';
import express  from 'express';
import { createBookingZodSchema, updateBookingStatusZodSchema } from './booking.validation';
import { BookingController } from './booking.controller';

const router = express.Router();

router.post("/",
    checkAuth(...Object.values(Role)),
    validateRequest(createBookingZodSchema),
    BookingController.createBooking
)

router.get("/bookings",
     checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
     BookingController.getAllBookings
)

router.get("/my-bookings",
     checkAuth(...Object.values(Role)),
     BookingController.getUserBookings
)

router.get("/:bookingId",
     checkAuth(...Object.values(Role)),
     BookingController.getSingleBooking
)

router.patch("/:bookingId/status",
     checkAuth(...Object.values(Role)),
     validateRequest(updateBookingStatusZodSchema),
     BookingController.updateBookingStatus
)

export const BookingRoutes = router;