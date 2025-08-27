# 🔐 User Security Quick Reference

## 🚀 Quick Start

### Controller Setup
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  // All endpoints automatically protected
}
```

### Role Decorators
```typescript
@Roles(UserRole.ADMIN)                    // Admin only
@Roles(UserRole.ADMIN, UserRole.STAFF)    // Multiple roles
// No decorator = All authenticated users
```

## 👥 Role Permissions

| Role | Create | Read All | Read Any | Update Any | Update Own | Delete | Admin Functions |
|------|--------|----------|----------|------------|------------|--------|-----------------|
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **VETERINARIAN** | ❌ | ✅ (Patients + Vets) | ✅ (Patients + Vets) | ✅ (Patients + Vets) | ✅ | ❌ | ❌ |
| **STAFF** | ❌ | ✅ (Patients + Staff) | ✅ (Patients + Staff) | ✅ (Patients + Staff) | ✅ | ❌ | ❌ |
| **PATIENT** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

## 🔒 Endpoint Security

### Admin Only
```typescript
@Post()           // Create users
@Delete(':id')    // Delete users
@Roles(UserRole.ADMIN)
```

### Staff/Vets/Admins (Role-Based Filtering)
```typescript
@Get()            // List users (filtered by role)
@Get('search/email')  // Search users (filtered by role)
@Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF)
```

### Role-Based with Ownership
```typescript
@Get(':id')       // View user (role-based access + ownership)
@Put(':id')       // Update user (role-based access + ownership)
// No @Roles decorator - logic handled in method
```

### All Authenticated Users
```typescript
@Get('profile/me')        // Own profile
@Put('profile/me')        // Update own profile
@Get('preferences/me')    // Own preferences
// No @Roles decorator needed
```

## 🛡️ Security Patterns

### Role-Based Access Control
```typescript
async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
  const currentUserRole = req.user.role as UserRole;
  
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
}
```

### Self-Deletion Prevention
```typescript
async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
  // Prevent admin from deleting themselves
  if (req.user.id === id) {
    throw new ForbiddenException('You cannot delete your own account');
  }
  
  return this.usersService.remove(id);
}
```

## 📝 Common Patterns

### Adding New Protected Endpoint
```typescript
@Get('new-endpoint')
@Roles(UserRole.ADMIN, UserRole.STAFF)  // Specify required roles
@ApiOperation({ summary: 'Description (Role requirements)' })
@ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
async newEndpoint() {
  // Implementation
}
```

### Adding Ownership-Based Endpoint
```typescript
@Get('user-data/:id')
@ApiOperation({ summary: 'Get user data (Staff/Vets can access any, Patients only own)' })
async getUserData(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
  // Check role-based access
  if ([UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.STAFF].includes(req.user.role as UserRole)) {
    return this.service.getData(id);
  }
  
  // Check ownership
  if (req.user.id !== id) {
    throw new ForbiddenException('Access denied');
  }
  
  return this.service.getData(id);
}
```

## 🚨 Error Handling

### Standard Error Responses
```typescript
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
@ApiResponse({ status: 404, description: 'User not found' })
```

### Exception Types
```typescript
throw new ForbiddenException('You can only view your own profile');
throw new UnauthorizedException('Invalid credentials');
throw new NotFoundException('User not found');
```

## 🔍 Testing

### Test User Roles
```typescript
// Test data
const adminUser = { id: '1', role: UserRole.ADMIN };
const patientUser = { id: '2', role: UserRole.PATIENT };
const staffUser = { id: '3', role: UserRole.STAFF };
```

### Test Scenarios
```typescript
// Patient accessing own profile
expect(patientUser.id).toBe('2'); // ✅ Should work

// Patient accessing other profile
expect(patientUser.id).toBe('1'); // ❌ Should fail with 403

// Staff accessing any profile
expect(staffUser.role).toBe(UserRole.STAFF); // ✅ Should work
```

## 📚 Related Files

- **Controller**: `src/modules/users/users.controller.ts`
- **Guards**: `src/modules/auth/guards/`
- **Decorators**: `src/modules/auth/decorators/roles.decorator.ts`
- **Entities**: `src/modules/users/entities/user.entity.ts`
- **Full Documentation**: `docs/USER_SECURITY_IMPLEMENTATION.md`

## ⚡ Quick Commands

### Check Security
```bash
pnpm lint:check          # Check for security issues
pnpm build              # Build to verify types
pnpm test:security      # Run security tests
```

### Generate Documentation
```bash
pnpm docs:generate      # Generate API docs
pnpm swagger:test       # Test Swagger endpoints
```

---

**Remember**: Always test role-based access control with different user types!
