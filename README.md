# 🐱 Borzolini Service - AI-Powered Pet Clinic Platform

A professional NestJS backend for managing pet clinics, telemedicine consultations, and AI-powered health monitoring.

## 🚀 Features

### Core Platform
- **Multi-role Clinic Management** - Admin, Doctor, Assistant dashboards
- **Pet Health Profiles** - Comprehensive health tracking and history
- **Appointment Management** - Booking, scheduling, and reminders
- **User Authentication** - JWT-based secure authentication system

### AI Health Monitoring
- **Proactive Health Alerts** - AI-powered symptom analysis
- **Breed-Specific Insights** - Persian cat specialization (Fariborz!)
- **Health Pattern Recognition** - Predictive health modeling
- **Personalized Recommendations** - AI-driven care suggestions

### Telemedicine
- **Video Consultations** - Integration with Daily.co for video calls
- **Consultation Records** - Detailed consultation documentation
- **Follow-up Management** - Seamless consultation-to-visit conversion

### Social Media Integration
- **Instagram API Integration** - Clinic showcase automation
- **Content Management** - Social media content scheduling
- **Brand Building** - Visual trust and authenticity

## 🛠 Tech Stack

- **Framework**: NestJS 10+ with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **AI Integration**: OpenAI GPT-4 for health analysis
- **Video Calls**: Daily.co API for telemedicine
- **File Storage**: Local file system (development) / Supabase Storage (production)
- **Email**: SMTP for notifications
- **Documentation**: Swagger/OpenAPI

## 📁 Project Structure

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
│   └── payments/     # Payment processing
└── main.ts           # Application entry point
```

## 🚀 Getting Started

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

## 🔧 Configuration

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

## 📚 API Documentation

Once running, access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3001/api/docs`
- **API Base URL**: `http://localhost:3001/api/v1`

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 🚀 Deployment

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

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Request sanitization
- **JWT Authentication** - Secure token-based auth
- **CORS Configuration** - Cross-origin protection

## 🤖 AI Health Monitoring

The platform includes sophisticated AI-powered health monitoring:

- **Symptom Analysis** - GPT-4 powered health assessment
- **Pattern Recognition** - Health trend analysis
- **Predictive Alerts** - Proactive health warnings
- **Breed-Specific Insights** - Specialized care recommendations

## 📱 Telemedicine Features

- **Video Consultations** - High-quality video calls
- **Consultation Records** - Detailed visit documentation
- **Follow-up Management** - Seamless care continuity
- **Emergency Triage** - Urgency assessment

## 📊 Monitoring & Logging

- **Health Checks** - Application status monitoring
- **Error Logging** - Comprehensive error tracking
- **Performance Metrics** - Response time monitoring
- **Audit Trails** - User action logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐱 Special Thanks

Built with love for **Fariborz** and all the pets who will benefit from AI-powered health monitoring! 🐾

---

**Ready to revolutionize pet healthcare?** 🚀
