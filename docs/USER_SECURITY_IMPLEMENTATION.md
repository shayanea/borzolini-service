# 🔐 User Security Implementation Guide

## Overview

This document outlines the comprehensive security implementation for the Users module in the Borzolini Clinic API. The implementation enforces strict role-based access control (RBAC) and data isolation to ensure users can only access appropriate resources based on their role and ownership.

## 🏗️ Architecture

### Security Layers

1. **Authentication Layer**: JWT-based authentication via `JwtAuthGuard`
2. **Authorization Layer**: Role-based access control via `RolesGuard`
3. **Data Access Layer**: Business logic enforcement for data isolation
4. **API Documentation**: Swagger documentation with security requirements

### Guards Implementation

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  // All endpoints require authentication and role validation
}
```

## 👥 User Roles & Permissions

### Role Hierarchy

| Role             | Description              | Access Level                                  |
| ---------------- | ------------------------ | --------------------------------------------- |
| **ADMIN**        | System administrators    | Full access to all users and system functions |
| **VETERINARIAN** | Veterinary professionals | Access to all users, limited admin functions  |
| **STAFF**        | Clinic staff members     | Access to all users, basic operations         |
| **PATIENT**      | Pet owners/patients      | Access only to own data                       |

### Permission Matrix

#### User Management Operations

| Operation              | Admin | Veterinarian | Staff | Patient       |
| ---------------------- | ----- | ------------ | ----- | ------------- |
| **Create Users**       | ✅    | ❌           | ❌    | ❌            |
| **View All Users**     | ✅    | ✅           | ✅    | ❌            |
| **View Specific User** | ✅    | ✅           | ✅    | ✅ (own only) |
| **Update Any User**    | ✅    | ✅           | ✅    | ❌            |
| **Update Own Profile** | ✅    | ✅           | ✅    | ✅            |
| **Delete Users**       | ✅    | ❌           | ❌    | ❌            |
| **Search by Email**    | ✅    | ✅           | ✅    | ❌            |

#### Profile & Preferences

| Operation                  | Admin | Veterinarian | Staff | Patient |
| -------------------------- | ----- | ------------ | ----- | ------- |
| **View Own Profile**       | ✅    | ✅           | ✅    | ✅      |
| **Update Own Profile**     | ✅    | ✅           | ✅    | ✅      |
| **View Own Preferences**   | ✅    | ✅           | ✅    | ✅      |
| **Update Own Preferences** | ✅    | ✅           | ✅    | ✅      |
| **View Own Activities**    | ✅    | ✅           | ✅    | ✅      |
| **View Activity Summary**  | ✅    | ✅           | ✅    | ✅      |

#### Administrative Functions

| Operation                              | Admin | Veterinarian | Staff | Patient |
| -------------------------------------- | ----- | ------------ | ----- | ------- |
| **Recalculate Own Profile Completion** | ✅    | ✅           | ✅    | ✅      |
| **Recalculate Any User's Profile**     | ✅    | ❌           | ❌    | ❌      |
| **Recalculate All Profiles**           | ✅    | ❌           | ❌    | ❌      |

## 🔒 Endpoint Security Details

### 1. User Creation (`POST /users`)

```typescript
@Post()
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Create a new user (Admin only)' })
@ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
```

**Security**: Admin-only access
**Use Case**: System administrators creating new user accounts
**Data Access**: Can create users with any role

### 2. User Listing (`GET /users`)

```typescript
@Get()
@Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
@ApiOperation({ summary: 'Get users based on role permissions (Admin: all users, Staff/Vets: own people and patients only)' })
```

**Security**: Role-based access control
**Use Case**: Clinic staff viewing relevant user directory
**Data Access**: 
- **Admin**: All users in the system
- **Veterinarian**: Patients + other veterinarians only
- **Staff**: Patients + other staff members only

### 3. Individual User View (`GET /users/:id`)

```typescript
@Get(':id')
@ApiOperation({ summary: 'Get user by ID (Role-based access: Admin can view any user, Staff/Vets can only view own people and patients, Patients can only view themselves)' })
```

**Security**: Role-based with ownership validation
**Logic**:

```typescript
// Admin can view any user
if (currentUserRole === UserRole.ADMIN) {
  return this.usersService.findOne(id);
}

// Patients can only view their own profile
if (currentUserRole === UserRole.PATIENT) {
  if (req.user.id !== id) {
    throw new ForbiddenException('You can only view your own profile');
  }
  return this.usersService.findOne(id);
}

// Staff and veterinarians can only view their own people and patients
if (currentUserRole === UserRole.VETERINARIAN || currentUserRole === UserRole.STAFF) {
  const targetUser = await this.usersService.findOne(id);
  
  // Can view patients (any patient)
  if (targetUser.role === UserRole.PATIENT) {
    return targetUser;
  }
  
  // Can view people with same role (other staff/vets)
  if (targetUser.role === currentUserRole) {
    return targetUser;
  }
  
  // Cannot view admins or other role types
  throw new ForbiddenException('You can only view patients and users with the same role as you');
}
```

### 4. User Updates (`PUT /users/:id`)

```typescript
@Put(':id')
@ApiOperation({ summary: 'Update user (Role-based access: Admin can update any user, Staff/Vets can only update own people and patients, Patients can only update themselves)' })
```

**Security**: Role-based with ownership validation
**Logic**: Similar to user viewing - staff/vets can only update patients and users with the same role, patients only themselves

### 5. User Deletion (`DELETE /users/:id`)

```typescript
@Delete(':id')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Delete user (Admin only)' })
```

**Security**: Admin-only with self-deletion prevention
**Logic**:

```typescript
// Prevent admin from deleting themselves
if (req.user.id === id) {
  throw new ForbiddenException('You cannot delete your own account');
}
```

### 6. Profile Management (`/profile/me`)

```typescript
@Get('profile/me')
@Put('profile/me')
// No @Roles decorator - accessible to all authenticated users
```

**Security**: All authenticated users can access their own profile
**Data Isolation**: Users can only access their own data

## 🛡️ Security Features

### Data Isolation

1. **Ownership Validation**: Users can only access their own data
2. **Role-based Access**: Different roles have different access levels
3. **Self-service Operations**: Users can manage their own profiles
4. **Administrative Controls**: Admins have oversight capabilities

### Error Handling

```typescript
// Proper HTTP status codes and messages
@ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })

// Consistent exception handling
throw new ForbiddenException('You can only view your own profile');
```

### Input Validation

1. **Parameter Validation**: All route parameters are validated
2. **Body Validation**: DTOs ensure proper data structure
3. **Role Validation**: Guards prevent unauthorized access
4. **Ownership Checks**: Business logic enforces data isolation

## 📋 Implementation Checklist

### ✅ Completed Features

- [x] Role-based access control implementation
- [x] Data isolation for patient users
- [x] Admin-only user management functions
- [x] Self-service profile management
- [x] Proper error handling and HTTP status codes
- [x] Swagger documentation with security requirements
- [x] TypeScript type safety
- [x] Duplicate endpoint removal
- [x] Self-deletion prevention for admins

### 🔧 Technical Improvements

- [x] Applied `JwtAuthGuard` and `RolesGuard` at controller level
- [x] Implemented proper role decorators (`@Roles()`)
- [x] Added comprehensive API documentation
- [x] Enhanced error responses with proper HTTP status codes
- [x] Cleaned up import statements and code organization

## 🚀 Usage Examples

### For Patients

```typescript
// Patients can only access their own data
GET / api / v1 / users / profile / me; // ✅ Own profile
PUT / api / v1 / users / profile / me; // ✅ Update own profile
GET / api / v1 / users / preferences / me; // ✅ Own preferences
GET / api / v1 / users / 123; // ❌ Other user's profile (403 Forbidden)
```

### For Staff/Veterinarians

```typescript
// Staff and vets can view and update any user
GET / api / v1 / users; // ✅ List all users
GET / api / v1 / users / 123; // ✅ View any user
PUT / api / v1 / users / 123; // ✅ Update any user
DELETE / api / v1 / users / 123; // ❌ Delete users (403 Forbidden)
```

### For Admins

```typescript
// Admins have full access
POST / api / v1 / users; // ✅ Create users
GET / api / v1 / users; // ✅ List all users
GET / api / v1 / users / 123; // ✅ View any user
PUT / api / v1 / users / 123; // ✅ Update any user
DELETE / api / v1 / users / 123; // ✅ Delete users (except self)
```

## 🔍 Testing Security

### Test Scenarios

1. **Patient Access Tests**
   - ✅ Can access own profile
   - ❌ Cannot access other users' profiles
   - ❌ Cannot list all users
   - ❌ Cannot create/delete users

2. **Staff Access Tests**
   - ✅ Can view all users
   - ✅ Can update any user
   - ❌ Cannot delete users
   - ❌ Cannot access admin functions

3. **Admin Access Tests**
   - ✅ Can perform all operations
   - ❌ Cannot delete own account
   - ✅ Can manage all users

### Security Headers

```bash
# Required for all protected endpoints
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📚 Related Documentation

- [Authentication Guide](../AUTHENTICATION_README.md)
- [API Reference](../API_REFERENCE.md)
- [Role Management](../ROLE_MANAGEMENT.md)
- [Security Best Practices](../SECURITY_BEST_PRACTICES.md)

## 🆘 Troubleshooting

### Common Issues

1. **403 Forbidden Errors**
   - Check user role permissions
   - Verify ownership for patient operations
   - Ensure proper JWT token

2. **401 Unauthorized Errors**
   - Verify JWT token validity
   - Check token expiration
   - Ensure proper authentication

3. **Role Access Issues**
   - Verify user role in database
   - Check role guard configuration
   - Ensure proper role decorators

### Debug Mode

Enable debug logging to troubleshoot access control issues:

```typescript
// In development environment
this.logger.debug(`User ${req.user.id} with role ${req.user.role} accessing ${id}`);
```

## 🔄 Future Enhancements

### Planned Features

- [ ] Audit logging for all user operations
- [ ] Rate limiting for profile updates
- [ ] Two-factor authentication for admin operations
- [ ] User activity monitoring
- [ ] Advanced role permissions (granular access control)

### Security Improvements

- [ ] Session management enhancements
- [ ] IP-based access restrictions
- [ ] Advanced threat detection
- [ ] Compliance reporting tools

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team  
**Security Level**: Production Ready
