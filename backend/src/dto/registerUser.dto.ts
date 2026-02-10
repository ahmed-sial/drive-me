/**
 * @file registerUser.dto.ts
 * @description Data Transfer Object (DTO) for user registration requests
 * @module DTOs/RegisterUserDto
 * @version 1.0.0
 * 
 * This DTO defines the structure for new user registration data.
 * It includes both required and optional fields with appropriate type definitions.
 */

/**
 * Register User Data Transfer Object
 * @interface RegisterUserDto
 * @property {Object} fullName - User's name information
 *   @property {string} firstName - User's first/given name
 *     @validation
 *     - Required field
 *     - Minimum 3 characters (enforced in model)
 *     - Trimmed of whitespace
 *     @example "John"
 * 
 *   @property {string} [lastName] - User's last/family name (optional)
 *     @validation
 *     - Optional field (may be undefined)
 *     - Minimum 3 characters if provided (enforced in model)
 *     - Trimmed of whitespace
 *     @example "Doe"
 * 
 * @property {string} email - User's email address for account identification
 *   @validation
 *   - Required field
 *   - Must be unique across all users (enforced by database index)
 *   - Valid email format
 *   - Trimmed of whitespace
 *   @example "john.doe@example.com"
 * 
 * @property {string} password - User's chosen password
 *   @validation
 *   - Required field
 *   - Minimum 8 characters (enforced in model)
 *   - Will be hashed before storage
 *   - Not returned in any responses (select: false in model)
 *   @example "StrongPassword123!"
 * 
 * @description
 * This DTO represents the complete data required to create a new user account.
 * All fields except lastName are mandatory for successful registration.
 * 
 * @note
 * - The password will be hashed using bcrypt with 10 salt rounds
 * - Email uniqueness is enforced at database level with unique index
 * - Additional business logic may be applied in userService.createUser()
 * 
 * @see {@link ../controllers/userAuth.controller.ts} - Registration endpoint uses this
 * @see {@link ../interfaces/IUser.ts} - Corresponding interface for database model
 */
export default interface RegisterUserDto {
  fullName: {
    firstName: string,
    lastName?: string
  },
  email: string,
  password: string,
}