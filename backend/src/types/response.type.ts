/**
 * @file response.type.ts
 * @description TypeScript interface definitions for standardized API responses
 * @module Types/ApiResponse
 * @version 1.0.0
 * 
 * This file defines the TypeScript interfaces for consistent API response
 * structures used throughout the application. It ensures all endpoints
 * return responses with the same shape, making the API predictable
 * and easier for clients to consume.
 */

/**
 * Standard API response interface
 * @interface ApiResponse
 * @template T - Type of data payload (defaults to any)
 * 
 * @description
 * Defines the structure of all API responses returned by the application.
 * This standardized format includes:
 * - Success flag for easy client-side checking
 * - Optional human-readable message
 * - Data payload of any type
 * - Metadata including timestamp
 * 
 * @property {boolean} success - Indicates if the request was successful
 *   @required Always included
 *   @description
 *   - true: Request completed successfully
 *   - false: Request failed (accompanied by error details)
 * 
 * @property {string} [message] - Human-readable response message
 *   @optional May be omitted for simple responses
 *   @description
 *   - Success messages: "User created successfully"
 *   - Error messages: "Invalid credentials"
 *   - Informational messages: "Processing completed"
 * 
 * @property {T} [data] - Response payload data
 *   @optional May be omitted for no-content responses
 *   @description
 *   - Single objects: User, Product, Order
 *   - Arrays: List of users, search results
 *   - Primitive values: Count, status, ID
 *   - Complex nested structures
 * 
 * @property {Object} [meta] - Response metadata
 *   @optional May be omitted or extended
 *   @property {string} timestamp - ISO 8601 timestamp of response
 *     @required Always included when meta is present
 *     @example "2024-01-15T10:30:00.000Z"
 *   @property {any} [key: string] - Additional metadata fields
 *     @optional Can include pagination, rate limits, etc.
 * 
 * @example
 * // Success response with data
 * {
 *   "success": true,
 *   "message": "User retrieved",
 *   "data": {
 *     "id": "123",
 *     "email": "user@example.com"
 *   },
 *   "meta": {
 *     "timestamp": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 * 
 * @example
 * // Error response (extends ApiResponse)
 * {
 *   "success": false,
 *   "message": "User not found",
 *   "error": {
 *     "code": "USER_NOT_FOUND",
 *     "details": "No user with ID 123"
 *   },
 *   "meta": {
 *     "timestamp": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 * 
 * @see {@link ../middlewares/response.middleware.ts} - Implements this interface
 * @see {@link ../types/express.d.ts} - Uses this interface in response methods
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}