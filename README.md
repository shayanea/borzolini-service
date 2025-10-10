# Borzolini Service - Pet Clinic Management Platform

NestJS backend for managing pet clinics, telemedicine consultations, and AI-powered health monitoring.

## MVP Configuration

We've disabled Elasticsearch and Kibana by default for the MVP to keep things simple and reduce resource usage during development. If you need search later, check out the [MVP Configuration Guide](docs/MVP_CONFIGURATION.md) for how to enable it.

### Quick MVP Start:

```bash
# Copy the environment template
cp config.env.local.template config.env.local

# Start just the database (that's all you need for local dev)
docker-compose up -d clinic-db

# Fire it up
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
├── common/ # Shared utilities and services
├── config/ # Configuration files
├── modules/ # Feature modules
│ ├── auth/ # Authentication & authorization
│ ├── users/ # User management
│ ├── clinics/ # Clinic management
│ ├── pets/ # Pet health monitoring
│ ├── appointments/ # Appointment booking
│ ├── telemedicine/ # Video consultations
│ ├── ai-health/ # AI health insights
│ ├── social-media/ # Instagram integration
│ ├── analytics/ # Privacy-focused analytics tracking
│ └── payments/ # Payment processing
└── main.ts # Application entry point
```

## Getting Started

### What You'll Need

- Node.js 18+ and pnpm (we use pnpm for package management)
- Docker and Docker Compose (makes local PostgreSQL setup super easy)
- OpenAI API key (grab one from platform.openai.com if you want AI features)
- Daily.co API key (only if you're testing telemedicine)

### Installation

1. **Clone and install**

   ```bash
   git clone https://github.com/shayanea/borzolini-service.git
   cd borzolini-service
   pnpm install
   ```

2. **Set up your environment**

   ```bash
   # For local dev, use this template (it has sane defaults)
   cp config.env.local.template config.env.local
   # Open config.env.local and add your API keys
   ```

3. **Get the database running**

   ```bash
   # Easiest way - let Docker handle it
   docker compose up -d postgres

   # Or if you have PostgreSQL installed locally
   createdb borzolini_clinic
   ```

4. **Start developing**

   ```bash
   # This will watch for changes and auto-reload
   pnpm run start:dev

   # For production builds
   pnpm run build
   pnpm run start:prod
   ```

### TL;DR - Fastest Setup

If you just want to get this running right now:

```bash
# Clone it
git clone https://github.com/shayanea/borzolini-service.git
cd borzolini-service

# Copy the env file (edit it after to add your OpenAI key)
cp config.env.local.template config.env.local

# Start the database
docker compose up -d postgres

# Install and run
pnpm install
pnpm run start:dev

# Check out the API docs at http://localhost:3001/api/docs
```

**Note:** You'll need to add your OpenAI API key in `config.env.local` for AI features to work. Get one from https://platform.openai.com/api-keys

## Configuration

### Environment Variables

Here's what you'll need to configure in your `.env` file:

- **Database**: PostgreSQL connection (if using Docker, these are auto-configured)
- **JWT**: Secret keys for auth tokens (change these from the defaults!)
- **OpenAI**: Your API key for the AI health features
- **Daily.co**: For video calls (optional, only needed if testing telemedicine)
- **AWS S3**: File storage (or use local storage for dev)
- **Email**: SMTP for sending emails (use a test service like Mailtrap for dev)

### Database Schema

We're using TypeORM for the database layer. Main entities:

- **Users** - clinic staff and pet owners
- **Clinics** - clinic info and services
- **Pets** - health records, vaccinations, etc.
- **Appointments** - booking and scheduling
- **AI Insights** - health recommendations and alerts

TypeORM handles migrations automatically, so you don't need to worry about schema changes.

## API Documentation

Access API documentation at:

- **Swagger UI**: `http://localhost:3001/api/docs`
- **API Base URL**: `http://localhost:3001/api/v1`

## Development Scripts

See [docs/SCRIPTS.md](docs/SCRIPTS.md) for utilities: token generation, database migrations, testing tools.

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

### Docker (Easiest Way)

```bash
# Build the image
docker build -t borzolini-service .

# Run it (make sure your .env file has production values)
docker run -p 3001:3001 --env-file .env borzolini-service
```

### Manual Deployment

If you're not using Docker:

1. Build: `pnpm run build`
2. Set your production env vars
3. Use PM2 or similar to keep it running (`pm2 start dist/main.js`)
4. Put Nginx in front of it for HTTPS and load balancing

## Security

We've got you covered on the security front:

- **Helmet.js** - sets secure HTTP headers
- **Rate limiting** - prevents API abuse (adjust limits in the env file)
- **Input validation** - using class-validator on all DTOs
- **JWT auth** - with refresh tokens so users don't have to log in constantly
- **CORS** - configured for your frontend URLs
- **RBAC** - role-based permissions (admin, vet, staff, patient)
- **Data isolation** - users can only see their own data (unless they're staff)

Check [USER_SECURITY_IMPLEMENTATION.md](docs/USER_SECURITY_IMPLEMENTATION.md) for the full details on how this all works.

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
