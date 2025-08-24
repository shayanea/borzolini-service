# 🚀 Local Development Setup Guide

This guide will help you set up the Borzolini Clinic API locally for development.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended package manager)
- **Docker & Docker Compose** (for local PostgreSQL)
- **Git**

## 🐳 Quick Start with Docker

### 1. Start Local PostgreSQL Database

```bash
# Start PostgreSQL container
docker compose up -d postgres

# Check status
docker compose ps

# View logs
docker compose logs postgres
```

### 2. Environment Configuration

```bash
# Copy local environment file
cp config.env.local .env.local

# Edit if needed (defaults are already configured for local development)
nano .env.local
```

### 3. Install Dependencies

```bash
# Install all dependencies
pnpm install
```

### 4. Build the Project

```bash
# Build TypeScript
pnpm run build
```

### 5. Run Database Migrations

```bash
# Run all migrations
pnpm run migrate
```

### 6. Start Development Server

```bash
# Start in development mode
pnpm run start:dev
```

## 🌐 Access Points

- **API Base URL**: `http://localhost:3001/api/v1`
- **Health Check**: `http://localhost:3001/api/v1/health`
- **Swagger UI**: `http://localhost:3001/api/docs`
- **PostgreSQL**: `localhost:5432`
- **PgAdmin**: `http://localhost:5050` (if enabled)

## 🗄️ Database Configuration

### Local PostgreSQL (Default)
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `borzolini_clinic`
- **Username**: `postgres`
- **Password**: `postgres`

### Environment Variables
```bash
USE_LOCAL_DB=true
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=5432
LOCAL_DB_USERNAME=postgres
LOCAL_DB_PASSWORD=postgres
LOCAL_DB_NAME=borzolini_clinic
```

## 🔄 Switching Between Local and Supabase

To switch back to Supabase later:

```bash
# Set environment variable
export USE_LOCAL_DB=false

# Or update .env.local
USE_LOCAL_DB=false
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📁 File Storage Options

Since Firebase Storage has costs, consider these alternatives:

### **Local Storage (Development)**
- Store files in local `./uploads` directory
- Good for development and testing
- No external costs

### **Supabase Storage (Production)**
- 1GB free storage included
- 2GB bandwidth/month free
- Integrated with your existing Supabase setup

### **Cloud Storage Alternatives**
- **AWS S3**: Pay per use, very cost-effective
- **Google Cloud Storage**: Similar pricing to Firebase
- **Azure Blob Storage**: Microsoft's cloud storage solution

## 🛠️ Development Commands

```bash
# Build project
pnpm run build

# Run migrations
pnpm run migrate

# Generate Swagger documentation
pnpm run docs:generate

# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Lint code
pnpm run lint

# Format code
pnpm run format
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker compose ps

# Restart PostgreSQL
docker compose restart postgres

# Check logs
docker compose logs postgres

# Test connection
docker compose exec postgres pg_isready -U postgres -d borzolini_clinic
```

### Port Conflicts
If port 3001 is already in use:
```bash
# Check what's using the port
lsof -i :3001

# Kill the process or change PORT in .env.local
PORT=3002
```

### Migration Issues
```bash
# Check migration status
pnpm run migrate:show

# Revert last migration if needed
pnpm run migrate:revert
```

## 📊 Database Schema

The local database includes all tables:

- **Users & Authentication**: `users`, `user_preferences`, `user_activities`
- **Clinics**: `clinics`, `clinic_services`, `clinic_staff`, `clinic_reviews`
- **Pets**: `pets`
- **Appointments**: `appointments`, `clinic_appointments`
- **AI Health**: `ai_health_insights`

## 🔐 Authentication

For testing protected endpoints:

1. **Register a user**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login`
3. **Use JWT token**: Add `Authorization: Bearer <token>` header

## 🤖 AI Health Module

The new AI Health module provides:

- **Smart Recommendations**: AI-powered pet health insights
- **Health Monitoring**: Track pet health trends
- **Preventive Care**: Early warning system for health issues
- **Fallback System**: Rule-based recommendations when AI is unavailable

### Key Endpoints
- `POST /api/v1/ai-health/recommendations` - Generate AI recommendations
- `GET /api/v1/ai-health/pets/{petId}/insights` - Get pet insights
- `GET /api/v1/ai-health/dashboard/{petId}` - Health dashboard

## 🧪 Testing

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Run tests with coverage
pnpm run test:cov
```

## 📝 Code Quality

```bash
# Lint code
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format

# Check for type errors
pnpm run build
```

## 🚀 Production Build

```bash
# Build for production
pnpm run build:prod

# Start production server
pnpm run start:prod
```

## 📚 Additional Resources

- **API Documentation**: [Swagger UI](http://localhost:3001/api/docs)
- **Database Schema**: Check `src/database/migrations/`
- **Module Documentation**: Check `src/modules/*/README.md`
- **Configuration**: Check `src/config/`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs: `docker compose logs postgres`
3. Check the API health: `curl http://localhost:3001/api/v1/health`
4. Verify environment variables in `.env.local`

---

**Happy coding! 🚀**

The Borzolini Clinic API is now ready for local development with a complete PostgreSQL database and all modules including the new AI Health system.
