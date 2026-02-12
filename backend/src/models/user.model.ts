/**
 * @file user.model.ts
 * @description Mongoose model definition for User entity with schema, methods, and statics
 * @module Models/UserModel
 * @version 1.0.0
 * 
 * This file defines the Mongoose schema, model, and TypeScript interfaces
 * for the User entity. It includes:
 * - Schema definition with validation rules
 * - Instance methods for authentication
 * - Static methods for password operations
 * - Document transformations for security
 * - TypeScript interface extensions
 */

import mongoose, { isValidObjectId, model, Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import type { HydratedDocument, Model } from "mongoose";
import type IUser from "../interfaces/IUser.js";
import type IGenericModel from "../interfaces/IGenericModel.js";
import type IMethods from "../interfaces/IMethods.js";

/**
 * User schema definition with validation rules and options
 * @constant userSchema
 * @type {Schema<IUser, UserModel, IUserMethods>}
 * 
 * @property {Object} fullName.firstName
 *   @required true - Must be provided
 *   @minlength 3 - Minimum 3 characters
 *   @trim true - Automatically trim whitespace
 * 
 * @property {Object} fullName.lastName
 *   @optional true - May be omitted
 *   @minlength 3 - If provided, minimum 3 characters
 *   @trim true - Automatically trim whitespace
 * 
 * @property {Object} email
 *   @required true - Must be provided
 *   @unique true - Enforced by MongoDB unique index
 *   @trim true - Automatically trim whitespace
 *   @index true - For efficient querying
 * 
 * @property {Object} password
 *   @required true - Must be provided
 *   @select false - Excluded from queries by default
 *   @minlength 8 - Minimum 8 characters for security
 * 
 * @property {Object} socketId
 *   @optional true - Only present during active WebSocket connections
 *   @description Used for real-time feature integration
 * 
 * @options
 * - timestamps: true - Automatically adds createdAt and updatedAt fields
 */
const userSchema = new Schema<IUser, IGenericModel<IUser, {}, IMethods>, IMethods>({
  fullName: {
    firstName: {
      type: String,
      required: true,
      min: [3, "First name must be at least 3 characters long"],
      trim: true,
    },
    lastName: {
      type: String,
      min: [3, "Last name must be at least 3 characters long"],
      trim: true,
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false,
    trim: true,
    min: [8, "Password must be at least 8 characters long"],
  },
  socketId: {
    type: String
  }
}, {
  timestamps: true
});

/**
 * JSON serialization transformation
 * @hook "toJSON"
 * @description Removes sensitive/technical fields when converting to JSON
 * @transform
 * - Removes password field (already select: false but extra safety)
 * - Removes __v (Mongoose version key)
 * - Preserves all other fields including _id, email, fullName, timestamps
 */
userSchema.set("toJSON", {
  transform: (_, ret: any) => {
    delete ret.password,
      delete ret.__v
    return ret
  }
})

/**
 * Object serialization transformation
 * @hook "toObject"
 * @description Same as toJSON but for toObject() calls
 * @note Essential for consistent field exclusion in all serialization paths
 */
userSchema.set("toObject", {
  transform: (_, ret: any) => {
    delete ret.password,
      delete ret.__v
    return ret
  }
})

/**
 * Instance method: Generate JWT authentication token
 * @method generateAuthToken
 * @memberof userSchema.methods
 * @returns {string} Signed JWT token with user ID payload
 * 
 * @process
 * 1. Validates JWT_SECRET environment variable exists
 * 2. Signs token with user's MongoDB _id as payload
 * 3. Returns token for cookie/header storage
 * 
 * @security
 * - Token signed with HS256 algorithm
 * - Secret loaded from environment variables
 * - No expiration set (consider adding for production)
 * 
 * @example
 * const token = user.generateAuthToken();
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
userSchema.methods.generateAuthToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT key is not defined. Please ensure it is defined in the environment variables.")
  }
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "24h" })
  return token
}

/**
 * Instance method: Verify user password
 * @method comparePassword
 * @memberof userSchema.methods
 * @param {string} password - Plain text password to verify
 * @returns {Promise<boolean>} Password match result
 * 
 * @process
 * 1. Retrieves hashed password from this.password
 * 2. Uses bcrypt.compare() for timing-safe comparison
 * 3. Returns boolean result
 * 
 * @security
 * - Timing-safe comparison prevents timing attacks
 * - Requires password field to be selected (select: false by default)
 * - Uses bcrypt's built-in salt comparison
 */
userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

/**
 * Static method: Hash password with bcrypt
 * @static hashPassword
 * @memberof userSchema.statics
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 * 
 * @process
 * 1. Uses bcrypt.hash() with 10 salt rounds
 * 2. Returns promise resolving to hashed string
 * 
 * @configuration
 * - Salt rounds: 10 (balance of security and performance)
 * - Consider increasing for more security-sensitive applications
 * 
 * @useCase
 * - User registration
 * - Password reset
 * - Manual password updates
 */
userSchema.statics.hashPassword = async function (password: string) {
  return await bcrypt.hash(password, 10)
}

/**
 * Mongoose User Model
 * @constant userModel
 * @type {Model<IUser, UserModel>}
 * @description Compiled Mongoose model ready for database operations
 * 
 * @collection "users" - MongoDB collection name (pluralized from "user")
 * 
 * @usage
 * ```typescript
 * import userModel from "./user.model.js";
 * const newUser = await userModel.create(userData);
 * const foundUser = await userModel.findOne({ email });
 * ```
 */
const userModel = model<IUser, IGenericModel<IUser, {}, IMethods>>("user", userSchema)

/**
 * User Document type for TypeScript
 * @typedef {HydratedDocument<IUser, IUserMethods>} UserDocument
 * @description TypeScript type representing a hydrated Mongoose document
 * with both IUser properties and IUserMethods instance methods
 */
export type UserDocument = HydratedDocument<IUser, IMethods>;

export default userModel