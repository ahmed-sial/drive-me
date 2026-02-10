import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Simple response middleware that adds helper methods to res
 */
export const responseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  // Success response
  res.ok = <T>(data: T, message?: string) => {
    return res.status(StatusCodes.OK).json({
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  };

  // Created response (201)
  res.created = <T>(data: T, message?: string) => {
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: message || 'Resource created successfully',
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  };

  // No content response (204)
  res.noContent = (message?: string) => {
    return res.status(StatusCodes.NO_CONTENT).json({
      success: true,
      message: message || 'No content',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  };

  next();
};