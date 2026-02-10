import type { ValidationError } from "express-validator";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

/**
* Structured metadata describing a specific client input failure.
*
* This object is intended for frontend form mapping and machine parsing.
* The backend MUST keep this schema stable because it is part of the
* public API contract.
*
* @example
* {
* field: "email",
* message: "Invalid email format",
* value: "abc@"
* }
*/
export interface IErrorDetail {
  /** Request field associated with the error (body/query/params) */
  field?: string,


  /** Human readable explanation of the failure */
  message: string,


  /** The rejected value (never include secrets or passwords) */
  value?: any
}

/**
* Base Operational Error
* ------------------------------------------------------------
* Represents a controlled failure that is safe to expose to API clients.
*
* All domain / HTTP errors MUST extend this class instead of using `Error`.
* The global error middleware serializes this into a standard API response.
*
* Error Classification
* - 4xx → client fault (status = "fail")
* - 5xx → server fault (status = "error")
*
* Logging Policy
* - operational = true → warn level
* - operational = false → error level (bug / unexpected failure)
*
* @example Response Shape
* {
* "status": "fail",
* "message": "Invalid input",
* "errorType": "Bad Request",
* "details": [{ "field": "email", "message": "Invalid format" }]
* }
*/
export class AppError extends Error {
  /** Class name used as error identifier */
  public readonly name: string;


  /** HTTP status code */
  public readonly statusCode: number;


  /** API semantic status */
  public readonly status: "fail" | "error";


  /** Indicates safe client exposure */
  public readonly isOperational: boolean;


  /** HTTP reason phrase */
  public readonly errorType: string;


  /** Structured validation details */
  public readonly details?: IErrorDetail[] | ValidationError[];

  constructor(
    message: string,
    statusCode: number = 500,
    errorType: string = getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    details?: IErrorDetail[] | ValidationError[],
    isOperational: boolean = true,
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? "fail" : "error"
    this.errorType = errorType
    this.isOperational = isOperational
    if (details !== undefined)
      this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}
/**
* 400 Bad Request
* Client sent syntactically valid but semantically incorrect data.
*
* Typical causes:
* - Invalid query parameters
* - Missing required fields
* - Business rule violation
*/
export class BadRequest extends AppError {
  constructor(message: string, details?: IErrorDetail[] | ValidationError[]) {
    super(message, StatusCodes.BAD_REQUEST, getReasonPhrase(StatusCodes.BAD_REQUEST), details)
  }
}
/**
* 401 Unauthorized
* Authentication required or invalid credentials provided.
*/
export class Unauthorized extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, StatusCodes.UNAUTHORIZED, getReasonPhrase(StatusCodes.UNAUTHORIZED))
  }
}
/**
* 403 Forbidden
* Authenticated but lacks required permissions.
*/
export class Forbidden extends AppError {
  constructor(message: string) {
    super(message, StatusCodes.FORBIDDEN, getReasonPhrase(StatusCodes.FORBIDDEN))
  }
}
/**
* 404 Not Found
* Target resource does not exist.
*/
export class NotFound extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, StatusCodes.NOT_FOUND, getReasonPhrase(StatusCodes.NOT_FOUND))
  }
}

/**
* 409 Conflict
* Resource state conflict (duplicate, version mismatch, race condition).
*/
export class Conflict extends AppError {
  constructor(message: string, details?: IErrorDetail[]) {
    super(message, StatusCodes.CONFLICT, getReasonPhrase(StatusCodes.CONFLICT), details)
  }
}
/**
* 422 Unprocessable Entity
* Request format valid but domain validation failed.
* Typically used for schema validation errors.
*/
export class ValidationProblem extends AppError {
  constructor(details?: IErrorDetail[]) {
    super("Validation failed", StatusCodes.UNPROCESSABLE_ENTITY, getReasonPhrase(StatusCodes.UNPROCESSABLE_ENTITY), details)
  }
}
/**
* 500 Internal Server Error
* Unexpected failure. Should not expose sensitive information.
*/
export class InternalServerError extends AppError {
  constructor(details?: IErrorDetail[]) {
    super("An unexpected error occured. Please try again later.", StatusCodes.INTERNAL_SERVER_ERROR, getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), details)
  }
}
/**
* 501 Not Implemented
* Endpoint recognized but not supported yet.
*/
export class NotImplemented extends AppError {
  constructor(details?: IErrorDetail[]) {
    super("Feature not implemented yet", StatusCodes.NOT_IMPLEMENTED, getReasonPhrase(StatusCodes.NOT_IMPLEMENTED), details)
  }
}
/**
* 503 Service Unavailable
* Temporary server incapacity (maintenance, dependency outage, overload).
*/
export class ServiceUnavailable extends AppError {
  constructor(details?: IErrorDetail[]) {
    super("Service unavailable", StatusCodes.SERVICE_UNAVAILABLE, getReasonPhrase(StatusCodes.SERVICE_UNAVAILABLE), details)
  }
}