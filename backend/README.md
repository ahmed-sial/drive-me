# Express TypeScript API - Production Ready Starter

## 📋 Overview

- TODO

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* MongoDB 6+
* npm or yarn

### Installation

- TODO

---

## 📁 Project Structure

```
src/
├── app.ts                 # Express application configuration
├── server.ts              # Server bootstrap & process management
├── config/
│   ├── db.ts              # MongoDB connection manager
│   └── env.ts             # Environment validation (recommended addition)
├── middleware/
│   ├── error.middleware.ts # Global error handling
│   └── asyncHandler.middleware.ts # Async error wrapper
├── utils/
│   └── AppError.ts       # Custom error classes
├── logger/
│   └── pino.logger.ts    # Structured logging configuration
├── routes/               # API route definitions
├── controllers/          # Request handlers
├── services/             # Business logic
├── models/               # Database schemas
└── types/                # TypeScript type definitions
```

---

## 🔧 Core Features

### 🛡️ Robust Error Handling System

A comprehensive error handling pipeline that ensures consistent API responses and prevents unhandled exceptions.

#### Key Components

* **AppError** - Base error class with HTTP semantics
* **asyncHandler** - Automatic promise rejection handling
* **Global Error Middleware** - Centralized error processing
* **MongoDB Error Normalization** - Database errors to HTTP errors

#### Error Types Included

* 400 BadRequest - Invalid client input
* 401 Unauthorized - Authentication required
* 403 Forbidden - Insufficient permissions
* 404 NotFound - Resource not found
* 409 Conflict - Resource conflicts
* 422 ValidationProblem - Schema validation errors
* 500 InternalServerError - Server failures
* 501 NotImplemented - Unsupported features
* 503 ServiceUnavailable - Temporary outages

#### Example Usage

```ts
import { BadRequest, NotFound } from './utils/AppError.js';
import asyncHandler from './middleware/asyncHandler.middleware.js';

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new NotFound('User not found');
  }
  
  if (user.isBanned) {
    throw new Forbidden('User account is banned');
  }
  
  res.json(user);
});
```

---

### 📊 Structured Logging

Production-grade logging with Pino.js for high-performance structured logging.

#### Features

* Environment-aware: Pretty logs for development, JSON for production
* Automatic redaction: Sensitive data (tokens, passwords, PII) automatically masked
* Request/Response logging: Complete request lifecycle tracking
* Performance metrics: Response time tracking

#### Configuration

```js
// Log levels (controlled by LOG_LEVEL env var)
TRACE → DEBUG → INFO → WARN → ERROR → FATAL

// Production logging to file with rotation
LOG_LEVEL=info
NODE_ENV=production

// Development with verbose output
LOG_LEVEL=debug
NODE_ENV=development
```

---

### 🗄️ Database Integration

Robust MongoDB connection management with Mongoose ODM.

#### Connection Features

* Connection pooling: Optimal performance under load
* Graceful shutdown: Clean connection termination
* Health monitoring: Real-time database status
* Error resilience: Automatic reconnection handling

#### Connection Options (Optional)

```ts
await mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  autoIndex: process.env.NODE_ENV === 'development'
});
```

---

## 🏥 Health Monitoring

**Endpoint:** `GET /health`

```json
{
  "uptime": 3600.25,
  "message": "OK",
  "timestamp": 1678891234567,
  "database": "connected"
}
```

**Response Codes**

* 200 OK: System healthy, database connected
* 503 Service Unavailable: Database disconnected

---

## 🔐 Security Features

* CORS: Configurable Cross-Origin Resource Sharing
* Cookie Parsing: Secure cookie handling
* Input Validation: Request body validation via middleware
* Sensitive Data Protection: Automatic log redaction
* Rate Limiting: Ready for implementation (see Extensions)

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://username:password@localhost:27017/database?authSource=admin

# Logging
LOG_LEVEL=info

# Security (add as needed)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### Development vs Production

| Setting          | Development            | Production           |
| ---------------- | ---------------------- | -------------------- |
| Logging          | Colored console output | JSON to file         |
| Error Details    | Full stack traces      | Generic messages     |
| Database Indexes | Auto-created           | Pre-built            |
| Port             | 5000                   | Environment variable |
| CORS             | Open                   | Restricted origins   |

---

## 🛠️ Development Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
  }
}
```

---

## 📚 API Design Principles

### RESTful Conventions

* Resource-based URLs (`/api/v1/users`)
* Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
* Consistent response formats
* Versioned APIs (`/api/v1/`, `/api/v2/`)

### Error Response Format

```json
{
  "status": "fail",
  "message": "Invalid email format",
  "errorType": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Success Response Format

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

## 🔄 Extensions & Integrations

### Recommended Additions

```bash
npm install jsonwebtoken bcryptjs
```

---

## 🚨 Error Prevention & Debugging

### Database Connection Issues

```bash
mongosh --eval "db.adminCommand('ping')"
echo $MONGO_URI
```

### Memory Leaks

```ts
import heapdump from 'heapdump';
process.on('SIGUSR2', () => {
  heapdump.writeSnapshot();
});
```

### Unhandled Rejections

```ts
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});
```

---

## 📊 Logging & Monitoring Setup

## Code Standards

* TypeScript strict mode
* Follow existing error handling patterns
* Add comprehensive JSDoc comments
* Include integration tests for new endpoints
* Update documentation for API changes

---

## 🆘 Support

### Emergency Procedures

* Service Down: Check database connection and restart service
* Memory Spike: Force restart and investigate with heap dump
* Security Breach: Rotate all secrets immediately
* Data Corruption: Restore from backup and investigate logs

---

**Built for scalable, maintainable API development**
