# Changelog

All notable changes to the Borzolini Service API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-09-04

### Added
- **Pet Case Management System**
  - Complete CRUD operations for pet cases
  - Case timeline tracking with event history
  - Advanced filtering by status, priority, case type, pet, owner, and vet
  - Pagination support for case listings
  - Case statistics and analytics dashboard
  - Support for multiple case types: consultation, follow_up, emergency, preventive, chronic_condition, post_surgery, behavioral, nutritional
  - Priority levels: low, normal, high, urgent, emergency
  - Status tracking: open, in_progress, pending_consultation, pending_visit, under_observation, resolved, closed, escalated

- **New Database Tables**
  - `clinic_pet_cases` - Main case management table
  - `clinic_case_timeline` - Event history tracking
  - Comprehensive indexes for performance optimization
  - Foreign key constraints for data integrity

- **New API Endpoints**
  - `POST /clinics/:id/cases` - Create new pet case
  - `GET /clinics/:id/cases` - List cases with advanced filtering
  - `GET /clinics/:id/cases/:caseId` - Get specific case details
  - `PUT /clinics/:id/cases/:caseId` - Update case information
  - `GET /clinics/:id/cases/:caseId/timeline` - Get case timeline
  - `POST /clinics/:id/cases/:caseId/timeline` - Add timeline event
  - `GET /clinics/:id/cases/stats` - Get case statistics

- **Enhanced CORS Support**
  - Added support for localhost:3002 and 127.0.0.1:3002

### Changed
- Enhanced ClinicsController with pet case management endpoints
- Updated entity relationships to support case management
- Improved error handling and validation

### Technical Details
- **Database Migration**: 009-create-pet-cases-tables.sql
- **New Services**: ClinicPetCaseService with comprehensive case management
- **New DTOs**: CreatePetCaseDto, UpdatePetCaseDto
- **New Entities**: ClinicPetCase, ClinicCaseTimeline
- **TypeScript**: Full type safety for all new features

### Migration Required
- Run database migration: `pnpm run migrate`
- No breaking changes to existing API

---

## [1.0.0] - 2024-08-15

### Added
- Initial release of Borzolini Service API
- Core telemedicine platform functionality
- User management and authentication
- Clinic management system
- Pet management and health tracking
- Appointment scheduling
- AI-powered health monitoring
- FAQ system with Elasticsearch integration
- Dashboard with analytics
- Export functionality
- Rate limiting and security features

### Technical Stack
- NestJS framework with TypeScript
- PostgreSQL database with TypeORM
- Elasticsearch for search functionality
- JWT authentication
- Swagger/OpenAPI documentation
- Comprehensive testing setup

---

## Release Notes Template

### [Unreleased]

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements

---

## Version History

| Version | Release Date | Type | Description |
|---------|--------------|------|-------------|
| 1.1.0   | 2024-09-04   | Minor | Pet Case Management System |
| 1.0.0   | 2024-08-15   | Major | Initial Release |

## How to Read This Changelog

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

## Contributing

When adding entries to this changelog, please follow these guidelines:

1. Use the present tense ("Add feature" not "Added feature")
2. Group changes by type (Added, Changed, etc.)
3. Include relevant technical details
4. Mention any breaking changes clearly
5. Include migration instructions when needed
6. Update the version history table

## Links

- [Release Strategy](./RELEASE_STRATEGY.md)
- [API Documentation](./docs/)
- [Migration Guide](./docs/MIGRATION_GUIDE.md)
