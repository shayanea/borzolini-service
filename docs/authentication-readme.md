# Authentication System

## Overview

This handles all the user authentication stuff - JWT tokens, role-based permissions, email/phone verification, and tracking who did what. Pretty standard auth setup, but with some nice extras like account locking and activity logging.

## What It Does

### Core Authentication

- **User registration** - creates account and sends verification email
- **Login** - returns JWT access token (15min) and refresh token (7 days)
- **Token refresh** - so users don't get logged out constantly
- **Password reset** - via email token
- **Account locking** - locks after 5 failed login attempts for 30 minutes
- **Multiple roles** - admin, veterinarian, staff, and patient (each with different permissions)

### Security

- **Password hashing** - using bcrypt with 12 rounds (takes ~100-200ms to hash, makes brute force impractical)
- **JWT tokens** - stateless auth, no session storage needed
- **RBAC** - role guards on controllers and services
- **Activity tracking** - logs every login, logout, profile update with IP and user agent
- **Session management** - refresh tokens stored in DB, can be revoked

### User Management

- **Profiles** - name, email, phone, address, DOB, etc.
- **Preferences** - notification settings, privacy options, UI theme
- **Notifications** - granular control per channel (email, SMS, push)
- **Privacy** - who can see their profile and contact them
- **Activity logs** - full audit trail of everything they do
- **Profile completion** - calculates percentage based on filled fields (helps encourage users to complete their profiles)

### Communication

- **Email verification** - token valid for 24 hours
- **Phone verification** - 6-digit OTP, expires in 10 minutes
- **Welcome emails** - sent after registration
- **Password reset** - token link via email
- **Notification preferences** - users can opt out of marketing emails, etc.

## Architecture

### Entities

#### User Entity

```typescript
@Entity('users')
export class User {
  id: string; // UUID primary key
  email: string; // Unique email address
  phone?: string; // Phone number
  firstName: string; // First name
  lastName: string; // Last name
  passwordHash: string; // Bcrypt hashed password
  role: UserRole; // User role (admin, veterinarian, staff, patient)
  avatar?: string; // Profile picture URL
  dateOfBirth?: Date; // Date of birth
  address?: string; // Street address
  city?: string; // City
  postalCode?: string; // Postal code
  country?: string; // Country
  isEmailVerified: boolean; // Email verification status
  isPhoneVerified: boolean; // Phone verification status
  isActive: boolean; // Account status
  lastLoginAt?: Date; // Last login timestamp
  refreshToken?: string; // JWT refresh token
  refreshTokenExpiresAt?: Date; // Refresh token expiration
  emailVerificationToken?: string; // Email verification token
  emailVerificationExpiresAt?: Date; // Email verification expiration
  phoneVerificationOTP?: string; // Phone verification OTP
  phoneVerificationExpiresAt?: Date; // Phone verification expiration
  passwordResetToken?: string; // Password reset token
  passwordResetExpiresAt?: Date; // Password reset expiration
  loginAttempts: number; // Failed login attempts
  lockedUntil?: Date; // Account lock timestamp
  preferredLanguage?: string; // Preferred language
  timezone?: string; // User timezone
  createdAt: Date; // Account creation date
  updatedAt: Date; // Last update date
}
```

#### UserPreferences Entity

```typescript
@Entity('user_preferences')
export class UserPreferences {
  id: string; // UUID primary key
  userId: string; // User reference
  notificationSettings: NotificationSettings; // Email, SMS, Push notifications
  privacySettings: PrivacySettings; // Profile visibility, contact preferences
  communicationPreferences: CommunicationPreferences; // Language, timezone, quiet hours
  theme: 'light' | 'dark' | 'auto'; // UI theme preference
  isActive: boolean; // Preferences status
  createdAt: Date; // Creation date
  updatedAt: Date; // Last update date
}
```

#### UserActivity Entity

```typescript
@Entity('user_activities')
export class UserActivity {
  id: string; // UUID primary key
  userId: string; // User reference
  type: ActivityType; // Activity type (login, register, etc.)
  status: ActivityStatus; // Activity status (success, failed, pending)
  description: string; // Human-readable description
  metadata: Record<string, any>; // Additional activity data
  ipAddress?: string; // IP address
  userAgent?: string; // User agent string
  location?: string; // Geographic location
  createdAt: Date; // Activity timestamp
}
```

## API Endpoints

### Authentication Endpoints

#### Registration

```http
POST /auth/register
Content-Type: application/json

{
 "email": "user@example.com",
 "password": "securePassword123",
 "firstName": "John",
 "lastName": "Doe",
 "phone": "+1234567890",
 "role": "patient"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "isEmailVerified": false,
    "isPhoneVerified": false,
    "profileCompletionPercentage": 45,
    "accountStatus": "active"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "message": "Registration successful. Please check your email to verify your account."
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
 "email": "user@example.com",
 "password": "securePassword123"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "profileCompletionPercentage": 75,
    "accountStatus": "active"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Email Verification

```http
POST /auth/verify-email/:token
```

**Response:**

```json
{
  "message": "Email verified successfully"
}
```

#### Phone Verification

```http
POST /auth/request-phone-verification
Content-Type: application/json

{
 "phone": "+1234567890"
}

POST /auth/verify-phone
Content-Type: application/json

{
 "phone": "+1234567890",
 "otp": "123456"
}
```

#### Password Reset

```http
POST /auth/forgot-password
Content-Type: application/json

{
 "email": "user@example.com"
}

POST /auth/reset-password
Content-Type: application/json

{
 "token": "reset_token",
 "newPassword": "newSecurePassword123"
}
```

#### Token Refresh

```http
POST /auth/refresh
Content-Type: application/json

{
 "refreshToken": "refresh_token"
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

### User Management Endpoints

#### Get Profile

```http
GET /users/profile
Authorization: Bearer <access_token>
```

#### Update Profile

```http
PATCH /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

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

#### Get Profile Completion

```http
GET /users/profile/completion
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "completionPercentage": 75,
  "missingFields": ["avatar", "dateOfBirth"],
  "suggestions": ["Add a profile picture to personalize your account", "Add your date of birth for personalized recommendations"]
}
```

### User Preferences Endpoints

#### Get Preferences

```http
GET /users/profile/preferences
Authorization: Bearer <access_token>
```

#### Update Preferences

```http
PATCH /users/profile/preferences
Authorization: Bearer <access_token>
Content-Type: application/json

{
 "notificationSettings": {
 "email": {
 "appointments": true,
 "reminders": true,
 "healthAlerts": true,
 "marketing": false,
 "newsletter": true
 }
 },
 "theme": "dark"
}
```

### User Activity Endpoints

#### Get Activities

```http
GET /users/profile/activities?limit=50
Authorization: Bearer <access_token>
```

#### Get Activity Summary

```http
GET /users/profile/activities/summary
Authorization: Bearer <access_token>
```

**Response:**

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

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Database Configuration

The system requires PostgreSQL with the following extensions:

- `uuid-ossp` for UUID generation
- JSONB support for flexible data storage

## Getting Started

### 1. Set Up the Database

TypeORM will create the tables automatically, but if you want to run migrations manually:

```bash
psql -U postgres -d your_database -f src/database/migrations/001-create-user-tables.sql
```

### 2. Configure Environment

```bash
cp config.env.example config.env
# Open config.env and set your JWT secrets, SMTP settings, etc.
```

**Important:** Change the JWT_SECRET and JWT_REFRESH_SECRET from the defaults!

### 3. Install and Run

```bash
pnpm install
pnpm run start:dev  # starts on port 3001
```

### 4. Seed Test Users (Optional)

This creates some test accounts you can use right away:

```bash
pnpm run seed
```

You'll get admin, vet, staff, and patient accounts all with password `Password123!`

## Test Accounts

After running the seed script, you can log in with any of these:

**Pro tip:** All test accounts use password `Password123!`

| Email                      | Role         | Password     | Status         |
| -------------------------- | ------------ | ------------ | -------------- |
| admin@borzolini.com        | Admin        | Password123! | Verified       |
| dr.smith@borzolini.com     | Veterinarian | Password123! | Verified       |
| dr.johnson@borzolini.com   | Veterinarian | Password123! | Verified       |
| dr.garcia@borzolini.com    | Veterinarian | Password123! | Verified       |
| nurse.wilson@borzolini.com | Staff        | Password123! | Verified       |
| john.doe@example.com       | Patient      | Password123! | Email Verified |
| jane.smith@example.com     | Patient      | Password123! | Fully Verified |
| mike.brown@example.com     | Patient      | Password123! | Unverified     |
| sarah.wilson@example.com   | Patient      | Password123! | Fully Verified |
| alex.chen@example.com      | Patient      | Password123! | Fully Verified |

## Security Implementation

### Passwords

- **Bcrypt with 12 rounds** - takes ~100-200ms to hash, makes brute force attacks impractical
- **Min 8 characters** - validated on registration and password change
- **Account locking** - after 5 failed attempts, locked for 30 minutes
- **No password in responses** - we exclude it from all serialized user objects

### Tokens

- **Access tokens** - expire in 15 minutes (keeps attack window small)
- **Refresh tokens** - expire in 7 days (stored in DB so we can revoke them)
- **Token storage** - access token in memory/localStorage, refresh token in httpOnly cookie (if using cookie auth)
- **Auto-refresh** - frontend should refresh access token before it expires

### Account Protection

- **Email verification** - can't log in until email is verified (prevents fake signups)
- **Phone verification** - optional extra security layer
- **Deactivation** - admins can deactivate accounts without deleting data
- **Activity logs** - tracks everything for audit purposes (IP, user agent, timestamp)

## Email Templates

Email templates included:

- Email verification with token link
- Password reset with token link
- Welcome message after registration
- Both HTML and plain text versions

## Phone Verification

How phone verification works:

- **6-digit OTP** - random code generated server-side
- **10-minute expiry** - code becomes invalid after that
- **SMS delivery** - currently has placeholder code, but ready for Twilio/SNS integration

**Note:** You'll need to integrate with an SMS provider (Twilio, AWS SNS, etc.) to actually send the codes. The endpoint structure is ready to go.

## Role-Based Access Control

### Admin

- Full system access
- User management
- System configuration
- Activity monitoring

### Veterinarian

- Patient management
- Appointment handling
- Medical records
- profile

### Staff

- Appointment scheduling
- Patient communication
- Basic user management
- Support functions

### Patient

- Personal profile management
- Appointment booking
- Medical history access
- Communication preferences

## Activity Tracking

The system tracks:

- Login/logout events
- Profile updates
- Password changes
- Email/phone verifications
- Preference changes
- IP addresses and user agents
- Geographic locations

## Testing

### Using Swagger UI

Easiest way to test is through Swagger at `http://localhost:3001/api/docs`

Click on an endpoint, hit "Try it out", fill in the request body, and execute. It'll even handle the JWT tokens for you.

### Using cURL

If you prefer the command line:

```bash
# Register a new user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
  "email": "test@example.com",
  "password": "Password123!",
  "firstName": "Test",
  "lastName": "User",
  "role": "patient"
  }'

# Login (save the accessToken from the response)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
  "email": "test@example.com",
  "password": "Password123!"
  }'

# Use the token in subsequent requests
curl -X GET http://localhost:3001/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Error Handling

How we handle errors:

- **Validation errors** (400) - tells you exactly which field failed and why
- **Auth errors** (401) - invalid/expired token or wrong credentials
- **Forbidden** (403) - you're authenticated but don't have permission
- **Rate limiting** (429) - too many requests, try again later
- **Service errors** (503) - if email service is down, we log it and return a friendly message

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["email must be a valid email"]
}
```

## Quick Reference for Developers

If you're implementing auth in your code:

```typescript
// Protect a controller
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MyController {}

// Require specific roles
@Roles(UserRole.ADMIN)
@Post()
createSomething() {}

// Multiple roles allowed
@Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
@Get()
listSomething() {}

// All authenticated users (no decorator needed)
@Get('profile')
getProfile() {}
```

**Role Permissions Summary:**

- **ADMIN** - full access to everything
- **VETERINARIAN** - can view/update patients, vets, and staff (not admins)
- **STAFF** - can view/update patients and staff only
- **PATIENT** - can only access their own data

## What's Next

Things we're planning to add:

- **2FA** - TOTP-based (like Google Authenticator)
- **Social login** - Google, Apple, maybe GitHub
- **Analytics dashboard** - see login patterns, user growth, etc.
- **Real-time notifications** - WebSocket-based push notifications
- **Multi-language** - i18n for email templates and error messages
- **Device management** - see all active sessions, revoke tokens per device
- **IP whitelisting** - for clinic staff who only log in from known IPs

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [JWT.io](https://jwt.io/)
- [Bcrypt Documentation](https://github.com/dcodeIO/bcrypt.js)

## Support

For questions or issues:

1. Check the logs for detailed error information
2. Verify environment configuration
3. Ensure database connectivity
4. Review API documentation at `/api` endpoint

---

**Important Notes:**

- Always use HTTPS in production (no exceptions!)
- Rotate your JWT secrets periodically
- Keep bcrypt rounds at 12 (don't go lower for performance)
- Monitor failed login attempts for potential attacks
- Back up your refresh tokens table (users will have to re-login if you lose it)
