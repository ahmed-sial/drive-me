import { StatusCodes } from "http-status-codes"
import logger from "../logger/pino.logger.js"
import { AppError, BadRequest, Conflict, NotFound, Unauthorized, ValidationProblem } from "../utils/AppError.js"
import type { Request, NextFunction, Response } from "express"
import { MongoServerError } from "mongodb"
import mongoose, { mongo } from "mongoose"

/**
 * Standardized error response shape for API clients.
 * 
 * This interface defines the contract between backend error handling
 * and frontend error consumption. All error responses MUST conform to this shape.
 * 
 * @property status - API semantic status ("fail" for 4xx, "error" for 5xx)
 * @property message - Human-readable error summary
 * @property errorType - HTTP reason phrase (e.g., "Bad Request")
 * @property details - Structured validation/field errors for client mapping
 * @property stack - Call stack (development only)
 * @property timestamp - ISO timestamp for debugging and monitoring
 * 
 * @example Production Response
 * ```json
 * {
 *   "status": "fail",
 *   "message": "Duplicate email address",
 *   "errorType": "Conflict",
 *   "details": [{
 *     "field": "email",
 *     "message": "user@example.com already exists"
 *   }],
 *   "timestamp": "2024-01-15T10:30:00.000Z"
 * }
 * ```
 */
interface ErrorResponse {
  status: string
  message: string
  errorType?: string | undefined
  details?: any[] | undefined
  stack?: string | undefined
  timestamp: string
}

/**
 * Development environment error serializer.
 * 
 * Provides full debugging information including call stack.
 * Should NEVER be used in production due to security implications.
 * 
 * @param err - Operational or system error instance
 * @param res - Express response object
 * 
 * @security Stack traces in production expose implementation details
 */
const sendErrorDevelopment = (err: AppError, res: Response) => {
  const response: ErrorResponse = {
    status: err.status,
    message: err.message,
    errorType: err.errorType,
    details: err.details,
    stack: err.stack,
    timestamp: new Date().toISOString()
  }
  return res.status(err.statusCode).json(response)
}

/**
 * Production environment error serializer.
 * 
 * Follows the principle of least information:
 * - Operational errors: Expose safe, actionable information
 * - System errors: Generic message to prevent information leakage
 * 
 * @param err - Error instance to serialize
 * @param res - Express response object
 * 
 * @policy
 * - Operational errors: Return structured client-safe details
 * - System errors: Log internally, return generic 500 response
 */
const sendErrorProduction = (err: AppError, res: Response) => {
  if (err.isOperational) {
    // Client-caused error: provide actionable feedback
    const response: ErrorResponse = {
      status: err.status,
      message: err.message,
      errorType: err.errorType,
      details: err.details,
      timestamp: new Date().toISOString()
    }
    return res.status(err.statusCode).json(response)
  } else {
    // System/internal error: log and mask
    logger.error(err)

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Something went wrong!",
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * MongoDB/Mongoose Error Normalizer
 * ------------------------------------------------------------
 * Converts database-layer errors into standardized AppError instances.
 * 
 * Why this is necessary:
 * 1. Database errors lack HTTP semantics
 * 2. Raw MongoDB errors expose implementation details
 * 3. Different error types need consistent client presentation
 * 
 * @param err - Unknown error from database operations
 * @returns Normalized AppError or null if not a MongoDB error
 * 
 * @example Validation Error Conversion
 * ```typescript
 * // Mongoose throws:
 * // ValidationError: "email" is required
 * 
 * // Becomes:
 * // ValidationProblem with details:
 * // [{ field: "email", message: "\"email\" is required", value: null }]
 * ```
 */
export const handleMongoError = (err: unknown): AppError | null => {
  // Handle mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    return new ValidationProblem(details);
  }

  // Handle CastError (invalid ObjectId, type mismatch)
  if (err instanceof mongoose.Error.CastError) {
    return new BadRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Handle MongoDB duplicate key error (unique constraint violation)
  if (err instanceof MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "unknown";
    const value = err.keyValue?.[field];

    const message = `Duplicate field value: ${field} = ${value}. Please use another value!`;

    return new Conflict(message, [
      {
        field,
        message: `${value} already exists`,
        value
      }
    ]);
  }

  return null;
};

/**
 * JWT Validation Error Handler
 * 
 * Converts JWT library errors into standardized authentication errors.
 * 
 * @returns Unauthorized error with appropriate message
 */
const handleJWTError = (): AppError => {
  return new Unauthorized("Invalid token. Please log in again!")
}

/**
 * JWT Expiration Error Handler
 * 
 * Specific handler for expired JWT tokens.
 * 
 * @returns Unauthorized error with expiration-specific message
 */
const handleJWTExpiredError = (): AppError => {
  return new Unauthorized("Your token has expired! Please log in again.")
}

/**
 * Global Error Handling Middleware
 * ------------------------------------------------------------
 * Centralized error processing for all Express routes.
 * 
 * This middleware MUST be the last middleware in the chain (after routes).
 * It performs:
 * 1. Error normalization (database, JWT, unknown → AppError)
 * 2. Environment-aware serialization
 * 3. Structured logging
 * 4. Standardized client responses
 * 
 * @param err - Any error thrown in the application
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function (unused in error middleware)
 * 
 * @example Middleware Registration
 * ```typescript
 * // app.ts
 * app.use('/api', routes);
 * app.use(notFoundHandler); // 404 handler
 * app.use(errorHandler); // MUST be last
 * ```
 * 
 * @flow
 * 1. Normalize error to AppError instance
 * 2. Log error with request context
 * 3. Serialize based on NODE_ENV
 * 4. Send standardized response
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: AppError = err;

  // Normalize various error types to AppError
  const mongoError = handleMongoError(err);
  if (mongoError) {
    error = mongoError;
  } else if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  } else if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  } else if (!(error instanceof AppError)) {
    // Fallback for untyped errors
    error = new AppError(
      err.message || 'Internal Server Error',
      StatusCodes.INTERNAL_SERVER_ERROR,
      'error'
    );
  }

  // Structured logging with request context
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Environment-aware response serialization
  if (process.env.NODE_ENV === "development") {
    return sendErrorDevelopment(error, res);
  }

  return sendErrorProduction(error, res);
};


/**
 * 404 Not Found Handler
 * ------------------------------------------------------------
 * Catch-all middleware for undefined routes.
 * 
 * This middleware MUST be placed after all route definitions
 * but BEFORE the global errorHandler.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function to forward error
 * 
 * @example Middleware Order
 * ```typescript
 * app.use('/api', routes);    // Your API routes
 * app.use(notFoundHandler);   // Catch 404s
 * app.use(errorHandler);      // Handle all errors
 * ```
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const err = new NotFound(`Can't find ${req.originalUrl} on this server!`);
  next(err);
};

/**
 * Unhandled Promise Rejection Handler
 * ------------------------------------------------------------
 * Global safety net for promises without `.catch()` handlers.
 * 
 * WHY THIS IS CRITICAL:
 * - Node.js 15+ terminates on unhandled rejections
 * - Missing catch blocks are programming errors
 * - Graceful shutdown prevents corruption
 * 
 * @usage Call once during application bootstrap
 * ```typescript
 * // server.ts
 * handleUnhandledRejection();
 * ```
 * 
 * @security Exit code 1 triggers process manager restart (PM2, systemd)
 */
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (err: any) => {
    logger.error('UNHANDLED REJECTION! Shutting down...');
    logger.error(err.name, err.message);
    // Gracefully shutdown
    process.exit(1);
  });
};

/**
 * Uncaught Exception Handler
 * ------------------------------------------------------------
 * Global safety net for synchronous exceptions outside Express.
 * 
 * Catches:
 * - Reference errors (undefined variables)
 * - Syntax errors in runtime code
 * - Any thrown error not in try/catch
 * 
 * @usage Call once during application bootstrap
 * ```typescript
 * // server.ts
 * handleUncaughtException();
 * ```
 * 
 * @warning Some exceptions may leave application in undefined state
 * @security Immediate shutdown prevents undefined behavior
 */
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (err: any) => {
    logger.error('UNCAUGHT EXCEPTION!  Shutting down...');
    logger.error(err.name, err.message);
    process.exit(1);
  });
};