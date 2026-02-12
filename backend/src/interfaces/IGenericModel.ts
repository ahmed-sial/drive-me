import { Model } from "mongoose";

/**
 * Generic model static methods interface
 * @interface GenericModel
 * @extends {Model<T, U, K>} where T is the document type, U is the query type, and K is the model type
 * @description Extends Mongoose Model with static methods
 */
export default interface IGenericModel<T, U, K> extends Model<T, U, K> {
    /**
     * Hashes a plain text password using bcrypt
     * @static
     * @method hashPassword
     * @param {string} password - Plain text password to hash
     * @returns {Promise<string>} Hashed password with salt
     * @security Uses 10 salt rounds (configurable for performance/security balance)
     */
    hashPassword: (password: string) => Promise<string>
}