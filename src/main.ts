import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Cookie parser middleware
  app.use(cookieParser());

  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('🐾 Borzolini Clinic API')
    .setDescription(
      `
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

      ---
      **Version**: 1.0.0  
      **Environment**: ${process.env.NODE_ENV || 'development'}  
      **Base URL**: \`/api/v1\`
    `
    )
    .setVersion('1.0.0')
    .setContact('Borzolini Clinic Team', 'https://borzolini.com', 'support@borzolini.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001/api/v1', 'Development Server')
    .addServer('https://api.borzolini.com/api/v1', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('auth', '🔐 Authentication & Security')
    .addTag('users', '👥 User Management')
    .addTag('clinics', '🏥 Clinic Management')
    .addTag('pets', '🐕 Pet Health Monitoring')
    .addTag('appointments', '📅 Appointment System')
    .addTag('ai-health', '🤖 AI Health Insights')
    .addTag('telemedicine', '🎥 Telemedicine & Consultations')
    .addTag('health', '💊 Health Monitoring')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Borzolini Service is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🐱 AI-Powered Pet Health Monitoring Platform`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
