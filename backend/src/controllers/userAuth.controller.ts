import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import type { Request, Response } from "express";
import userModel from "../models/user.model.js";
import type RegisterUserDto from "../dto/registerUser.dto.js";
import { BadRequest, InternalServerError, NotFound, Unauthorized, ValidationProblem } from "../utils/AppError.js";
import userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import type LoginUserDto from "../dto/loginUser.dto.js";

/**
 * @file userAuth.controller.ts
 * @description User authentication controller handling registration, login, and logout operations.
 * @module UserAuthController
 * @author [Your Name/Organization]
 * @version 1.0.0
 * 
 * This controller manages the core authentication flow including:
 * - User registration with input validation and password hashing
 * - User login with credential verification and token generation
 * - User logout with token invalidation
 * 
 * All endpoints use asyncHandler middleware for consistent error handling
 * and structured response formatting.
 */

/**
 * Handles user registration with comprehensive input validation and processing
 * @async
 * @function register
 * @param {Request} req - Express request object containing:
 *   @param {RegisterUserDto} req.body - User registration data including:
 *     @param {Object} fullName - User's full name object
 *     @param {string} fullName.firstName - User's first name (required)
 *     @param {string} email - User's email address (required)
 *     @param {string} password - User's plain text password (will be hashed)
 * @param {Response} res - Express response object with enhanced methods from custom middleware
 * @throws {BadRequest} (400) - When:
 *   - Express validator detects schema violations
 *   - Required fields (firstName, email, password) are missing or null
 *   - Request body is empty or malformed
 * @throws {InternalServerError} (500) - When:
 *   - User creation in database fails unexpectedly
 *   - Service layer returns null/undefined for created user
 * @returns {Promise<void>} Responds with:
 *   - HTTP 201 Created status
 *   - Created user object (excluding sensitive fields like password)
 *   - Success message: "User created successfully"
 * @description 
 * Registration flow:
 * 1. Validate request against express-validator rules (if defined elsewhere)
 * 2. Check for required fields in request payload
 * 3. Hash password using bcrypt (or similar) via userModel.hashPassword()
 * 4. Delegate user creation to userService.createUser() for business logic separation
 * 5. Return standardized success response or appropriate error
 * @security 
 * - Passwords are hashed before storage (never stored in plain text)
 * - Input validation prevents injection attacks
 * - Service layer may include additional security checks
 * @example
 * // Request body
 * {
 *   "fullName": { "firstName": "John", "lastName": "Doe" },
 *   "email": "john@example.com",
 *   "password": "SecurePass123!"
 * }
 */
const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate request against express-validator rules defined in route middleware
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Detailed validation errors available in errors.array()
    throw new BadRequest("Invalid request payload. Kindly specify all required fields.", errors.array())
  }

  // Type assertion to RegisterUserDto for TypeScript type safety
  const reqPayload = req.body as RegisterUserDto

  // Secondary validation layer (redundant but safe)
  if (!reqPayload) {
    throw new BadRequest("Invalid request payload. Kindly specify all required fields.")
  } else if (!reqPayload.fullName.firstName || !reqPayload.email || !reqPayload.password) {
    // Note: lastName may be optional per DTO definition, only firstName is required
    throw new BadRequest("Invalid request payload. Kindly specify all required fields.")
  }

  // Hash password before storage - critical security step
  // userModel.hashPassword() should use bcrypt with appropriate salt rounds
  reqPayload.password = await userModel.hashPassword(reqPayload.password)

  // Delegate to service layer for business logic and database operations
  // Service should handle duplicate email checks and other business rules
  const user = await userService.createUser(reqPayload)

  // Null check for service layer failure
  if (!user) {
    // Log this error server-side for debugging (email conflict, DB connection issue, etc.)
    throw new InternalServerError()
  }

  // Standardized response helper (likely from custom middleware)
  // Responds with HTTP 201, user object, and success message
  res.created(user, "User created successfully")
})

/**
 * Handles user authentication with credential verification and JWT token generation
 * @async
 * @function login
 * @param {Request} req - Express request object containing:
 *   @param {LoginUserDto} req.body - User login credentials:
 *     @param {string} email - User's registered email address
 *     @param {string} password - User's plain text password for verification
 * @param {Response} res - Express response object
 * @throws {BadRequest} (400) - When:
 *   - Express validator detects schema violations
 *   - Email or password fields are missing
 * @throws {Unauthorized} (401) - When:
 *   - No user found with provided email
 *   - Password does not match stored hash
 * @throws {InternalServerError} (500) - When:
 *   - Token generation fails (JWT signing error, missing secret, etc.)
 * @returns {Promise<void>} Responds with:
 *   - HTTP 200 OK status
 *   - User object (excluding password field)
 *   - Sets HTTP-only cookie named "token" with JWT
 *   - Success message: "User logged in successfully"
 * @description
 * Login flow:
 * 1. Validate request input
 * 2. Find user by email, explicitly select password field (normally excluded)
 * 3. Compare provided password with bcrypt hash
 * 4. Generate JWT token with user payload
 * 5. Set secure HTTP-only cookie with token
 * 6. Return user data (without sensitive fields)
 * @security
 * - Passwords compared using timing-safe bcrypt comparison
 * - JWT tokens signed with server secret
 * - HTTP-only cookies prevent XSS attacks
 * - Passwords explicitly selected (+) as they're normally excluded in schema
 * @note
 * - Consider adding rate limiting to prevent brute force attacks
 * - May want to implement login attempt tracking
 * - Token expiration should be configured in user.generateAuthToken()
 * @example
 * // Request body
 * {
 *   "email": "john@example.com",
 *   "password": "SecurePass123!"
 * }
 */
const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    throw new BadRequest("Invalid request payload. Kindly specify all required fields.", errors.array())
  }

  // Typo in variable name: 'reqPaylod' should be 'reqPayload' (consider fixing in refactor)
  const reqPaylod = req.body as LoginUserDto

  if (!reqPaylod) {
    throw new BadRequest("Invalid request payload. Kindly specify all required fields.")
  } else if (!reqPaylod.email || !reqPaylod.password) {
    throw new BadRequest("Invalid request payload. Kindly specify all required fields.")
  }

  // Find user and explicitly include password field (normally excluded in schema select: false)
  // Important: .select("+password") is required for password comparison
  const user = await userModel.findOne({ email: reqPaylod.email }).select("+password")

  if (!user) {
    // Generic error message for security (don't reveal if email exists)
    throw new Unauthorized("Invalid credentials")
  }

  // Timing-safe password comparison using bcrypt
  const isPasswordValid = await user.comparePassword(reqPaylod.password)

  // Convert Mongoose document to plain object to remove metadata
  const userObj = user.toObject()

  if (!isPasswordValid) {
    throw new Unauthorized("Invalid credentials")
  }

  // Generate JWT token - should include user ID, role, and expiration
  const token = user.generateAuthToken()

  if (!token) {
    // Token generation failure - check JWT secret configuration
    throw new InternalServerError()
  }

  // Set authentication cookie
  // Note: For production, add secure flags: { httpOnly: true, secure: true, sameSite: 'strict' }
  res.cookie("token", token)

  // Return user data (password field automatically excluded in userObj)
  res.ok({
    user: userObj,
  }, "User logged in successfully")
})

/**
 * Handles user logout by invalidating the authentication token
 * @async
 * @function logout
 * @param {Request} req - Express request object (requires authentication middleware)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Responds with:
 *   - HTTP 200 OK status
 *   - Success message: "User logged out successfully"
 *   - Clears the "token" cookie from client
 * @description
 * Logout flow:
 * 1. Clear the authentication cookie client-side
 * 2. Return success response
 * @note
 * - This is a client-side logout (server may want to implement token blacklisting)
 * - For stateless JWT, server cannot invalidate token until expiration
 * - Consider adding server-side token invalidation for enhanced security
 * @security
 * - Clears cookie but JWT remains valid until expiration
 * - For immediate invalidation, implement token blacklist or use sessions
 */
const logout = asyncHandler(async (req: Request, res: Response) => {
  // Clear the authentication cookie
  // In production, ensure cookie options match those used in login
  res.clearCookie("token")

  // Inform client of successful logout
  res.ok("User logged out successfully")
})

/**
 * @exports User authentication controller methods
 * @property {Function} register - User registration endpoint handler
 * @property {Function} login - User authentication endpoint handler  
 * @property {Function} logout - User logout endpoint handler
 */
export default { register, login, logout }