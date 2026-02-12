import type RegisterCaptainDto from "../dto/registerCaptain.dto.js";
import captainModel from "../models/captain.model.js";
import type { CaptainDocument } from "../models/captain.model.js";
import { Conflict, ValidationProblem } from "../utils/AppError.js";

/**
 * @description Create a new captain
 * @param {RegisterCaptainDto} registerCaptainDto - Captain registration data
 * @returns {Promise<CaptainDocument>} Created captain document
 * @throws {ValidationProblem} If DTO is invalid or missing required fields
 * @throws {Conflict} If captain with same email already exists
 */
const createCaptain = async (registerCaptainDto: RegisterCaptainDto) => {
    // Primary validation - ensure DTO exists and has required fields
    if (!registerCaptainDto) {
        throw new ValidationProblem()
    } else if (!registerCaptainDto.email ||
        !registerCaptainDto.fullName.firstName ||
        !registerCaptainDto.password
    ) {
        throw new ValidationProblem()
    }

    // Business rule: Email must be unique
    // Check for existing user with same email
    if (await captainModel.findOne({ email: registerCaptainDto.email })) {
        throw new Conflict("Captain already exists")
    }

    // Prepare user object with conditional lastName inclusion
    const captain: CaptainDocument = await captainModel.create({
        fullName: {
            firstName: registerCaptainDto.fullName.firstName,
            // Only include lastName if provided (undefined won't be included)
            ...(registerCaptainDto.fullName.lastName
                ? { lastName: registerCaptainDto.fullName.lastName }
                : {}),
        },
        email: registerCaptainDto.email,
        password: registerCaptainDto.password,
        vehicle: {
            color: registerCaptainDto.vehicle.color,
            licensePlate: registerCaptainDto.vehicle.licensePlate,
            capacity: registerCaptainDto.vehicle.capacity,
            type: registerCaptainDto.vehicle.type,
        },
    })

    return captain
}

export default { createCaptain }