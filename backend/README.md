# Express TypeScript API - Production Ready Starter

## 📋 Overview

A fully-featured, production-ready Express.js API starter built with TypeScript. This project implements a complete authentication system with user registration, login, logout, and real-time WebSocket capabilities. The architecture follows best practices for scalability, maintainability, and security.

**Key Features:**
- 🔐 **Complete Authentication System** - JWT-based auth with cookie storage
- 🏗️ **Layered Architecture** - Controllers, Services, Models, DTOs separation
- ✅ **Type Safety** - Full TypeScript support with declaration merging
- 🛡️ **Security First** - Password hashing, HTTP-only cookies, input validation
- 📝 **Comprehensive Documentation** - JSDoc comments throughout codebase
- 🔌 **Real-time Ready** - WebSocket integration via socketId field
- 🎯 **Standardized Responses** - Consistent API response format

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* MongoDB 6+
* npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd express-ts-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Environment Variables (.env)

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/auth-api

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production

# Logging
LOG_LEVEL=info

# Optional: Production overrides
CORS_ORIGIN=https://yourdomain.com
```

### Project Structure

```
src/
├── app.ts                 # Express application configuration
├── server.ts              # Server bootstrap & process management
├── config/
│   ├── db.ts              # MongoDB connection manager
│   └── env.ts             # Environment validation
├── middleware/
│   ├── error.middleware.ts # Global error handling
│   ├── asyncHandler.middleware.ts # Async error wrapper
│   └── response.middleware.ts # Standardized response helpers
├── utils/
│   └── AppError.ts       # Custom error classes
├── logger/
│   └── pino.logger.ts    # Structured logging configuration
├── routes/
│   └── userAuth.routes.ts # Authentication endpoints
├── controllers/
│   └── userAuth.controller.ts # Authentication request handlers
├── services/
│   └── user.service.ts   # User business logic
├── models/
│   └── user.model.ts     # Mongoose schema & methods
├── interfaces/
│   └── IUser.ts          # User entity interface
├── dto/
│   ├── registerUser.dto.ts # Registration data transfer object
│   └── loginUser.dto.ts    # Login data transfer object
├── types/
│   ├── express.d.ts      # Express type extensions
│   └── response.type.ts  # API response interface
└── docs/                 # Documentation (generated)
```

### Core Features

#### Robust Error Handling System

A centralized pipeline ensuring consistent API responses and preventing unhandled exceptions.

#### Components

- **AppError** — Base HTTP error abstraction

- **asyncHandler** — Automatic promise rejection capture

- **Global Error Middleware** — Central error processor

- **MongoDB Error Normalization** — Converts DB errors → HTTP errors

| Code | Name                | Purpose                  |
| ---- | ------------------- | ------------------------ |
| 400  | BadRequest          | Invalid client input     |
| 401  | Unauthorized        | Authentication required  |
| 403  | Forbidden           | Insufficient permissions |
| 404  | NotFound            | Resource not found       |
| 409  | Conflict            | Resource conflict        |
| 422  | ValidationProblem   | Schema validation errors |
| 500  | InternalServerError | Server failure           |
| 501  | NotImplemented      | Unsupported feature      |
| 503  | ServiceUnavailable  | Temporary outage         |

#### Example
```ts
import { BadRequest, NotFound } from './utils/AppError.js';
import asyncHandler from './middleware/asyncHandler.middleware.js';

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFound('User not found');
  }

  res.ok(user, "User retrieved successfully");
});
```

### Authentication System

#### Register
```
POST /api/auth/register
```
```json
{
  "email": "user@example.com",
  "fullName": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "password": "SecurePass123!"
}
```

#### Login

```
POST /api/auth/login
```

```json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```


Sets cookie:

```
token=<JWT> (HTTP-Only)
```

#### Logout

```
POST /api/auth/logout
```


Clears authentication cookie.

### Security Features

- bcrypt hashing (10 salt rounds)

- JWT authentication

- HTTP-only cookies

- express-validator input validation

- Password excluded from responses

- Email uniqueness enforcement

- Timing-safe password comparison

### Structured Logging

Powered by Pino.js

#### Features

- Pretty logs in development

- JSON logs in production

- Automatic sensitive data redaction

- Request lifecycle tracking

- Response time metrics

#### Configuration

```bash
# Production
LOG_LEVEL=info
NODE_ENV=production

# Development
LOG_LEVEL=debug
NODE_ENV=development
```

### Database Integration

#### MongoDB (Mongoose)
```ts
await mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  autoIndex: process.env.NODE_ENV === 'development'
});
```

#### User Model

- First name ≥ 3 chars

- Password ≥ 8 chars

- Email format validation

- `select: false` password field

- `comparePassword()`

- `generateAuthToken()`

- Auto password removal in serialization

### API Endpoints

#### Authentication Routes

| Method | Endpoint  | Description    | Auth |
| ------ | --------- | -------------- | ---- |
| POST   | /register | Create account | No   |
| POST   | /login    | Login user     | No   |
| POST   | /logout   | Logout         | No   |

#### Example
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": { "firstName": "Test" },
    "password": "Test12345"
  }'
```

### Architecture

#### Layer Responsibilities

| Layer       | Purpose              |
| ----------- | -------------------- |
| routes      | Validation + mapping |
| controllers | Request handling     |
| services    | Business logic       |
| models      | Database             |
| dto         | Data contracts       |
| interfaces  | Type definitions     |

### Health Monitoring
```
GET /health
```
```json
{
  "status": "success",
  "uptime": 3600.25,
  "message": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

| Status | Meaning               |
| ------ | --------------------- |
| 200    | Healthy               |
| 503    | Database disconnected |

### Security Implementation
#### Password Hashing
```ts
const hashedPassword = await userModel.hashPassword(password);
const valid = await user.comparePassword(inputPassword);
```

#### JWT
```ts
const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
});
```

#### Validation
```ts
[
  body("email").isEmail(),
  body("fullName.firstName").isLength({ min: 3 }),
  body("password").isLength({ min: 8 })
]
```

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

#### Scripts
```json
{
  "dev": "tsx watch src/server.ts",
}
```

### API Response Format

#### Success

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {},
  "meta": { "timestamp": "ISO_DATE" }
}
```

#### Error

```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": {
    "name": "Unauthorized",
    "statusCode": 401,
    "details": "Email or password incorrect"
  },
  "meta": { "timestamp": "ISO_DATE" }
}
```

### Logging Setup

```ts
import pino from 'pino';
import pinoHttp from 'pino-http';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['password', 'token', 'authorization'],
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined
});

app.use(pinoHttp({ logger }));
```

### Troubleshooting

| Issue                | Cause           | Solution           |
| -------------------- | --------------- | ------------------ |
| JWT key missing      | No env variable | Set JWT_SECRET     |
| Invalid credentials  | Wrong password  | Check hashing      |
| DB connection failed | Bad URI         | Verify MongoDB     |
| Duplicate user       | Same email      | Enforce uniqueness |

### Emergency Procedures

- Restart service

- Rotate JWT secret

- Restore backup

- Inspect logs