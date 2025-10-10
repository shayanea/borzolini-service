# Settings Module
The Settings Module provides configuration management for the Borzolini Pet Clinic platform. It allows administrators to manage system-wide settings including general clinic information, notification preferences, appointment configurations, and security settings.
## Features
### Core Settings Management
- **General Settings**: Clinic name, currency, timezone, and business hours
- **Notification Settings**: Email/SMS notifications, notification preferences
- **Appointment Settings**: Duration, booking lead time, cancellation policy, daily limits
- **Security Settings**: Session timeout, password expiry, two-factor authentication
### Features
- **Multiple Settings Profiles**: Create and manage multiple settings configurations
- **Active Settings**: Set which configuration is currently active
- **Default Settings**: Fallback configuration that cannot be deleted
- **Settings Duplication**: Clone existing settings for easy configuration
- **Reset to Defaults**: Restore all settings to default values
## Data Models
### Settings Entity
```typescript
interface Settings {
 id: string;
 name: string;
 description?: string;
 generalSettings: GeneralSettings;
 notificationSettings: NotificationSettings;
 appointmentSettings: AppointmentSettings;
 securitySettings: SecuritySettings;
 isActive: boolean;
 isDefault: boolean;
 createdAt: Date;
 updatedAt: Date;
}
```
### Settings Interfaces
```typescript
interface GeneralSettings {
 clinicName: string;
 currency: string;
 timezone: string;
 businessHours: string;
}
interface NotificationSettings {
 enableNotifications: boolean;
 emailNotifications: boolean;
 smsNotifications: boolean;
 notificationEmail: string;
}
interface AppointmentSettings {
 defaultAppointmentDuration: number; // minutes
 bookingLeadTime: number; // hours
 cancellationPolicy: number; // hours
 maxAppointmentsPerDay: number;
}
interface SecuritySettings {
 sessionTimeout: number; // minutes
 passwordExpiry: number; // days
 twoFactorAuthentication: boolean;
}
```
## API Endpoints
### Settings Management
- `POST /settings` - Create new settings configuration
- `GET /settings` - Get all settings configurations
- `GET /settings/active` - Get currently active settings
- `GET /settings/default` - Get default settings
- `GET /settings/:id` - Get settings by ID
- `PATCH /settings/:id` - Update settings by ID
- `PATCH /settings/default` - Update default settings
- `DELETE /settings/:id` - Delete settings configuration
### Section-Specific Updates
- `PATCH /settings/general` - Update general settings
- `PATCH /settings/notifications` - Update notification settings
- `PATCH /settings/appointments` - Update appointment settings
- `PATCH /settings/security` - Update security settings
### Operations
- `POST /settings/reset` - Reset settings to defaults
- `POST /settings/:id/activate` - Activate specific settings
- `POST /settings/:id/duplicate` - Duplicate settings configuration
## Authentication & Authorization
All endpoints require:
- **Authentication**: Valid JWT token
- **Authorization**: Admin role only
## Usage Examples
### Get Current Active Settings
```bash
GET /settings/active
Authorization: Bearer <jwt-token>
```
### Update General Settings
```bash
PATCH /settings/general
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
 "generalSettings": {
 "clinicName": "Updated Clinic Name",
 "currency": "EUR",
 "timezone": "Europe/London",
 "businessHours": "9:00 AM - 7:00 PM"
 }
}
```
### Update Notification Settings
```bash
PATCH /settings/notifications
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
 "notificationSettings": {
 "enableNotifications": true,
 "emailNotifications": true,
 "smsNotifications": true,
 "notificationEmail": "notifications@clinic.com"
 }
}
```
### Reset to Defaults
```bash
POST /settings/reset
Authorization: Bearer <jwt-token>
```
### Create New Settings Profile
```bash
POST /settings
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
 "name": "Production Settings",
 "description": "Settings for production environment",
 "generalSettings": {
 "clinicName": "Production Clinic",
 "currency": "USD",
 "timezone": "America/New_York",
 "businessHours": "8:00 AM - 6:00 PM"
 },
 "notificationSettings": {
 "enableNotifications": true,
 "emailNotifications": true,
 "smsNotifications": false,
 "notificationEmail": "admin@clinic.com"
 },
 "appointmentSettings": {
 "defaultAppointmentDuration": 45,
 "bookingLeadTime": 48,
 "cancellationPolicy": 24,
 "maxAppointmentsPerDay": 60
 },
 "securitySettings": {
 "sessionTimeout": 60,
 "passwordExpiry": 180,
 "twoFactorAuthentication": true
 }
}
```
## Validation Rules
### General Settings
- `clinicName`: Required string
- `currency`: Required string (ISO currency code)
- `timezone`: Required string (IANA timezone)
- `businessHours`: Required string
### Notification Settings
- `enableNotifications`: Boolean
- `emailNotifications`: Boolean
- `smsNotifications`: Boolean
- `notificationEmail`: Valid email address
### Appointment Settings
- `defaultAppointmentDuration`: Number between 15-480 minutes
- `bookingLeadTime`: Number between 1-168 hours
- `cancellationPolicy`: Number between 1-168 hours
- `maxAppointmentsPerDay`: Number between 1-200
### Security Settings
- `sessionTimeout`: Number between 5-480 minutes
- `passwordExpiry`: Number between 30-365 days
- `twoFactorAuthentication`: Boolean
## Database Schema
The settings are stored in a PostgreSQL table with the following structure:
```sql
CREATE TABLE settings (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 name VARCHAR(255) NOT NULL DEFAULT 'default',
 description TEXT,
 general_settings JSONB NOT NULL,
 notification_settings JSONB NOT NULL,
 appointment_settings JSONB NOT NULL,
 security_settings JSONB NOT NULL,
 is_active BOOLEAN NOT NULL DEFAULT true,
 is_default BOOLEAN NOT NULL DEFAULT false,
 created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```
## Error Handling
The module provides error handling:
- **400 Bad Request**: Invalid input data or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions (non-admin user)
- **404 Not Found**: Settings configuration not found
- **409 Conflict**: Settings name already exists or cannot delete default settings
## Integration
The Settings Module is automatically integrated into the main application and provides:
- **Service Injection**: Available for use in other modules
- **Database Integration**: Automatic table creation and migration
- **Validation**: input validation using class-validator
- **Documentation**: Full Swagger/OpenAPI documentation
- **Type Safety**: Full TypeScript support with strict typing
