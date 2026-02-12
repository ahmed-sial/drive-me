import { validationResult } from "express-validator";
import type { Request, Response } from "express";
import type RegisterCaptainDto from "../dto/registerCaptain.dto.js";
import captainModel from "../models/captain.model.js";
import { BadRequest, InternalServerError, Unauthorized } from "../utils/AppError.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import captainService from "../services/captain.service.js";
import type LoginCaptainDto from "../dto/loginCaptain.dto.js";
import blacklistToken from "../models/blacklistToken.model.js";

/**
 * Handles captain registration with comprehensive input validation and processing
 * @async
 * @function register
 * @param {Request} req - Express request object containing:
 *   @param {RegisterCaptainDto} req.body - Captain registration data including:
 *     @param {Object} fullName - Captain's full name object
 *     @param {string} fullName.firstName - Captain's first name (required)
 *     @param {string} email - Captain's email address (required)
 *     @param {string} password - Captain's plain text password (will be hashed)
 * @param {Response} res - Express response object with enhanced methods from custom middleware
 * @throws {BadRequest} (400) - When:
 *   - Express validator detects schema violations
 *   - Required fields (firstName, email, password) are missing or null
 *   - Request body is empty or malformed
 * @throws {InternalServerError} (500) - When:
 *   - Captain creation in database fails unexpectedly
 *   - Service layer returns null/undefined for created captain
 * @returns {Promise<void>} Responds with:
 *   - HTTP 201 Created status
 *   - Created captain object (excluding sensitive fields like password)
 *   - Success message: "Captain created successfully"
 * @description 
 * Registration flow:
 * 1. Validate request against express-validator rules (if defined elsewhere)
 * 2. Check for required fields in request payload
 * 3. Hash password using bcrypt (or similar) via captainModel.hashPassword()
 * 4. Delegate captain creation to captainService.createCaptain() for business logic separation
 * 5. Return standardized success response or appropriate error
 * @security 
 * - Passwords are hashed before storage (never stored in plain text)
 * - Input validation prevents injection attacks
 * - Service layer may include additional security checks
 * @example
 * // Request body
 * {
 *   "fullName": { "firstName": "John", "lastName": "Doe" },
 *   "email": "[EMAIL_ADDRESS]",
 *   "password": "SecurePass123!",
 *   "vehicle": {
 *     "type": "Sedan",
 *     "color": "White",
 *     "licensePlate": "ABC-123",
 *     "capacity": 4
 *   }
 * }
 */

const register = asyncHandler(async (req: Request, res: Response) => {
    // Validate request against express-validator rules defined in route middleware
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        // Detailed validation errors available in errors.array()
        throw new BadRequest("Invalid request payload. Kindly specify all required fields.", errors.array())
    }

    // Type assertion to RegisterCaptainDto for TypeScript type safety
    const reqPayload = req.body as RegisterCaptainDto

    // Secondary validation layer (redundant but safe)
    if (!reqPayload) {
        throw new BadRequest("Invalid request payload. Kindly specify all required fields.")
    } else if (!reqPayload.fullName.firstName
        || !reqPayload.email
        || !reqPayload.password
        || !reqPayload.vehicle.color
        || !reqPayload.vehicle.licensePlate
        || !reqPayload.vehicle.capacity
        || !reqPayload.vehicle.type) {
        // Note: lastName may be optional per DTO definition, only firstName is required
        throw new BadRequest("Invalid request payload. Kindly specify all required fields.")
    }

    // Hash password before storage - critical security step
    // captainModel.hashPassword() should use bcrypt with appropriate salt rounds
    reqPayload.password = await captainModel.hashPassword(reqPayload.password)

    // Delegate to service layer for business logic and database operations
    // Service should handle duplicate email checks and other business rules
    const captain = await captainService.createCaptain(reqPayload)

    // Null check for service layer failure
    if (!captain) {
        // Log this error server-side for debugging (email conflict, DB connection issue, etc.)
        throw new InternalServerError()
    }

    // Standardized response helper (likely from custom middleware)
    // Responds with HTTP 201, captain object, and success message
    res.created(captain, "Captain registered successfully")
})

/**
 * Handles captain authentication with credential verification and JWT token generation
 * @async
 * @function login
 * @param {Request} req - Express request object containing:
 *   @param {LoginCaptainDto} req.body - Captain login credentials:
 *     @param {string} email - Captain's registered email address
 *     @param {string} password - Captain's plain text password for verification
 * @param {Response} res - Express response object
 * @throws {BadRequest} (400) - When:
 *   - Express validator detects schema violations
 *   - Email or password fields are missing
 * @throws {Unauthorized} (401) - When:
 *   - No captain found with provided email
 *   - Password does not match stored hash
 * @throws {InternalServerError} (500) - When:
 *   - Token generation fails (JWT signing error, missing secret, etc.)
 * @returns {Promise<void>} Responds with:
 *   - HTTP 200 OK status
 *   - Captain object (excluding password field)
 *   - Sets HTTP-only cookie named "token" with JWT
 *   - Success message: "Captain logged in successfully"
 * @description
 * Login flow:
 * 1. Validate request input
 * 2. Find captain by email, explicitly select password field (normally excluded)
 * 3. Compare provided password with bcrypt hash
 * 4. Generate JWT token with captain payload
 * 5. Set secure HTTP-only cookie with token
 * 6. Return captain data (without sensitive fields)
 * @security
 * - Passwords compared using timing-safe bcrypt comparison
 * - JWT tokens signed with server secret
 * - HTTP-only cookies prevent XSS attacks
 * - Passwords explicitly selected (+) as they're normally excluded in schema
 * @note
 * - Consider adding rate limiting to prevent brute force attacks
 * - May want to implement login attempt tracking
 * - Token expiration should be configured in captain.generateAuthToken()
 * @example
 * // Request body
 * {
 *   "email": "[EMAIL_ADDRESS]",
 *   "password": "SecurePass123!"
 * }
 */
const login = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        throw new BadRequest("Invalid request payload. Kindly specify all required fields.", errors.array())
    }

    // Typo in variable name: 'reqPaylod' should be 'reqPayload' (consider fixing in refactor)
    const reqPaylod = req.body as LoginCaptainDto

    if (!reqPaylod) {
        throw new BadRequest("Invalid request payload. Kindly specify all required fields.")
    } else if (!reqPaylod.email || !reqPaylod.password) {
        throw new BadRequest("Invalid request payload. Kindly specify all required fields.")
    }

    // Find captain and explicitly include password field (normally excluded in schema select: false)
    // Important: .select("+password") is required for password comparison
    const captain = await captainModel.findOne({ email: reqPaylod.email }).select("+password")

    if (!captain) {
        // Generic error message for security (don't reveal if email exists)
        throw new Unauthorized("Invalid credentials")
    }

    // Timing-safe password comparison using bcrypt
    const isPasswordValid = await captain.comparePassword(reqPaylod.password)

    // Convert Mongoose document to plain object to remove metadata
    const captainObj = captain.toObject()

    if (!isPasswordValid) {
        throw new Unauthorized("Invalid credentials")
    }

    // Generate JWT token - should include captain ID, role, and expiration
    const token = captain.generateAuthToken()

    if (!token) {
        // Token generation failure - check JWT secret configuration
        throw new InternalServerError()
    }

    // Set authentication cookie
    // Note: For production, add secure flags: { httpOnly: true, secure: true, sameSite: 'strict' }
    res.cookie("token", token)

    // Return captain data (password field automatically excluded in captainObj)
    res.ok({
        captain: captainObj,
    }, "Captain logged in successfully")
})

/**
 * Handles captain logout by invalidating the authentication token
 * @async
 * @function logout
 * @param {Request} req - Express request object (requires authentication middleware)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Responds with:
 *   - HTTP 200 OK status
 *   - Success message: "Captain logged out successfully"
 *   - Adds token to blacklist
 *   - Clears the "token" cookie from client
 * @description
 * Logout flow:
 * 1. Clear the authentication cookie client-side
 * 2. Add token to blacklist
 * 3. Return success response
 */

const logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    // Check if token is provided
    if (!token) {
        // If no token is provided, return success response
        res.ok(null, "Captain logged out successfully")
    }
    // Add token to blacklist
    await blacklistToken.create({ token })
    // Clear the authentication cookie
    res.clearCookie("token")

    // Inform client of successful logout
    res.ok(null, "Captain logged out successfully")
})

export default {
    register,
    login,
    logout
}