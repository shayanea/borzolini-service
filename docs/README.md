# Clinic Management API Documentation

## Overview
This is the API documentation for the AI-Powered Pet Clinic Management Platform Backend.

## API Statistics
- **Total Endpoints**: 109
- **Total Controllers**: 10
- **Authentication Required**: 89
- **Public Endpoints**: 20

## HTTP Methods
- GET: 54
- POST: 34
- PUT: 4
- DELETE: 9
- PATCH: 8

## API Controllers
- ai-health
- appointments
- auth
- clinics
- file-upload
- health
- pets
- rate-limit-monitor
- static-files
- users

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
