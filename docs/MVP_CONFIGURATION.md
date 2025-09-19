# MVP Configuration Guide

This document outlines the simplified configuration for the Borzolini Clinic API MVP release.

## 🎯 MVP Philosophy

The MVP focuses on core functionality with minimal complexity:

- **Database**: PostgreSQL only (no Elasticsearch)
- **Search**: Database-based search (no advanced search features)
- **Analytics**: Basic analytics (no advanced indexing)
- **Deployment**: Simplified Docker setup

## 🚫 Disabled Features for MVP

### Elasticsearch & Kibana

- **Status**: Disabled by default
- **Reason**: Reduces resource requirements and deployment complexity
- **Impact**: Search functionality uses database queries instead of advanced indexing

### Advanced Analytics

- **Status**: Basic analytics only
- **Reason**: Focus on core clinic management features
- **Impact**: Standard reporting without advanced data insights

## ✅ Enabled Features for MVP

### Core Functionality

- ✅ User authentication and authorization
- ✅ Clinic management
- ✅ Pet health monitoring
- ✅ Appointment scheduling
- ✅ Basic analytics and reporting
- ✅ Email notifications
- ✅ File uploads
- ✅ API documentation (Swagger)

### Database

- ✅ PostgreSQL with TypeORM
- ✅ Database migrations
- ✅ Seed data

### Security

- ✅ JWT authentication
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Input validation

## 🔧 Configuration Files

### Environment Variables

- `config.env.local.template` - Local development (Elasticsearch disabled)
- `config.env.example` - Example configuration (Elasticsearch disabled)

### Docker Services

- `docker-compose.yml` - Elasticsearch and Kibana services commented out

### Application Modules

- `src/common/common.module.ts` - Elasticsearch conditionally loaded

## 🚀 Quick Start (MVP)

1. **Copy environment template:**

   ```bash
   cp config.env.local.template config.env.local
   ```

2. **Update configuration:**
   - Set your database credentials
   - Configure JWT secrets
   - Set up email settings (optional)

3. **Start services:**

   ```bash
   docker-compose up -d clinic-db
   ```

4. **Run the application:**
   ```bash
   pnpm run start:dev
   ```

## 📈 Post-MVP: Enabling Advanced Features

### To Enable Elasticsearch:

1. Set `ELASTICSEARCH_ENABLED=true` in your environment
2. Uncomment Elasticsearch services in `docker-compose.yml`
3. Configure Elasticsearch connection settings
4. Restart the application

### To Enable Advanced Analytics:

1. Enable Elasticsearch first
2. Configure Umami analytics
3. Set up advanced reporting features

## 🔍 Verification

### Check Elasticsearch Status:

```bash
# Should show "Elasticsearch disabled" in logs
pnpm run start:dev
```

### Verify Docker Services:

```bash
# Should only show clinic-db and umami services
docker-compose ps
```

### Test Core Functionality:

- API documentation: `http://localhost:3001/api/docs`
- Health check: `http://localhost:3001/api/v1/health`
- Database connection: Check application logs

## 📝 Notes

- All Elasticsearch-related code remains in the codebase but is conditionally loaded
- No breaking changes when enabling Elasticsearch post-MVP
- Database search functionality provides adequate search capabilities for MVP
- Resource usage significantly reduced without Elasticsearch

## 🆘 Troubleshooting

### If Elasticsearch is still trying to connect:

1. Check `ELASTICSEARCH_ENABLED=false` in your environment file
2. Restart the application
3. Check application logs for confirmation

### If Docker services fail to start:

1. Ensure Elasticsearch services are commented out in `docker-compose.yml`
2. Run `docker-compose down` and `docker-compose up -d` again
