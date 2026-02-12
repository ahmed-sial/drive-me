import { asyncHandler } from "./asyncHandler.middleware.js"
import type { Request, Response, NextFunction } from "express"
import { Unauthorized } from "../utils/AppError.js"
import jwt from "jsonwebtoken"
import blacklistToken from "../models/blacklistToken.model.js"
import type TokenInfo from "../types/tokenInfo.type.js"
import captainModel from "../models/captain.model.js"

/**
 * Middleware to authenticate users using a JSON Web Token (JWT).
 * 
 * This function attempts to extract a token from the request cookies or the 
 * Authorization header. It then verifies the token's validity and ensures 
 * it has not been blacklisted.
 * A new attribute named 'user' is also added in request object to store user data.
 * 
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the stack.
 * @throws {Unauthorized} If no token is provided or if the token is blacklisted.
 */

const authenticateCaptainByToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if (!token)
        throw new Unauthorized()

    const isBlacklistedToken = await blacklistToken.findOne({ token })

    if (isBlacklistedToken) {
        throw new Unauthorized()
    }

    if (!process.env.JWT_SECRET)
        throw new Error("JWT key is not defined. Please ensure it is defined in the environment variables.")

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenInfo

    if (!decoded) {
        throw new Unauthorized()
    }
    const user = await captainModel.findById(decoded._id)

    if (!user) {
        throw new Unauthorized()
    }
    req.user = user
    next()
})

export default { authenticateCaptainByToken }