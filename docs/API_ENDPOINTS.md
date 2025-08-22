# 🐾 Borzolini Clinic API Endpoints

## Overview

This document provides a comprehensive overview of all available API endpoints in the Borzolini Clinic platform. All endpoints are prefixed with `/api/v1`.

## Base Information

- **Base URL**: `http://localhost:3001/api/v1` (Development)
- **Production URL**: `https://api.borzolini.com/api/v1`
- **Documentation**: `http://localhost:3001/api/docs`
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`

## 🔐 Authentication Endpoints

### POST /auth/register

**Register a new user account**

Create a new user account with email verification. Supports multiple user roles.

**Request Body:**

```json
{
  "email": "patient@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "patient"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "uuid-string",
    "email": "patient@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "isEmailVerified": false,
    "isPhoneVerified": false,
    "profileCompletionPercentage": 45,
    "accountStatus": "active"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful. Please check your email to verify your account."
}
```

**Error Responses:**

- `400`: Validation error
- `409`: User already exists

---

### POST /auth/login

**User login authentication**

Authenticate user with email and password. Returns JWT tokens for accessing protected endpoints.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid-string",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "profileCompletionPercentage": 75,
    "accountStatus": "active"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `401`: Invalid credentials
- `423`: Account locked

---

### POST /auth/refresh

**Refresh access token**

Generate new access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /auth/logout

**User logout**

Logout user and invalidate refresh token.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

---

### POST /auth/verify-email/:token

**Verify email address**

Verify user email address using the token sent via email.

**Parameters:**

- `token`: Email verification token

**Response (200):**

```json
{
  "message": "Email verified successfully"
}
```

**Error Responses:**

- `400`: Invalid or expired token

---

### POST /auth/forgot-password

**Request password reset**

Send password reset email to user.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

---

### POST /auth/reset-password

**Reset password with token**

Reset user password using reset token.

**Request Body:**

```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**

```json
{
  "message": "Password reset successfully"
}
```

---

### POST /auth/verify-phone

**Verify phone number with OTP**

Verify user phone number using OTP code.

**Request Body:**

```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Response (200):**

```json
{
  "message": "Phone verified successfully"
}
```

---

## 👥 User Management Endpoints

### GET /users/profile

**Get current user profile**

Retrieve authenticated user's profile information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "id": "uuid-string",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient",
  "avatar": "https://example.com/avatar.jpg",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "isEmailVerified": true,
  "isPhoneVerified": false,
  "profileCompletionPercentage": 75,
  "accountStatus": "active",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

---

### PATCH /users/profile

**Update current user profile**

Update authenticated user's profile information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "postalCode": "10001",
  "country": "USA"
}
```

**Response (200):**

```json
{
  "id": "uuid-string",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "profileCompletionPercentage": 85,
  "updatedAt": "2024-01-01T12:30:00Z"
}
```

---

### GET /users/profile/completion

**Get profile completion status**

Get current user's profile completion percentage and suggestions.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "completionPercentage": 75,
  "missingFields": ["avatar", "dateOfBirth"],
  "suggestions": ["Add a profile picture to personalize your account", "Add your date of birth for personalized recommendations"]
}
```

---

### GET /users/profile/preferences

**Get user preferences**

Retrieve current user's preferences and settings.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "notificationSettings": {
    "email": {
      "appointments": true,
      "reminders": true,
      "healthAlerts": true,
      "marketing": false,
      "newsletter": true
    },
    "sms": {
      "appointments": true,
      "reminders": true,
      "healthAlerts": true
    },
    "push": {
      "appointments": true,
      "reminders": true,
      "healthAlerts": true
    }
  },
  "privacySettings": {
    "profileVisibility": "public",
    "showPhone": true,
    "showAddress": false,
    "showEmail": false,
    "allowContact": true
  },
  "theme": "auto"
}
```

---

### PATCH /users/profile/preferences

**Update user preferences**

Update current user's preferences and settings.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "notificationSettings": {
    "email": {
      "appointments": true,
      "reminders": true,
      "healthAlerts": true,
      "marketing": false
    }
  },
  "theme": "dark"
}
```

**Response (200):**

```json
{
  "message": "Preferences updated successfully",
  "updatedAt": "2024-01-01T12:30:00Z"
}
```

---

### GET /users/profile/activities

**Get user activities**

Retrieve current user's activity history.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `limit`: Number of activities to retrieve (default: 50)

**Response (200):**

```json
[
  {
    "id": "uuid-string",
    "type": "login",
    "status": "success",
    "description": "User logged in successfully",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "location": "New York, USA",
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

---

### GET /users/profile/activities/summary

**Get activity summary**

Get current user's activity summary and statistics.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "totalActivities": 25,
  "lastActivity": "2024-01-01T12:00:00Z",
  "activityTypes": {
    "login": 15,
    "profile_update": 5,
    "preferences_updated": 3,
    "register": 1,
    "logout": 1
  }
}
```

---

## 🔧 Admin Endpoints

### POST /users

**Create a new user (Admin only)**

Administrative endpoint to create new users.

**Headers:**

```
Authorization: Bearer <admin_access_token>
```

**Request Body:**

```json
{
  "email": "new.vet@clinic.com",
  "password": "SecurePass123!",
  "firstName": "Dr. Jane",
  "lastName": "Wilson",
  "phone": "+1234567890",
  "role": "veterinarian",
  "address": "456 Medical Plaza",
  "city": "Healthcare City",
  "country": "USA"
}
```

**Response (201):**

```json
{
  "id": "uuid-string",
  "email": "new.vet@clinic.com",
  "firstName": "Dr. Jane",
  "lastName": "Wilson",
  "role": "veterinarian",
  "isEmailVerified": false,
  "isPhoneVerified": false,
  "isActive": true,
  "profileCompletionPercentage": 65,
  "accountStatus": "active",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

**Error Responses:**

- `403`: Insufficient permissions
- `400`: Validation error
- `409`: User already exists

---

### GET /users

**Get all users (Admin only)**

Retrieve all users in the system.

**Headers:**

```
Authorization: Bearer <admin_access_token>
```

**Response (200):**

```json
[
  {
    "id": "uuid-string",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

---

## 🚨 Error Response Format

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message or array of validation errors",
  "error": "Error type (e.g., Bad Request, Unauthorized)"
}
```

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Rate Limiting

- **General endpoints**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- **Admin endpoints**: 50 requests per minute

## 🌍 Internationalization

The API supports multiple languages. Include the preferred language in the `Accept-Language` header:

```
Accept-Language: en-US,en;q=0.9,es;q=0.8
```

## 📱 Mobile Considerations

- All timestamps are in ISO 8601 format (UTC)
- Profile images should be uploaded separately via file upload endpoints
- Push notification tokens can be registered via user preferences

## 🔧 Development Tools

- **Swagger UI**: `http://localhost:3001/api/docs`
- **Generate Docs**: `pnpm run docs:generate`
- **Serve Docs**: `pnpm run docs:serve`

---

_Last updated: $(date)_
_API Version: 1.0.0_
