# Local Development Setup

Setting up the API on your local machine is pretty straightforward. You have a couple of options depending on whether you want to use Docker or not.

## What You'll Need

- Node.js 18+ (check with `node -v`)
- pnpm (`npm install -g pnpm` if you don't have it)
- Docker & Docker Compose (easiest way to run PostgreSQL)
- Git (obviously)

## Quick Start with Docker

### 1. Fire Up PostgreSQL

```bash
# Start PostgreSQL in Docker
docker compose up -d postgres

# Check if it's running
docker compose ps

# If something's wrong, check the logs
docker compose logs postgres
```

**Tip:** The database will persist data even when you stop the container. If you want a fresh start, run `docker compose down -v` to wipe everything.

### 2. Configure Your Environment

```bash
# Copy the local config (it has good defaults)
cp config.env.local .env.local

# Open it and add your OpenAI key if you want AI features
nano .env.local
```

The defaults work out of the box for local dev. You only need to change things if you're testing specific features.

### 3. Install and Build

```bash
# Install dependencies
pnpm install

# Build TypeScript (or skip this and just use start:dev)
pnpm run build
```

**Note:** `start:dev` watches for changes and rebuilds automatically, so you don't need to run `build` manually during development.

### 4. Run Migrations

```bash
# Create the database tables
pnpm run migrate
```

If you get connection errors, make sure PostgreSQL is running (`docker compose ps`).

### 5. Start the Server

```bash
# This will watch for changes and auto-reload
pnpm run start:dev
```

You should see output like:

```
[Nest] 12345  - Application is running on: http://localhost:3001
```

## Where Everything Lives

Once it's running, here's what you can access:

- **Swagger UI**: http://localhost:3001/api/docs (start here - it's interactive!)
- **API Base**: http://localhost:3001/api/v1
- **Health Check**: http://localhost:3001/api/v1/health (returns 200 if everything's ok)
- **PostgreSQL**: localhost:5432 (use TablePlus, pgAdmin, or any Postgres client)
- **PgAdmin**: http://localhost:5050 (if you uncommented it in docker-compose.yml)

## Database Config

The Docker setup uses these defaults:

- **Host**: localhost
- **Port**: 5432
- **Database**: borzolini_clinic
- **User/Pass**: postgres/postgres

You can connect with any Postgres client using these credentials. If you want to change them, edit `docker-compose.yml` and update your `.env.local` to match.

```bash
# These are already set in config.env.local
USE_LOCAL_DB=true
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=5432
LOCAL_DB_USERNAME=postgres
LOCAL_DB_PASSWORD=postgres
LOCAL_DB_NAME=borzolini_clinic
```

**Pro tip:** Use TablePlus or DBeaver for a nice GUI to browse your database.

## Switching to Supabase

If you want to test against Supabase instead of local Postgres:

```bash
# In your .env.local, change this
USE_LOCAL_DB=false

# And add your Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Restart the server and it'll connect to Supabase instead.

## Test Data

After running `pnpm run seed`, you get a bunch of test accounts:

**Test Accounts** (all use password `Password123!`):

- `admin@borzolini.com` - Admin user
- `dr.smith@borzolini.com` - Veterinarian
- `nurse.wilson@borzolini.com` - Staff member
- `john.doe@example.com` - Patient (pet owner)
- `jane.smith@example.com` - Patient (verified)
- Plus a few more patients and vets

**Test Data Includes:**

- 5 clinics across different cities
- 10+ pets (dogs, cats) with profiles
- Multiple appointments (past and upcoming)
- User preferences and activity logs

This gives you realistic data to test with. If you need a fresh start, just drop the database and re-run migrations + seed.

## File Storage Options

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

## Development Commands

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

## Troubleshooting

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

## Database Schema

The local database includes all tables:

- **Users & Authentication**: `users`, `user_preferences`, `user_activities`
- **Clinics**: `clinics`, `clinic_services`, `clinic_staff`, `clinic_reviews`
- **Pets**: `pets`
- **Appointments**: `appointments`, `clinic_appointments`
- **AI Health**: `ai_health_insights`

## Authentication

For testing protected endpoints:

1. **Register a user**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login`
3. **Use JWT token**: Add `Authorization: Bearer <token>` header

## AI Health Module

The new AI Health module provides:

- **Smart Recommendations**: AI-powered pet health insights
- **Health Monitoring**: Track pet health trends
- **Preventive Care**: Early warning system for health issues
- **Fallback System**: Rule-based recommendations when AI is unavailable

### Key Endpoints

- `POST /api/v1/ai-health/recommendations` - Generate AI recommendations
- `GET /api/v1/ai-health/pets/{petId}/insights` - Get pet insights
- `GET /api/v1/ai-health/dashboard/{petId}` - Health dashboard

## Testing

```bash
# Run unit tests
pnpm run test
# Run e2e tests
pnpm run test:e2e
# Run tests with coverage
pnpm run test:cov
```

## Code Quality

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

## Production Build

```bash
# Build for production
pnpm run build:prod
# Start production server
pnpm run start:prod
```

## Additional Resources

- **API Documentation**: [Swagger UI](http://localhost:3001/api/docs)
- **Database Schema**: Check `src/database/migrations/`
- **Module Documentation**: Check `src/modules/*/README.md`
- **Configuration**: Check `src/config/`

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs: `docker compose logs postgres`
3. Check the API health: `curl http://localhost:3001/api/v1/health`
4. Verify environment variables in `.env.local`

---

**Happy coding! **
The Borzolini Clinic API is now ready for local development with a PostgreSQL database and all modules including the new AI Health system.
