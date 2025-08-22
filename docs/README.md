# 📚 Borzolini Clinic API Documentation

## Overview

This directory contains comprehensive documentation for the Borzolini Clinic API, including auto-generated Swagger/OpenAPI specifications and detailed endpoint documentation.

## 📁 Files

- **`swagger.json`** - OpenAPI 3.0 specification in JSON format
- **`swagger.yaml`** - OpenAPI 3.0 specification in YAML format
- **`api-stats.json`** - API statistics and metrics
- **`API_REFERENCE.md`** - Auto-generated markdown documentation
- **`API_ENDPOINTS.md`** - Detailed endpoint documentation with examples

## 🚀 Quick Start

### View Interactive Documentation

1. Start the development server:

   ```bash
   cd api
   pnpm run start:dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3001/api/docs
   ```

### Generate Documentation Files

```bash
# Generate all documentation files
pnpm run docs:generate

# Start server and open docs in browser
pnpm run docs:serve
```

## 📊 API Overview

The Borzolini Clinic API provides comprehensive endpoints for:

- **🔐 Authentication & Security** - User registration, login, verification
- **👥 User Management** - Profile management, preferences, activity tracking
- **🏥 Clinic Management** - Clinic profiles and service management
- **🐕 Pet Health Monitoring** - Pet profiles and health tracking
- **📅 Appointment System** - Booking and scheduling
- **🤖 AI Health Insights** - Machine learning-powered recommendations
- **🎥 Telemedicine** - Video consultation capabilities

## 🔧 Authentication

All protected endpoints require JWT authentication:

```bash
# Example API call
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/v1/users/profile
```

## 📱 Sample Usage

### Register a New User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePass123!"
  }'
```

### Get User Profile

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/v1/users/profile
```

## 🧪 Testing

### Sample Test Users

The seeded database includes these test accounts:

| Email                  | Password     | Role         | Status   |
| ---------------------- | ------------ | ------------ | -------- |
| admin@borzolini.com    | Password123! | Admin        | Verified |
| dr.smith@borzolini.com | Password123! | Veterinarian | Verified |
| john.doe@example.com   | Password123! | Patient      | Verified |

### API Testing Tools

- **Swagger UI**: Interactive testing at `/api/docs`
- **Postman**: Import the OpenAPI spec from `swagger.json`
- **curl**: Use the examples in `API_ENDPOINTS.md`
- **HTTPie**: Modern command-line HTTP client

## 🔄 Updating Documentation

The documentation is automatically generated from the NestJS decorators and DTOs. To update:

1. **Modify the code** - Update controllers, DTOs, or decorators
2. **Regenerate docs** - Run `pnpm run docs:generate`
3. **Review changes** - Check the updated files in this directory
4. **Commit updates** - Include documentation changes in your commits

## 📋 Documentation Standards

### Controller Documentation

```typescript
@ApiOperation({
  summary: 'Brief description',
  description: 'Detailed explanation of what this endpoint does'
})
@ApiResponse({
  status: 200,
  description: 'Success response description',
  schema: {
    example: {
      // Sample response object
    }
  }
})
```

### DTO Documentation

```typescript
export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
```

## 🌐 Environment-Specific Documentation

### Development

- **Base URL**: `http://localhost:3001/api/v1`
- **Docs URL**: `http://localhost:3001/api/docs`

### Production

- **Base URL**: `https://api.borzolini.com/api/v1`
- **Docs URL**: `https://api.borzolini.com/api/docs`

## 🔍 Troubleshooting

### Common Issues

1. **Documentation not updating**
   - Clear NestJS cache: `rm -rf dist/`
   - Regenerate: `pnpm run docs:generate`

2. **Swagger UI not loading**
   - Check server is running: `pnpm run start:dev`
   - Verify port 3001 is available

3. **Authentication errors**
   - Ensure JWT token is valid and not expired
   - Check Bearer token format: `Bearer <token>`

### Getting Help

- **API Issues**: Check the logs in the console
- **Documentation**: Review the generated files in this directory
- **Authentication**: Verify tokens at [jwt.io](https://jwt.io)

## 📈 Metrics

The API includes comprehensive metrics tracking:

- **Total Endpoints**: Auto-calculated
- **Method Distribution**: GET, POST, PATCH, DELETE counts
- **Tag Coverage**: Organized by functional areas
- **Response Codes**: Standard HTTP status codes

## 🤝 Contributing

When adding new endpoints:

1. Add comprehensive Swagger decorators
2. Include request/response examples
3. Document all possible error responses
4. Run `pnpm run docs:generate` to update docs
5. Test the endpoint in Swagger UI

---

**Last Updated**: Auto-generated on documentation build  
**API Version**: 1.0.0  
**Documentation Version**: 1.0.0
