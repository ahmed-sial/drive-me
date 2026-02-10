import mongoose from "mongoose";
import logger from "../logger/pino.logger.js";

/**
 * MongoDB Database Connection Manager
 * ------------------------------------------------------------
 * Establishes and manages the connection to MongoDB using Mongoose.
 * 
 * This module provides a centralized database connection utility that:
 * 1. Validates environment configuration before connection attempts
 * 2. Leverages Mongoose connection pooling and connection management
 * 3. Provides structured logging for connection lifecycle events
 * 4. Throws descriptive errors for configuration failures
 * 
 * @dependencies
 * - mongoose@^7.x - MongoDB ODM for schema validation and connection pooling
 * - pino logger - Structured logging for connection events
 * 
 * @environment
 * - MONGO_URI - MongoDB connection string (required)
 *   Format: mongodb://username:password@host:port/database?options
 * 
 * @example Basic Usage
 * ```typescript
 * // server.ts - Application bootstrap
 * import connectToDatabase from './config/db.js';
 * 
 * async function startServer() {
 *   try {
 *     await connectToDatabase();
 *     console.log('Database connected, starting server...');
 *     app.listen(3000);
 *   } catch (error) {
 *     console.error('Failed to start:', error);
 *     process.exit(1);
 *   }
 * }
 * ```
 * 
 * @example With Connection Options
 * ```typescript
 * // Advanced: Custom Mongoose connection configuration
 * await mongoose.connect(process.env.MONGO_URI, {
 *   maxPoolSize: 10,           // Maximum connections in pool
 *   serverSelectionTimeoutMS: 5000,
 *   socketTimeoutMS: 45000,
 * });
 * ```
 * 
 * @throws {Error} When MONGO_URI environment variable is not defined
 * @throws {MongooseError} When connection fails (authentication, network, etc.)
 * 
 * @performance
 * - Connection pooling is managed by Mongoose (default poolSize: 5)
 * - Consider increasing maxPoolSize for high-concurrency applications
 * - Monitor connection metrics in production
 */
export const connectToDatabase = async () => {
  /**
   * Environment Validation Phase
   * 
   * Pre-connection validation prevents runtime errors and provides
   * clear feedback during deployment/configuration.
   */
  if (!process.env.MONGO_URI) {
    // Detailed error helps diagnose configuration issues
    throw new Error(
      "Database connection string is not defined. " +
      "Please ensure MONGO_URI is set in your environment variables. " +
      "Expected format: mongodb://user:pass@host:port/dbname"
    );
  }

  /**
   * Connection Establishment Phase
   * 
   * Mongoose handles:
   * - DNS resolution and network connection
   * - Authentication and authorization
   * - Connection pool initialization
   * - Replica set discovery (if applicable)
   */
  logger.info("Connecting to database...");

  // mongoose.connect() returns a promise that resolves when:
  // 1. TCP connection is established
  // 2. Authentication succeeds (if credentials provided)
  // 3. Initial handshake with MongoDB server completes
  await mongoose.connect(process.env.MONGO_URI);

  /**
   * Post-Connection Phase
   * 
   * Connection is now ready for queries. The connection remains open
   * and is managed by Mongoose's connection pool.
   */
  logger.info("Connected to MongoDB.");

  /**
   * Optional: Event listeners for connection monitoring
   * Uncomment for production monitoring:
   * 
   * mongoose.connection.on('disconnected', () => {
   *   logger.warn('MongoDB disconnected');
   * });
   * 
   * mongoose.connection.on('reconnected', () => {
   *   logger.info('MongoDB reconnected');
   * });
   * 
   * mongoose.connection.on('error', (err) => {
   *   logger.error({ err }, 'MongoDB connection error');
   * });
   */
};

/**
 * Default export for convenient import
 * 
 * @example
 * import connectToDatabase from '/src/db/db.js';
 */
export default connectToDatabase;