/**
 * @file loginUser.dto.ts
 * @description Data Transfer Object (DTO) for user login requests
 * @module DTOs/LoginUserDto
 * @version 1.0.0
 * 
 * This DTO defines the structure and validation rules for user login requests.
 * It ensures type safety and consistent data structure between client and server.
 * Used by express-validator for request validation and TypeScript for type checking.
 */

/**
 * Login User Data Transfer Object
 * @interface LoginUserDto
 * @property {string} email - User's registered email address for authentication
 *   @validation
 *   - Must be a valid email format
 *   - Required field (cannot be empty or null)
 *   - Should match pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *   @example "user@example.com"
 * 
 * @property {string} password - User's password for authentication
 *   @validation
 *   - Required field (cannot be empty or null)
 *   - Minimum length: 8 characters (enforced in model)
 *   - Should contain mix of uppercase, lowercase, numbers, symbols
 *   @example "SecurePass123!"
 * 
 * @description
 * This DTO represents the minimal required data for user authentication.
 * It's used by:
 * 1. Route validation middleware (express-validator)
 * 2. TypeScript type checking in controllers
 * 3. API documentation generation
 * 
 * @security
 * - Passwords should never be logged or exposed in error messages
 * - Validation should occur before any database operations
 * 
 * @see {@link ../controllers/userAuth.controller.ts} - Where this DTO is consumed
 * @see {@link ../models/user.model.ts} - Where password validation occurs
 */
export default interface LoginUserDto {
  email: string,
  password: string
}