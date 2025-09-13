# 🔐 Borzolini Clinic Authentication System

## Overview

The Borzolini Clinic authentication system provides a comprehensive, secure, and feature-rich user management solution with role-based access control, email verification, phone verification, and activity tracking.

## 🚀 Features

### Core Authentication

- ✅ User registration with email verification
- ✅ Secure login with JWT tokens
- ✅ Refresh token management
- ✅ Password reset functionality
- ✅ Account locking after failed attempts
- ✅ Multi-role user management (admin, veterinarian, staff, patient)

### Security Features

- ✅ Bcrypt password hashing (12 rounds)
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Account activity monitoring
- ✅ IP address and user agent tracking
- ✅ Session management

### User Management

- ✅ Comprehensive user profiles
- ✅ User preferences management
- ✅ Notification settings
- ✅ Privacy controls
- ✅ Activity logging and analytics
- ✅ Profile completion tracking

### Communication

- ✅ Email verification system
- ✅ Phone verification with OTP
- ✅ Welcome emails
- ✅ Password reset emails
- ✅ Notification preferences

## 🏗️ Architecture

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

## 📡 API Endpoints

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

## 🔧 Configuration

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

## 🚀 Getting Started

### 1. Database Setup

Run the migration script:

```bash
psql -U postgres -d your_database -f src/database/migrations/001-create-user-tables.sql
```

### 2. Environment Configuration

Copy and configure the environment variables:

```bash
cp config.env.example config.env
# Edit config.env with your values
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run the Application

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

### 5. Seed Sample Data

```bash
pnpm run seed
```

## 📊 Sample Users

After seeding, the following test users are available:

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

## 🔒 Security Features

### Password Security

- Bcrypt hashing with 12 rounds
- Minimum 8 character requirement
- Account locking after 5 failed attempts
- 30-minute lock duration

### Token Security

- JWT access tokens (15 minutes)
- JWT refresh tokens (7 days)
- Secure token storage
- Automatic token refresh

### Account Protection

- Email verification required for login
- Phone verification for enhanced security
- Account deactivation capability
- Activity monitoring and logging

## 📧 Email Templates

The system includes professionally designed email templates for:

- Email verification
- Password reset
- Welcome messages
- HTML and text versions

## 📱 Phone Verification

Phone verification uses:

- 6-digit OTP codes
- 10-minute expiration
- SMS delivery (placeholder for Twilio integration)

## 🎯 Role-Based Access Control

### Admin

- Full system access
- User management
- System configuration
- Activity monitoring

### Veterinarian

- Patient management
- Appointment handling
- Medical records
- Professional profile

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

## 📈 Activity Tracking

The system tracks:

- Login/logout events
- Profile updates
- Password changes
- Email/phone verifications
- Preference changes
- IP addresses and user agents
- Geographic locations

## 🧪 Testing

### API Testing

Use the provided Swagger documentation at `/api` endpoint for testing all endpoints.

### Sample Requests

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

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

## 🚨 Error Handling

The system provides comprehensive error handling:

- Validation errors with detailed messages
- Authentication errors with appropriate HTTP status codes
- Rate limiting for security
- Graceful degradation for missing services

## 🔄 Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social login integration
- [ ] Advanced analytics dashboard
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Advanced security features (IP whitelisting, device management)

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [JWT.io](https://jwt.io/)
- [Bcrypt Documentation](https://github.com/dcodeIO/bcrypt.js)

## 🤝 Support

For questions or issues:

1. Check the logs for detailed error information
2. Verify environment configuration
3. Ensure database connectivity
4. Review API documentation at `/api` endpoint

---

**Note:** This authentication system is production-ready and follows security best practices. Always use HTTPS in production and regularly rotate JWT secrets.
