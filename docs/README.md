# Clinic Management API Documentation

## Overview
This is the API documentation for the AI-Powered Pet Clinic Management Platform Backend.

## API Statistics
- **Total Endpoints**: 210
- **Total Controllers**: 18
- **Authentication Required**: 175
- **Public Endpoints**: 35

## HTTP Methods
- GET: 114
- POST: 58
- PUT: 6
- DELETE: 15
- PATCH: 17

## API Controllers
- Analytics
- Appointments
- Auth
- Breeds
- Clinics
- Dashboard
- FAQ
- Health
- Pets
- Rate-limit-monitor
- Reviews
- Settings
- Static-files
- Users
- ai-health
- contact
- file-upload
- social-media

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
