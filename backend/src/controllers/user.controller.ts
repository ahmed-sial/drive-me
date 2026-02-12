import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import type { Request, Response } from "express";

const getUser = asyncHandler(async (req: Request, res: Response) => {
  return res.ok(req.user)
})

export default { getUser }