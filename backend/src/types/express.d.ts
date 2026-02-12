/**
 * @file express.d.ts
 * @description TypeScript declaration merging for Express.js types
 * @module Types/ExpressExtensions
 * @version 1.0.0
 * 
 * This file extends the Express namespace with custom response methods
 * added by the response middleware. It provides TypeScript type definitions
 * for the enhanced Response object, enabling full type safety and IDE
 * autocompletion for custom response methods.
 */

import 'express';
import type IUser from '../interfaces/IUser.ts';

/**
 * Global Express namespace extensions
 * @namespace Express
 * @description Extends the built-in Express types with custom properties
 * 
 * This declaration merging adds custom response methods to the Express
 * Response interface. These methods are injected by response.middleware.ts
 * at runtime and provide standardized response formatting.
 * 
 * @note
 * Declaration merging only affects TypeScript type checking.
 * The actual implementation is in response.middleware.ts.
 */
declare global {
  namespace Express {
    /**
     * Extended Response interface with custom helper methods
     * @interface Response
     * @extends {Response} Original Express Response interface
     * 
     * This interface adds three helper methods to the standard
     * Express Response object for consistent API responses.
     */
    interface Response {
      /**
       * Standard success response (HTTP 200)
       * @method ok
       * @template T - Type of response data
       * @param {T} data - Response payload (object, array, or primitive)
       * @param {string} [message] - Optional success message
       * @returns {Response} Chainable response object
       * 
       * @example
       * res.ok(user, "User retrieved successfully");
       */
      ok: <T>(data: T, message?: string) => Response;

      /**
       * Resource creation success response (HTTP 201)
       * @method created
       * @template T - Type of created resource
       * @param {T} data - Newly created resource
       * @param {string} [message] - Optional creation message
       * @returns {Response} Chainable response object
       * 
       * @example
       * res.created(newUser, "User created successfully");
       */
      created: <T>(data: T, message?: string) => Response;

      /**
       * No content success response (HTTP 204)
       * @method noContent
       * @param {string} [message] - Optional informational message
       * @returns {Response} Chainable response object
       * 
       * @note
       * Returns HTTP 204 but includes JSON body for consistency
       * Some HTTP clients may ignore body for 204 responses
       * 
       * @example
       * res.noContent("Cache cleared successfully");
       */
      noContent: (message?: string) => Response;
    }

    interface Request {
      user: IUser
    }
  }
}