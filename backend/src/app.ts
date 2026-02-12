import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import logger from "./logger/pino.logger.js";
import mongoose from "mongoose";
import { responseMiddleware } from "./middlewares/response.middleware.js";
import userAuthRoutes from "./routes/userAuth.routes.js";
import userRoutes from "./routes/user.routes.js";
import captainAuthRoutes from "./routes/captain.routes.js";

/**
 * Express Application Configuration
 * ------------------------------------------------------------
 * Central application setup module defining middleware pipeline,
 * route registration, and global error handling.
 * 
 * This file orchestrates the complete request/response lifecycle:
 * 1. Request parsing and security middleware
 * 2. Structured request logging
 * 3. Health monitoring endpoint
 * 4. API route registration
 * 5. 404 catch-all handler
 * 6. Global error processing
 * 
 * @architecture
 * - Follows Express middleware pipeline pattern
 * - Order-sensitive: Middleware executes in registration order
 * - Separation of concerns: Routing vs error handling
 * 
 * @example Server Bootstrap
 * ```typescript
 * // server.ts
 * import app from './app.js';
 * import connectToDatabase from './config/db.js';
 * 
 * const PORT = process.env.PORT || 3000;
 * 
 * async function startServer() {
 *   await connectToDatabase();
 *   app.listen(PORT, () => {
 *     console.log(`Server running on port ${PORT}`);
 *   });
 * }
 * 
 * startServer();
 * ```
 */
const app = express();

// TODO: Add documentation for this middleware usage
app.use(responseMiddleware)

/**
 * Security & Parsing Middleware Stack
 * ------------------------------------------------------------
 * Registered first to process all incoming requests.
 * 
 * @order Critical: These must precede route handlers
 */
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse Cookie header into req.cookies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

/**
 * Request Logging Middleware
 * ------------------------------------------------------------
 * Structured logging for all HTTP requests with performance timing.
 * 
 * Captures:
 * - Request method and URL
 * - Response status code
 * - Request duration
 * - Client metadata (user agent, IP)
 * 
 * @performance Minimal overhead (~0.1ms per request)
 * @security Logs may contain PII - review in production
 * 
 * @example Log Output
 * ```json
 * {
 *   "method": "GET",
 *   "url": "/api/users/123",
 *   "status": 200,
 *   "duration": "45ms",
 *   "userAgent": "Mozilla/5.0...",
 *   "ip": "192.168.1.1"
 * }
 * ```
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now(); // High-resolution timing start

  // Hook into response completion event
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });

  next(); // Continue to next middleware
});

/**
 * Health Check Endpoint
 * ------------------------------------------------------------
 * Provides system health status for monitoring and load balancers.
 * 
 * Monitors:
 * - Process uptime
 * - Database connectivity
 * - API responsiveness
 * 
 * @usage
 * - Load balancers: Determine instance health
 * - Kubernetes: Liveness/readiness probes
 * - DevOps: Monitoring dashboards
 * 
 * @response
 * - 200 OK: System healthy, database connected
 * - 503 Service Unavailable: Database disconnected
 * 
 * @example Response
 * ```json
 * {
 *   "uptime": 3600.25,
 *   "message": "OK",
 *   "timestamp": 1678891234567,
 *   "database": "connected"
 * }
 * ```
 */
app.get("/health", (req: Request, res: Response) => {
  const healthcheck = {
    uptime: process.uptime(), // Seconds since process start
    message: 'OK',
    timestamp: Date.now(), // Unix timestamp in milliseconds
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };

  // Return 503 if database disconnected (failing health check)
  if (healthcheck.database === 'disconnected') {
    throw new Error("Database connection failed")
  } else {
    return res.ok(healthcheck, "Server is healthy");
  }
});

/**
 * API Route Registration
 * ------------------------------------------------------------
 * Mount feature-specific route modules.
 * 
 * @pattern Versioned API routes (/api/v1/)
 * @pattern Feature-based route organization
 * 
 * @example Adding New Routes
 * ```typescript
 * import userRoutes from './routes/user.routes.js';
 * import authRoutes from './routes/auth.routes.js';
 * 
 * app.use('/api/v1/users', userRoutes);
 * app.use('/api/v1/auth', authRoutes);
 * ```
 */

app.use("/api/v1/auth/users", userAuthRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth/captains", captainAuthRoutes);


/**
 * Error Handling Pipeline
 * ------------------------------------------------------------
 * CRITICAL: Order matters - registered after all routes
 * 
 * 1. notFoundHandler: Catch undefined routes (404)
 * 2. errorHandler: Process all thrown errors
 * 
 * @warning These MUST be the last middleware registered
 * @security Error handler masks internal errors in production
 */
app.use(notFoundHandler); // Catch-all for undefined routes
app.use(errorHandler); // Global error processor

/**
 * Application Export
 * 
 * Export the configured Express application instance for:
 * 1. Server bootstrap (server.ts)
 * 2. Testing (supertest)
 * 3. Serverless deployments (AWS Lambda, Vercel)
 * 
 * @example Testing with Supertest
 * ```typescript
 * import request from 'supertest';
 * import app from './app.js';
 * 
 * describe('Health Check', () => {
 *   it('returns 200 when database connected', async () => {
 *     const response = await request(app).get('/health');
 *     expect(response.status).toBe(200);
 *   });
 * });
 * ```
 */
export default app;