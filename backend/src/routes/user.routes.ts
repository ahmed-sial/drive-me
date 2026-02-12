import express from "express"
import userAuthMiddleware from "../middlewares/userAuth.middleware.js"
import userController from "../controllers/user.controller.js"

const router = express.Router()

router.get("/profile", userAuthMiddleware.authenticateUserByToken, userController.getUser)

export default router 