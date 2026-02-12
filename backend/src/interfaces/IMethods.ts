/**
 * User instance methods interface
 * @interface IMethods
 * @description Defines methods available on document instances
 */
export default interface IMethods {
    /**
     * Generates JWT authentication token for the user
     * @method generateAuthToken
     * @returns {string} Signed JWT token containing user ID
     * @throws {Error} If JWT_SECRET environment variable is not defined
     * @security Uses HS256 algorithm with environment secret
     */
    generateAuthToken: () => string

    /**
     * Compares provided password with stored hash
     * @method comparePassword
     * @param {string} password - Plain text password to verify
     * @returns {Promise<boolean>} True if password matches, false otherwise
     * @security Uses timing-safe bcrypt comparison
     */
    comparePassword: (password: string) => Promise<boolean>
}