/**
 * @file IUser.ts
 * @description User entity interface representing the complete user data structure
 * @module Interfaces/IUser
 * @version 1.0.0
 * 
 * This interface defines the TypeScript representation of a User entity.
 * It serves as the contract between different parts of the application
 * and is implemented by the Mongoose schema in user.model.ts.
 */

/**
 * User Entity Interface
 * @interface IUser
 * @property {Object} fullName - Complete name of the user
 *   @property {string} firstName - User's primary/first name
 *     @required Always required for user identification
 *     @example "Alice"
 * 
 *   @property {string} [lastName] - User's secondary/last name
 *     @optional May be omitted for users with single names
 *     @example "Smith"
 * 
 * @property {string} email - User's primary contact and identification email
 *   @required Must be unique across the system
 *   @index Unique database index for efficient lookups
 *   @example "alice.smith@company.com"
 * 
 * @property {string} password - Securely hashed user password
 *   @required Must be present for authentication
 *   @security Hashed using bcrypt with salt rounds
 *   @excluded Never returned in API responses (toJSON transformation)
 * 
 * @property {string} socketId - WebSocket connection identifier for real-time features
 *   @description
 *   - Stores the current Socket.IO connection ID
 *   - Enables real-time messaging and notifications
 *   - May be null when user is not connected via WebSocket
 *   - Updated on connection/disconnection events
 *   @example "x8Vp2dL9kQz3mN7r"
 * 
 * @description
 * This interface represents the complete user entity as stored in the database.
 * It's the source of truth for user data structure throughout the application.
 * 
 * @implements
 * - Used by Mongoose schema definition in user.model.ts
 * - Extended by IUserMethods for instance methods
 * - Referenced by UserModel for static methods
 * 
 * @note
 * - Additional fields like _id, createdAt, updatedAt are added by Mongoose
 * - The socketId field enables real-time features but is optional for core auth
 * 
 * @see {@link ../models/user.model.ts} - Mongoose schema implementation
 * @see {@link ../dto/registerUser.dto.ts} - Registration DTO (similar structure)
 */
export default interface IUser {
  fullName: {
    firstName: string,
    lastName?: string
  },
  email: string,
  password: string,
  socketId: string
}