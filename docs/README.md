# Clinic Management API Documentation

## Overview
This is the API documentation for the AI-Powered Pet Clinic Management Platform Backend.

## API Statistics
- **Total Endpoints**: 1
- **Total Controllers**: 3
- **Authentication Required**: 0
- **Public Endpoints**: 1

## HTTP Methods
- GET: 1
- POST: 0
- PUT: 0
- DELETE: 0
- PATCH: 0

## API Controllers
- auth
- users
- health

## Authentication
Most endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
http://localhost:3001
```

## Interactive Documentation
Access the interactive Swagger UI at: http://localhost:3001/api/docs

## File Structure
- `swagger.json` - Complete OpenAPI specification
- `api-stats.json` - API statistics and metadata
- `README.md` - This documentation file

## Getting Started
1. Start the application: `pnpm start:dev`
2. Open Swagger UI: http://localhost:3001/api/docs
3. Use the interactive documentation to explore endpoints
4. Test endpoints directly from the UI

## Notes
- All timestamps are in ISO 8601 format
- IDs are UUIDs
- Error responses follow standard HTTP status codes
- Request/response examples are provided in the Swagger UI

## Features
- **Cookie-based Authentication**: Secure JWT tokens stored in HTTP-only cookies
- **Role-based Access Control**: Admin, Veterinarian, Staff, and Patient roles
- **User Management**: Complete user lifecycle management
- **Health Monitoring**: System health checks and monitoring
- **TypeScript**: Full TypeScript support with strict type checking
