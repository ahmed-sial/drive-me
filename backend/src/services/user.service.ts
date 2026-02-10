/**
 * @file user.service.ts
 * @description Service layer for user-related business logic and data operations
 * @module Services/UserService
 * @version 1.0.0
 * 
 * This service encapsulates the business logic for user operations,
 * separating concerns from controllers and models. It handles:
 * - User creation with validation and duplicate checking
 * - Business rule enforcement
 * - Data transformation before persistence
 * 
 * Services follow the Single Responsibility Principle and can be
 * easily tested and mocked for unit testing.
 */

import type RegisterUserDto from "../dto/registerUser.dto.js";
import userModel, { type UserDocument } from "../models/user.model.js";
import { Conflict, ValidationProblem } from "../utils/AppError.js";

/**
 * Creates a new user in the system
 * @async
 * @function createUser
 * @param {RegisterUserDto} registerUserDto - User registration data
 * @returns {Promise<UserDocument>} Newly created user document
 * @throws {ValidationProblem} 400 - When:
 *   - registerUserDto is null/undefined
 *   - Required fields (email, firstName, password) are missing
 * @throws {Conflict} 409 - When user with provided email already exists
 * 
 * @description
 * User creation service that orchestrates:
 * 1. Input validation
 * 2. Duplicate email checking
 * 3. Data preparation for persistence
 * 4. Database creation
 * 
 * @process
 * 1. Validate required fields exist
 * 2. Check for existing user with same email
 * 3. Prepare user object with conditional lastName
 * 4. Create user in database via userModel.create()
 * 5. Return created user document
 * 
 * @businessLogic
 * - Email must be unique across all users
 * - lastName is optional and only included if provided
 * - Password is already hashed by controller before reaching service
 * - Returns full user document (excluding password via schema transform)
 * 
 * @note
 * - This service assumes password is already hashed (done in controller)
 * - Email uniqueness check uses findOne() which may have race conditions
 *   in high-concurrency scenarios (consider database-level constraints)
 * 
 * @example
 * const user = await userService.createUser({
 *   email: "test@example.com",
 *   fullName: { firstName: "Test", lastName: "User" },
 *   password: "hashedPassword123"
 * });
 */
const createUser = async (registerUserDto: RegisterUserDto) => {
  // Primary validation - ensure DTO exists and has required fields
  if (!registerUserDto) {
    throw new ValidationProblem()
  } else if (!registerUserDto.email ||
    !registerUserDto.fullName.firstName ||
    !registerUserDto.password
  ) {
    throw new ValidationProblem()
  }

  // Business rule: Email must be unique
  // Check for existing user with same email
  if (await userModel.findOne({ email: registerUserDto.email })) {
    throw new Conflict("User already exists")
  }

  // Prepare user object with conditional lastName inclusion
  const user: UserDocument = await userModel.create({
    fullName: {
      firstName: registerUserDto.fullName.firstName,
      // Only include lastName if provided (undefined won't be included)
      ...(registerUserDto.fullName.lastName
        ? { lastName: registerUserDto.fullName.lastName }
        : {}),
    },
    email: registerUserDto.email,
    password: registerUserDto.password
  })

  return user
}

/**
 * @exports User service methods
 * @property {Function} createUser - User creation service method
 * 
 * @description
 * Service object exposing available user service methods.
 * Follows the pattern of returning an object with methods
 * for easy mocking and testing.
 */
export default { createUser }