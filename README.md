# Borzolini Service - Pet Clinic Management Platform

NestJS backend for managing pet clinics, telemedicine consultations, and AI-powered health monitoring.

## MVP Configuration

For the MVP release, Elasticsearch and Kibana are disabled by default to reduce complexity and resource requirements. See [MVP Configuration Guide](docs/MVP_CONFIGURATION.md) for details.

### Quick MVP Start:

```bash
# Copy environment template
cp config.env.local.template config.env.local

# Start only essential services
docker-compose up -d clinic-db

# Run the application
pnpm run start:dev
```

## Features

### Core Platform
- Multi-role clinic management (Admin, Doctor, Assistant, Staff)
- Pet health profiles with medical history tracking
- Appointment booking and scheduling
- JWT-based authentication and authorization

### AI Health Monitoring
- AI-powered health recommendations using OpenAI GPT-4
- Breed-specific health insights
- Proactive health alerts based on pet profile analysis

### Telemedicine
- Video consultation support via Daily.co API
- Consultation record management
- Follow-up appointment scheduling

### Analytics
- Privacy-focused analytics via Umami
- API usage tracking
- User activity monitoring

## Tech Stack

- **Framework**: NestJS 10+ with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **AI Integration**: OpenAI GPT-4 for health analysis
- **Video Calls**: Daily.co API for telemedicine
- **File Storage**: Local file system (development) / Supabase Storage (production)
- **Email**: SMTP for notifications
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
src/
├── common/           # Shared utilities and services
├── config/           # Configuration files
├── modules/          # Feature modules
│   ├── auth/         # Authentication & authorization
│   ├── users/        # User management
│   ├── clinics/      # Clinic management
│   ├── pets/         # Pet health monitoring
│   ├── appointments/ # Appointment booking
│   ├── telemedicine/ # Video consultations
│   ├── ai-health/    # AI health insights
│   ├── social-media/ # Instagram integration
│   ├── analytics/    # Privacy-focused analytics tracking
│   └── payments/     # Payment processing
└── main.ts           # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose (for local PostgreSQL)
- OpenAI API key (for AI features)
- Daily.co API key (for telemedicine, optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/shayanea/borzolini-service.git
   cd borzolini-service
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   # For local development (recommended)
   cp config.env.local.template config.env.local
   # Edit config.env.local with your configuration

   # Or use the example file
   cp config.env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**

   ```bash
   # Start local PostgreSQL with Docker
   docker compose up -d postgres

   # Or create PostgreSQL database manually
   createdb borzolini_clinic
   ```

5. **Run the application**

   ```bash
   # Development mode
   pnpm run start:dev

   # Production build
   pnpm run build
   pnpm run start:prod
   ```

### Quick Start with Local Development

For the fastest setup experience:

```bash
# 1. Clone and setup
git clone https://github.com/shayanea/borzolini-service.git
cd borzolini-service

# 2. Copy environment template
cp config.env.local.template config.env.local

# 3. Update OpenAI API key in config.env.local
# Get your key from: https://platform.openai.com/api-keys

# 4. Start local database
docker compose up -d postgres

# 5. Install dependencies and run
pnpm install
pnpm run start:dev

# 6. Open Swagger UI
open http://localhost:3001/api/docs
```

## Configuration

### Environment Variables

Key configuration options in `.env`:

- **Database**: PostgreSQL connection details
- **JWT**: Authentication secrets and expiration
- **OpenAI**: API key for AI health monitoring
- **Daily.co**: Telemedicine video call API
- **AWS S3**: File storage configuration
- **Email**: SMTP settings for notifications

### Database Schema

The application uses TypeORM entities for:

- Users (clinic staff, pet owners)
- Clinics and clinic details
- Pets and health records
- Appointments and consultations
- AI health insights and patterns

## API Documentation

Once running, access the interactive API documentation at:

- **Swagger UI**: `http://localhost:3001/api/docs`
- **API Base URL**: `http://localhost:3001/api/v1`

## Development Scripts

See [docs/SCRIPTS.md](docs/SCRIPTS.md) for available development utilities including token generation, database migrations, and testing tools.

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t borzolini-service .

# Run container
docker run -p 3001:3001 --env-file .env borzolini-service
```

### Manual Deployment

1. Build the application: `pnpm run build`
2. Set production environment variables
3. Use PM2 or similar process manager
4. Configure reverse proxy (Nginx)

## Security Features

- Helmet.js for security headers
- Rate limiting to prevent API abuse
- Input validation and sanitization
- JWT-based authentication with refresh tokens
- CORS configuration
- Role-based access control (RBAC)
- Data isolation by user and role

See [docs/USER_SECURITY_IMPLEMENTATION.md](docs/USER_SECURITY_IMPLEMENTATION.md) for detailed security implementation.

## AI Health Monitoring

AI-powered health monitoring using OpenAI GPT-4:
- Symptom analysis and health assessment
- Breed-specific health recommendations
- Proactive health alerts
- Health trend analysis

## Telemedicine

Video consultation features via Daily.co:
- Remote video consultations
- Consultation documentation
- Follow-up scheduling

## Monitoring & Logging

- Application health checks
- Error tracking and logging
- Performance metrics
- User activity audit trails

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
