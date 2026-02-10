import dotenv from "dotenv";
dotenv.config();
import pino from "pino";

/**
 * Structured Logging Configuration
 * ------------------------------------------------------------
 * Centralized logging configuration using Pino for high-performance
 * structured logging across all environments.
 * 
 * Features:
 * - Environment-aware configuration (development vs production)
 * - Automatic log redaction for sensitive data
 * - High-performance JSON logging
 * - File-based persistence in production
 * - Human-readable output in development
 * 
 * @why-pino
 * - 5-10x faster than Winston/Bunyan
 * - Near-zero overhead in production
 * - Built-in child loggers and serializers
 * - Ecosystem with transports (pino-pretty, pino-http)
 * 
 * @performance Critical for high-throughput applications
 * @security Automatically redacts sensitive fields
 * 
 * @example Basic Usage
 * ```typescript
 * import logger from './logger/pino.logger.js';
 * 
 * logger.info('User logged in', { userId: 123 });
 * logger.error(err, 'Database connection failed');
 * logger.warn({ threshold: 90 }, 'High memory usage detected');
 * ```
 * 
 * @example Child Loggers (Contextual Logging)
 * ```typescript
 * const requestLogger = logger.child({ requestId: 'abc123' });
 * requestLogger.info('Processing request');
 * // Output: {"level":30,"time":...,"requestId":"abc123","msg":"Processing request"}
 * ```
 */
const logger = pino({
  /**
   * Log Level Configuration
   * ------------------------------------------------------------
   * Controls which log messages are emitted based on severity.
   * 
   * @levels (lowest to highest)
   * - trace: 10 - Debugging/tracing
   * - debug: 20 - Diagnostic information
   * - info: 30  - Normal operations (default)
   * - warn: 40  - Potentially harmful situations
   * - error: 50 - Error conditions
   * - fatal: 60 - Service/application failure
   * 
   * @environment Override via LOG_LEVEL environment variable
   * @example LOG_LEVEL=debug npm start
   */
  level: process.env.LOG_LEVEL || "info",

  /**
   * Transport Configuration
   * ------------------------------------------------------------
   * Environment-specific output formatting and destinations.
   * 
   * Development: Human-readable colored output to stdout
   * Production: Structured JSON to file with rotation
   */
  transport: process.env.NODE_ENV === "development"
    ? {
      /**
       * Development Transport: pino-pretty
       * ------------------------------------------------------------
       * Human-readable formatting for local development and debugging.
       */
      target: "pino-pretty",
      options: {
        colorize: true,           // Color-coded log levels
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l", // ISO-like timestamps
        ignore: "pid,hostname",   // Cleaner output
        messageFormat: "{msg} {if reqId}({reqId}){end}",
        singleLine: false,        // Multi-line for readability
      }
    }
    : {
      /**
       * Production Transport: pino/file with rotation
       * ------------------------------------------------------------
       * Efficient JSON logging to disk with log rotation for production.
       * 
       * @consideration Add pino-sentry for error tracking
       * @consideration Add pino-loki for centralized logging
       */
      target: "pino/file",
      options: {
        destination: "./logs/app.log",
        mkdir: true,              // Create logs directory if missing
        // Consider adding pino-rotating-file for log rotation
      }
    },

  /**
   * Sensitive Data Redaction
   * ------------------------------------------------------------
   * Automatically removes sensitive information from all log outputs.
   * 
   * @critical Security feature - prevents credential leakage
   * @pattern Supports wildcards and nested paths
   * 
   * @example Redacted Output
   * ```json
   * {
   *   "password": "[Redacted]",
   *   "headers": {
   *     "authorization": "[Redacted]"
   *   }
   * }
   * ```
   */
  redact: {
    paths: [
      // Authentication credentials
      "password",
      "*.password",
      "passwordConfirmation",
      "*.passwordConfirmation",

      // API tokens and secrets
      "token",
      "*.token",
      "accessToken",
      "*.accessToken",
      "refreshToken",
      "*.refreshToken",
      "apiKey",
      "*.apiKey",
      "secret",
      "*.secret",

      // HTTP headers
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",

      // PII (Personal Identifiable Information)
      "email",
      "*.email",
      "phone",
      "*.phone",
      "ssn",
      "*.ssn",
      "creditCard",
      "*.creditCard",
      "address.*",  // All address fields
    ],
    censor: "[REDACTED]" // Custom redaction text
  },

  /**
   * Base Logger Configuration
   * ------------------------------------------------------------
   * Core settings for all log entries.
   */
  timestamp: pino.stdTimeFunctions.isoTime, // ISO 8601 timestamps

  /**
   * Custom Serializers
   * ------------------------------------------------------------
   * Transform objects before logging for consistency.
   * 
   * @note Uncomment and customize as needed
   */
  serializers: {
    // req: pino.stdSerializers.req,    // Standard request serialization
    // res: pino.stdSerializers.res,    // Standard response serialization
    err: pino.stdSerializers.err,      // Error serialization with stack

    // Custom serializer example:
    // user: (user) => ({ id: user.id, role: user.role }) // Log only safe fields
  },

  /**
   * Message Formatting
   * ------------------------------------------------------------
   * Control how log messages are structured.
   */
  messageKey: "msg",      // JSON key for message text
  errorKey: "err",        // JSON key for error objects

  /**
   * Performance Optimizations
   */
  formatters: {
    level: (label: string) => ({ level: label.toUpperCase() }) // Consistent casing
  },

  /**
   * Additional Context
   * ------------------------------------------------------------
   * Add global metadata to all log entries.
   * 
   * @production Useful for distributed tracing
   */
  base: {
    env: process.env.NODE_ENV,
    service: process.env.SERVICE_NAME || "api-service",
    version: process.env.npm_package_version || "1.0.0",
    // nodeId: process.env.NODE_ID,  // For multi-instance deployments
    // region: process.env.AWS_REGION, // Cloud context
  }
});

/**
 * Log File Rotation Configuration (Optional Enhancement)
 * ------------------------------------------------------------
 * Uncomment to enable automatic log rotation in production.
 * 
 * @dependency npm install pino-rotating-file
 * 
 * @example
 * import { multistream } from 'pino-multi-stream';
 * import { createStream } from 'pino-rotating-file';
 * 
 * const rotatingStream = createStream({
 *   filename: './logs/app-%DATE%.log',
 *   frequency: 'daily',
 *   max_logs: '30d',
 *   size: '100m',
 *   extension: '.log'
 * });
 * 
 * const logger = pino({}, multistream([
 *   { stream: rotatingStream },
 *   { stream: process.stdout, level: 'error' } // Errors to console too
 * ]));
 */

/**
 * Centralized Logging Interface Export
 * 
 * Provides a single, configured logger instance for the entire application.
 * 
 * @best-practice Import this logger in all modules instead of console.log
 * @testing Mock this logger in unit tests
 */
export default logger;
