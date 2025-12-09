/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
import { UserController } from "./user.controller";
import { createZodSchema, updateZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";


const router = Router();

router.post("/register", validateRequest(createZodSchema), UserController.createUser)
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.getAllUsers)
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe)
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.getSingleUser)


router.patch("/:id", validateRequest(updateZodSchema), checkAuth(...Object.values(Role)), UserController.updateUser)


export const UserRoutes = router;