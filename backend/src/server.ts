import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import mongoose from "mongoose";
import connectToDatabase from "./db/db.js";
import logger from "./logger/pino.logger.js";

/**
 * Server Bootstrap & Process Management
 * ------------------------------------------------------------
 * Entry point for the Node.js application responsible for:
 * 1. Environment validation and configuration
 * 2. Database connection establishment
 * 3. HTTP server initialization
 * 4. Graceful shutdown management
 * 5. Process signal handling
 * 
 * This file orchestrates the complete application lifecycle from
 * startup through graceful termination.
 * 
 * @architecture
 * - Separation of concerns: Bootstrap vs application logic
 * - Fail-fast: Validate prerequisites before starting
 * - Production-ready: Graceful shutdown handlers
 * 
 * @flow
 * 1. Load environment variables
 * 2. Validate required configuration
 * 3. Connect to database
 * 4. Start HTTP server
 * 5. Register shutdown handlers
 * 6. Handle uncaught errors
 */
const PORT = process.env.PORT || 5000;

/**
 * Environment Configuration Validator
 * ------------------------------------------------------------
 * Ensures all required environment variables are present before startup.
 * 
 * Why validate early:
 * - Prevents runtime errors from missing configuration
 * - Provides clear error messages for deployment issues
 * - Reduces debugging time for configuration problems
 * 
 * @throws {Error} With descriptive message for missing variables
 * 
 * @example Required Variables
 * ```bash
 * MONGO_URI=mongodb://user:pass@localhost:27017/dbname
 * NODE_ENV=production
 * PORT=3000
 * JWT_SECRET=your-secret-key
 * ```
 */
const validateEnvironment = () => {
  const required = ["MONGO_URI", "NODE_ENV"];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file or deployment configuration.`
    );
  }
};

/**
 * Application Bootstrap Sequence
 * ------------------------------------------------------------
 * Orchestrates the complete startup sequence with proper error handling.
 * 
 * @sequence
 * 1. Validate environment configuration
 * 2. Establish database connection
 * 3. Start HTTP server
 * 4. Register graceful shutdown handlers
 * 5. Setup global error handlers
 * 
 * @error-handling
 * - Bootstrap errors → Log and exit with code 1
 * - Runtime errors → Graceful shutdown handlers
 * 
 * @example Manual Testing
 * ```bash
 * # Start server directly
 * NODE_ENV=development MONGO_URI=... node dist/server.js
 * 
 * # With debug logging
 * DEBUG=express:* NODE_ENV=development node dist/server.js
 * ```
 */
const startServer = async () => {
  try {
    // Phase 1: Configuration Validation
    validateEnvironment();

    // Phase 2: Database Connection
    await connectToDatabase();

    // Phase 3: HTTP Server Initialization
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);

      // Log additional startup information
      logger.info({
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
      }, 'Application started successfully');
    });

    /**
     * Graceful Shutdown Handler
     * ------------------------------------------------------------
     * Ensures clean termination on process signals.
     * 
     * @param signal - POSIX signal received (SIGINT, SIGTERM)
     * 
     * @sequence
     * 1. Stop accepting new connections
     * 2. Close existing connections (with timeout)
     * 3. Close database connections
     * 4. Exit process with appropriate code
     * 
     * @timeout 10 seconds for graceful shutdown
     * @production Critical for zero-downtime deployments
     */
    const shutdown = async (signal: string) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);

      // Step 1: Stop accepting new connections
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Step 2: Force shutdown after timeout
      const forceShutdown = setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1); // Exit with error code
      }, 10000); // 10 seconds timeout

      // Step 3: Close database connection
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
        clearTimeout(forceShutdown);
        process.exit(0); // Clean exit
      } catch (err) {
        logger.error('Error closing MongoDB connection!');
        process.exit(1); // Exit with error code
      }
    };

    /**
     * Process Signal Handlers
     * ------------------------------------------------------------
     * Handle termination signals from the operating system.
     * 
     * @signal SIGINT - Ctrl+C from terminal
     * @signal SIGTERM - Kubernetes/process manager termination request
     */
    process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C
    process.on("SIGTERM", () => shutdown("SIGTERM")); // Container termination

    /**
     * Global Unhandled Promise Rejection Handler
     * ------------------------------------------------------------
     * Safety net for promises without catch handlers.
     * 
     * @critical Prevents Node.js 15+ from terminating the process
     * @production Should be monitored and addressed as bugs
     */
    process.on("unhandledRejection", async (err: any) => {
      logger.error({
        event: 'unhandled_rejection',
        error: err.message,
        stack: err.stack
      }, 'Unhandled Promise Rejection');

      await mongoose.connection.close();
      process.exit(1);
    });

    /**
     * Global Uncaught Exception Handler
     * ------------------------------------------------------------
     * Catch-all for synchronous errors outside Express.
     * 
     * @warning Application may be in undefined state
     * @security Immediate shutdown prevents data corruption
     */
    process.on("uncaughtException", async (err: any) => {
      logger.error({
        event: 'uncaught_exception',
        error: err.message,
        stack: err.stack
      }, 'Uncaught Exception');

      await mongoose.connection.close();
      process.exit(1);
    });

  } catch (err) {
    /**
     * Bootstrap Failure Handler
     * ------------------------------------------------------------
     * Catches errors during initial startup sequence.
     * 
     * Common causes:
     * - Invalid database credentials
     * - Port already in use
     * - Missing environment variables
     * - Network connectivity issues
     */
    logger.fatal({
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    }, 'Failed to start application');

    process.exit(1); // Exit with failure code
  }
};

/**
 * Application Entry Point
 * ------------------------------------------------------------
 * Start the server and handle any top-level exceptions.
 * 
 * @note Using IIFE for proper async/await at top level
 * @alternative Could use top-level await with ES modules
 */
startServer();