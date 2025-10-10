# API Documentation

Welcome to the Borzolini Clinic API documentation. Start here to get your bearings.

## Getting Started

New to the project? Read these in order:

1. **[Local Development](LOCAL_DEVELOPMENT.md)** - Set up your dev environment
2. **[Environment Setup](ENVIRONMENT_SETUP.md)** - Configure your `.env` file
3. **[Authentication](AUTHENTICATION_README.md)** - How auth works

## Integration Guides

Building a frontend?

- **[API Integration Guide](API_INTEGRATION_GUIDE.md)** - Connect web/mobile apps to the API
- **[Deployment](DEPLOYMENT.md)** - Deploy to Railway, Render, or Heroku

## Feature Documentation

Specific features and how to use them:

- **[MVP Configuration](MVP_CONFIGURATION.md)** - What's enabled/disabled for MVP
- **[User Security](USER_SECURITY_IMPLEMENTATION.md)** - Role-based access control details
- **[Supabase Setup](SUPABASE_SETUP.md)** - Configure Supabase (if using)
- **[Scripts](SCRIPTS.md)** - Development utilities and commands

## Reference

Quick lookups:

- **[Swagger UI](http://localhost:3001/api/docs)** - Interactive API docs (when running)
- **Swagger JSON** - `swagger.json` in this folder
- **API Stats** - `api-stats.json` has endpoint counts

## Project Structure

```
/Users/shayan/Desktop/Projects/ideas/clinic/api/
├── src/
│   ├── modules/          # Feature modules (auth, users, pets, etc.)
│   ├── common/           # Shared utilities
│   └── config/           # Configuration files
├── docs/                 # This documentation
├── config.env.local      # Local dev config
└── docker-compose.yml    # Docker services
```

## Need Help?

1. Check the relevant doc above
2. Look at `swagger.json` for API details
3. Search the codebase for examples
4. Check module READMEs in `src/modules/*/README.md`

## Contributing

Before making changes:

1. Read the relevant feature docs
2. Follow the existing patterns
3. Update docs if you add features
4. Test locally before pushing

---

**Quick Links:**

- [Main README](../README.md) - Project overview
- [Roadmap](../ROADMAP.md) - Future plans
- [Changelog](../CHANGELOG.md) - Version history
