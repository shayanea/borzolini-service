# 🐾 Borzolini Clinic API


      ## AI-Powered Pet Clinic Management Platform

      **Borzolini Clinic** is a comprehensive telemedicine and clinic management platform designed specifically for veterinary practices. Our platform combines traditional veterinary care with cutting-edge AI technology to provide superior pet healthcare services.

      ### 🚀 Key Features
      - **🔐 Advanced Authentication System** - Secure user management with role-based access control
      - **👥 Multi-Role Support** - Admin, Veterinarian, Staff, and Patient roles
      - **📧 Email & Phone Verification** - Comprehensive verification system
      - **📊 User Activity Tracking** - Complete audit trail and analytics
      - **⚙️ User Preferences Management** - Customizable notification and privacy settings
      - **🏥 Clinic Management** - Complete clinic profile and service management
      - **🐕 Pet Health Monitoring** - AI-powered health insights and monitoring
      - **📅 Appointment System** - Advanced booking and scheduling system
      - **🎥 Telemedicine** - Video consultation capabilities
      - **🤖 AI Health Insights** - Machine learning-powered health recommendations

      ### 🔒 Security Features
      - JWT-based authentication with refresh tokens
      - Account locking after failed login attempts
      - Comprehensive activity logging
      - Role-based access control (RBAC)
      - Email and phone verification
      - Password reset functionality

      ### 🏗️ Architecture
      - **Backend**: NestJS with TypeScript
      - **Database**: PostgreSQL with TypeORM
      - **Authentication**: JWT with refresh tokens
      - **Email**: SMTP with HTML templates
      - **Documentation**: OpenAPI 3.0 (Swagger)

      ### 📱 Mobile & Web Ready
      Our API is designed to support both web and mobile applications with comprehensive REST endpoints.

      ### 🌍 Multi-Language Support
      The platform supports multiple languages and timezones for international use.

      ### 🧪 Sample Users (Development)
      | Email | Password | Role | Status |
      |-------|----------|------|---------|
      | admin@borzolini.com | Password123! | Admin | Verified |
      | dr.smith@borzolini.com | Password123! | Veterinarian | Verified |
      | john.doe@example.com | Password123! | Patient | Verified |

      ---
      **Version**: 1.0.0  
      **Environment**: development  
      **Base URL**: `/api/v1`
    

## API Statistics

- **Total Endpoints**: 27
- **Total Operations**: 32
- **Tags**: 2
- **Version**: 1.0.0
- **Generated**: 2025-08-22T17:05:37.658Z

### HTTP Methods Distribution

- **GET**: 14 endpoints
- **POST**: 14 endpoints
- **PATCH**: 3 endpoints
- **DELETE**: 1 endpoints

### Available Tags

- auth
- users

## Authentication

This API uses JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Base URLs

- **Development**: `http://localhost:3001/api/v1`
- **Production**: `https://api.borzolini.com/api/v1`

## Contact & Support

- **Team**: Borzolini Clinic Team
- **Website**: https://borzolini.com
- **Email**: support@borzolini.com

---

*This documentation was auto-generated from the OpenAPI specification.*
