/**
 * @file response.middleware.ts
 * @description Express middleware for standardized API responses
 * @module Middlewares/ResponseMiddleware
 * @version 1.0.0
 * 
 * This middleware enhances the Express Response object with helper methods
 * for consistent API responses across all endpoints. It ensures uniform
 * response structure, status codes, and metadata.
 */

import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Response middleware that adds standardized helper methods to Express Response object
 * @function responseMiddleware
 * @param {Request} req - Express request object (unused in this middleware)
 * @param {Response} res - Express response object to be enhanced
 * @param {NextFunction} next - Express next function to continue middleware chain
 * @returns {void} Modifies res object in place, calls next()
 * 
 * @description
 * This middleware attaches three helper methods to the response object:
 * 1. res.ok() - For successful GET/PUT/PATCH/DELETE operations (200)
 * 2. res.created() - For successful resource creation (201)
 * 3. res.noContent() - For successful operations with no return data (204)
 * 
 * All methods return a consistent JSON structure with success flag,
 * optional message, data payload, and metadata including timestamp.
 * 
 * @example
 * // In a controller
 * res.ok(users, "Users retrieved successfully");
 * 
 * // Produces:
 * {
 *   "success": true,
 *   "message": "Users retrieved successfully",
 *   "data": [...users],
 *   "meta": {
 *     "timestamp": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 * 
 * @middleware
 * Should be registered early in middleware chain (after error middleware)
 * 
 * @see {@link http-status-codes} - For HTTP status code constants
 * @see {@link ../controllers/} - All controllers using these methods
 */
export const responseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  /**
   * Standard success response for most operations
   * @method res.ok
   * @template T - Type of data being returned
   * @param {T} data - The response payload (object, array, or primitive)
   * @param {string} [message] - Optional human-readable success message
   * @returns {Response} Express response with HTTP 200 and JSON body
   * 
   * @useCase
   * - Successful GET requests
   * - Successful PUT/PATCH updates
   * - Successful DELETE operations
   * - Any operation that returns data
   */
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

  /**
   * Resource creation success response
   * @method res.created
   * @template T - Type of created resource
   * @param {T} data - The newly created resource
   * @param {string} [message] - Optional creation success message
   * @returns {Response} Express response with HTTP 201 and JSON body
   * 
   * @useCase
   * - Successful POST requests creating new resources
   * - User registration
   * - Document creation
   * 
   * @note
   * Includes default message "Resource created successfully" if none provided
   */
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

  /**
   * No content success response
   * @method res.noContent
   * @param {string} [message] - Optional informational message
   * @returns {Response} Express response with HTTP 204 and JSON body
   * 
   * @useCase
   * - Successful operations that don't return data
   * - Background processing completions
   * - Cache clearing operations
   * 
   * @note
   * Returns HTTP 204 (No Content) but includes JSON for consistency
   * Some clients may ignore JSON body for 204 responses
   */
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