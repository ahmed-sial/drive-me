import { Router } from "express";
import captainController from "../controllers/captainAuth.controller.js";
import { body } from "express-validator"

const router = Router();

/**
 * @route POST /api/v1/captain/register
 * @description Register a new captain
 * @access Public
 * @requestBody
 * @property {string} fullName.firstName - Captain's first name
 * @property {string} fullName.lastName - Captain's last name
 * @property {string} email - Captain's email
 * @property {string} password - Captain's password
 * @property {string} vehicle.color - Captain's vehicle color
 * @property {string} vehicle.licensePlate - Captain's vehicle license plate
 * @property {number} vehicle.capacity - Captain's vehicle capacity
 * @property {string} vehicle.type - Captain's vehicle type
 */
router.post("/register",
    [
        body("fullName.firstName")
            .exists()
            .withMessage("First name is required")
            .isString()
            .withMessage("First name must be a string")
            .isLength({ min: 3 })
            .withMessage("First name must be at least 3 characters long"),
        body("fullName.lastName")
            .if(body("fullName.lastName").exists())
            .isString()
            .withMessage("Last name must be a string")
            .isLength({ min: 3 })
            .withMessage("Last name must be at least 3 characters long"),
        body("email")
            .exists()
            .withMessage("Email is required")
            .isString()
            .withMessage("Email must be a string")
            .isEmail()
            .withMessage("Invalid email address"),
        body("password")
            .exists()
            .withMessage("Password is required")
            .isString()
            .withMessage("Password must be a string")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),
        body("vehicle.color")
            .exists()
            .withMessage("Vehicle color is required")
            .isString()
            .withMessage("Vehicle color must be a string")
            .isLength({ min: 3 })
            .withMessage("Vehicle color must be at least 3 characters long"),
        body("vehicle.licensePlate")
            .exists()
            .withMessage("Vehicle license plate is required")
            .isString()
            .withMessage("Vehicle license plate must be a string")
            .isLength({ min: 3 })
            .withMessage("Vehicle license plate must be at least 3 characters long"),
        body("vehicle.capacity")
            .exists()
            .withMessage("Vehicle capacity is required")
            .isNumeric()
            .withMessage("Vehicle capacity must be a number")
            .custom((value) => value >= 2 && value <= 6)
            .withMessage("Vehicle capacity must be between 2 and 6"),
        body("vehicle.type")
            .exists()
            .withMessage("Vehicle type is required")
            .isString()
            .withMessage("Vehicle type must be a string")
            .isLength({ min: 3 })
            .withMessage("Vehicle type must be at least 3 characters long"),
    ],
    captainController.register);

/**
 * @route POST /api/v1/captain/login
 * @description Login a captain
 * @access Public
 * @requestBody
 * @property {string} email - Captain's email
 * @property {string} password - Captain's password
 */
router.post("/login",
    [
        body("email")
            .exists()
            .withMessage("Email is required")
            .isString()
            .withMessage("Email must be a string")
            .isEmail()
            .withMessage("Invalid email address"),
        body("password")
            .exists()
            .withMessage("Password is required")
            .isString()
            .withMessage("Password must be a string")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),
    ],
    captainController.login);

/**
 * @route POST /api/v1/captain/logout
 * @description Logout a captain
 * @access Public
 */
router.post("/logout", captainController.logout);

export default router;