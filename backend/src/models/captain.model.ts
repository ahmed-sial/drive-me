import mongoose, { model, Model, type HydratedDocument } from "mongoose";
import type ICaptain from "../interfaces/ICaptain.js";
import type IMethods from "../interfaces/IMethods.js";
import type IGenericModel from "../interfaces/IGenericModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
/** 
 * @description
 * Captain schema for captain type
 * @extends IUser
 * @property {string} status - Captain's status (e.g., "available", "busy")
 * @property {object} vehicle - Captain's vehicle information
 * @property {string} vehicle.color - Vehicle color
 * @property {string} vehicle.licensePlate - Vehicle license plate
 * @property {number} vehicle.capacity - Vehicle capacity
 * @property {string} vehicle.type - Vehicle type
 * @property {object} location - Captain's current location
 * @property {number} location.latitude - Latitude coordinate
 * @property {number} location.longitude - Longitude coordinate
 * @example
 * // Captain object
 * {
 *   "_id": "60d5ec49f9f1c2a3b4c5d6e7",
 *   "name": "John Doe",
 *   "email": "[EMAIL_ADDRESS]",
 *   "phone": "1234567890",
 *   "role": "captain",
 *   "status": "available",
 *   "vehicle": {
 *     "color": "white",
 *     "licensePlate": "ABC-123",
 *     "capacity": 4,
 *     "type": "sedan"
 *   },
 *   "location": {
 *     "latitude": 34.0522,
 *     "longitude": -118.2437
 *   }
 * }
 */
const captainSchema = new mongoose.Schema<ICaptain, IGenericModel<ICaptain, {}, IMethods>, IMethods>({
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
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive"
    },
    vehicle: {
        color: {
            type: String,
            required: true,
            min: [3, "Color must be at least 3 characters long"],
            trim: true,
        },
        licensePlate: {
            type: String,
            required: true,
            min: [3, "License plate must be at least 3 characters long"],
            trim: true,
        },
        capacity: {
            type: Number,
            min: [2, "Capacity of vehicle must be at least 2"],
            required: true
        },
        type: {
            type: String,
            enum: ["car", "bike"],
            required: true,
            trim: true,
        }
    },
    location: {
        longitude: {
            type: Number,
        },
        latitude: {
            type: Number,
        },
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
captainSchema.set("toJSON", {
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
captainSchema.set("toObject", {
    transform: (_, ret: any) => {
        delete ret.password,
            delete ret.__v
        return ret
    }
})

/**
 * Instance method: Generate JWT authentication token
 * @method generateAuthToken
 * @memberof captainSchema.methods
 * @returns {string} Signed JWT token with captain's MongoDB _id as payload
 * 
 * @process
 * 1. Validates JWT_SECRET environment variable exists
 * 2. Signs token with captain's MongoDB _id as payload
 * 3. Returns token for cookie/header storage
 * 
 * @security
 * - Token signed with HS256 algorithm
 * - Secret loaded from environment variables
 * - No expiration set (consider adding for production)
 * 
 * @example
 * const token = captain.generateAuthToken();
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
captainSchema.methods.generateAuthToken = function () {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT key is not defined. Please ensure it is defined in the environment variables.")
    }
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "24h" })
    return token
}

/**
 * Instance method: Verify captain password
 * @method comparePassword
 * @memberof captainSchema.methods
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
captainSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
}

/**
 * Static method: Hash password with bcrypt
 * @static hashPassword
 * @memberof captainSchema.statics
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
 * - Captain registration
 * - Password reset
 * - Manual password updates
 */
captainSchema.statics.hashPassword = async function (password: string) {
    return await bcrypt.hash(password, 10)
}

/**
 * Mongoose Captain Model
 * @constant captainModel
 * @type {Model<ICaptain, CaptainModel>}
 * @description Compiled Mongoose model ready for database operations
 * 
 * @collection "captains" - MongoDB collection name (pluralized from "captain")
 * 
 * @usage
 * ```typescript
 * import captainModel from "./captain.model.js";
 * const newCaptain = await captainModel.create(captainData);
 * const foundCaptain = await captainModel.findOne({ email });
 * ```
 */
const captainModel = model<ICaptain, IGenericModel<ICaptain, {}, IMethods>>("captain", captainSchema)

/**
 * Captain Document type for TypeScript
 * @typedef {HydratedDocument<ICaptain, IMethods>} CaptainDocument
 * @description TypeScript type representing a hydrated Mongoose document
 * with both ICaptain properties and IMethods instance methods
 */
export type CaptainDocument = HydratedDocument<ICaptain, IMethods>;

export default captainModel