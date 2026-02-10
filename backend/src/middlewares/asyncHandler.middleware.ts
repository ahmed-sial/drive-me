import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Express Async Error Wrapper Middleware
 * ------------------------------------------------------------
 * Safely wraps async Express handlers to automatically forward promise rejections
 * to Express's error handling middleware chain.
 * 
 * Without this wrapper, uncaught promise rejections in async handlers would
 * crash the Node.js process (when no catch handler is attached) or silently fail.
 * 
 * Design Principle
 * - Transparent wrapper - doesn't modify function behavior
 * - Zero boilerplate - eliminates try/catch blocks in controllers
 * - Maintains Express error flow - uses `next(error)` for propagation
 * 
 * @example Basic Usage
 * ```typescript
 * // Controller without try/catch
 * export const getUser = asyncHandler(async (req, res) => {
 *   const user = await User.findById(req.params.id);
 *   if (!user) throw new NotFound("User not found");
 *   res.json(user);
 * });
 * ```
 * 
 * @example Equivalent Manual Implementation
 * ```typescript
 * // What asyncHandler automates:
 * export const getUser = (req, res, next) => {
 *   User.findById(req.params.id)
 *     .then(user => {
 *       if (!user) throw new NotFound("User not found");
 *       res.json(user);
 *     })
 *     .catch(next); // ← This is what asyncHandler provides
 * };
 * ```
 * 
 * @param fn - Async Express handler function to wrap
 * @returns Synchronous Express handler that safely manages async execution
 * 
 * @throws Propagates any thrown error or promise rejection to `next(error)`
 * 
 * @important This middleware MUST be applied to ALL async route handlers.
 * Unwrapped async handlers will bypass Express error middleware.
 */
export const asyncHandler = (
  fn: RequestHandler
): RequestHandler => {
  /**
   * Wrapped synchronous handler that manages the promise chain.
   * 
   * Implementation Notes:
   * 1. `Promise.resolve()` handles both promise returns and non-promise returns
   * 2. `.catch(next)` ensures ALL rejections flow to error middleware
   * 3. Return value is ignored (Express handles response in `fn`)
   * 
   * @internal
   */
  return (req: Request, res: Response, next: NextFunction) => {
    // Convert any return value to promise for consistent handling
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};