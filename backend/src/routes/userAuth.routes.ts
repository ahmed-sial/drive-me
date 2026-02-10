/**
 * @file userAuth.routes.ts
 * @description Express router definitions for user authentication endpoints
 * @module Routes/UserAuthRoutes
 * @version 1.0.0
 * 
 * This router defines the REST API endpoints for user authentication operations.
 * It includes route definitions, validation middleware using express-validator,
 * and controller method bindings. All routes are prefixed with the base path
 * defined when mounting the router in the main application.
 */

import express from "express"
import { body } from "express-validator"
import userAuthController from "../controllers/userAuth.controller.js"

const router = express.Router()

/**
 * User Registration Endpoint
 * @route POST /register
 * @group Authentication - User authentication operations
 * @param {RegisterUserDto} request.body.required - User registration data
 *   @param {string} email.body.required - Valid email address
 *   @param {Object} fullName.body.required - User's name information
 *     @param {string} fullName.firstName.body.required - First name (min 3 chars)
 *     @param {string} [fullName.lastName] - Optional last name
 *   @param {string} password.body.required - Password (min 8 chars)
 * @returns {ApiResponse<UserDocument>} 201 - User created successfully
 * @returns {ValidationProblem} 400 - Validation errors in request payload
 * @returns {Conflict} 409 - User with email already exists
 * @returns {InternalServerError} 500 - Server error during user creation
 * 
 * @description
 * Creates a new user account with the provided registration data.
 * The endpoint performs extensive validation before processing:
 * 1. Email format validation
 * 2. First name length validation
 * 3. Password strength validation
 * 
 * @validation
 * - email: Must be valid email format using isEmail()
 * - fullName.firstName: Minimum 3 characters
 * - password: Minimum 8 characters
 * 
 * @note
 * - Last name validation is commented out (optional field)
 * - Password is hashed in controller before storage
 * - Email uniqueness is checked in user service
 * 
 * @example
 * POST /api/auth/register
 * {
 *   "email": "user@example.com",
 *   "fullName": {
 *     "firstName": "John",
 *     "lastName": "Doe"
 *   },
 *   "password": "SecurePass123!"
 * }
 */
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("fullName.firstName").isLength({ min: 3 }).withMessage("First name must be at least 3 characters long"),
    // body("fullName.lastName").isLength({ min: 3 }).withMessage("Last name must be at least 3 characters long"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
  ],
  userAuthController.register
)

/**
 * User Login Endpoint
 * @route POST /login
 * @group Authentication - User authentication operations
 * @param {LoginUserDto} request.body.required - User credentials
 *   @param {string} email.body.required - Registered email address
 *   @param {string} password.body.required - Account password
 * @returns {ApiResponse<UserDocument>} 200 - Login successful with user data
 * @returns {ValidationProblem} 400 - Validation errors in request payload
 * @returns {Unauthorized} 401 - Invalid email or password
 * @returns {InternalServerError} 500 - Token generation failure
 * 
 * @description
 * Authenticates a user with email and password credentials.
 * On successful authentication:
 * 1. Generates JWT token with user ID
 * 2. Sets HTTP-only cookie named "token"
 * 3. Returns user data (excluding password)
 * 
 * @validation
 * - email: Must be valid email format
 * - password: Minimum 8 characters (matches registration requirement)
 * 
 * @security
 * - Uses bcrypt for password comparison (timing-safe)
 * - Sets HTTP-only cookie to prevent XSS attacks
 * - JWT token should have expiration in production
 * 
 * @cookie
 * - Name: "token"
 * - Value: JWT authentication token
 * - Should be sent with subsequent authenticated requests
 * 
 * @example
 * POST /api/auth/login
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123!"
 * }
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
  ],
  userAuthController.login
)

/**
 * User Logout Endpoint
 * @route POST /logout
 * @group Authentication - User authentication operations
 * @returns {ApiResponse} 200 - Logout successful
 * 
 * @description
 * Logs out the currently authenticated user by clearing the authentication cookie.
 * This is a client-side logout - the JWT token remains valid until expiration
 * unless server-side token invalidation is implemented.
 * 
 * @cookie
 * - Clears the "token" cookie from client
 * - Should use same cookie options as login for proper clearing
 * 
 * @note
 * For enhanced security, consider:
 * 1. Implementing token blacklisting
 * 2. Using short token expiration times
 * 3. Implementing refresh token rotation
 * 
 * @example
 * POST /api/auth/logout
 * // No request body required
 */
router.post(
  "/logout",
  userAuthController.logout
)

/**
 * @exports Authentication router
 * @description Router instance containing all authentication routes
 * 
 * @usage
 * ```typescript
 * // In main app.js/server.js
 * import userAuthRoutes from './routes/userAuth.routes.js';
 * app.use('/api/auth', userAuthRoutes);
 * ```
 */
export default router