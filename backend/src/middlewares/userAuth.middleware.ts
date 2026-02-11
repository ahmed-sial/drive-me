import type { Request, Response, NextFunction } from "express";
import userModel from "../models/user.model.js";
import { asyncHandler } from "./asyncHandler.middleware.js";
import { Unauthorized } from "../utils/AppError.js";
import jwt from "jsonwebtoken"
import type TokenInfo from "../types/tokenInfo.type.js";
import blacklistToken from "../models/blacklistToken.model.js";

const authenticateUserByToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
  const user = await userModel.findById(decoded._id)

  if (!user) {
    throw new Unauthorized()
  }
  req.user = user
  next()
})

export default { authenticateUserByToken }