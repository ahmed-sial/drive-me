import type IUser from "./IUser.js";
/**
 * @interface ICaptain
 * @description
 * Interface for captain user type
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
 * // Captain user object
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
export default interface ICaptain extends IUser {
    status: string;
    vehicle: {
        color: string;
        licensePlate: string;
        capacity: number;
        type: string;
    };
    location: {
        latitude: number;
        longitude: number;
    };
}