import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware - relaxed for development
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
  } else {
    // Relaxed security for development and local network access
    app.use(
      helmet({
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
        originAgentCluster: false,
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        // Disable strict transport security for local development
        hsts: false,
      })
    );
  }
  app.use(compression());

  // Cookie parser middleware
  app.use(cookieParser());

  // Enable CORS for frontend integration
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_FRONTEND_URL || 'http://localhost:3002',
    // Development origins for network access
    'http://192.168.70.174:3000',
    'http://192.168.70.174:3001',
    'http://192.168.70.174:3002',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Log the origin for debugging
      console.log(`🔍 CORS request from origin: ${origin}`);

      if (allowedOrigins.includes(origin)) {
        console.log(`✅ Origin ${origin} is in allowed origins list`);
        return callback(null, true);
      }

      // In development, allow any localhost or 192.168.x.x origin
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
        const isAllowed = origin.match(/^https?:\/\/localhost(:\d+)?$/) || origin.match(/^https?:\/\/127\.0\.0\.1(:\d+)?$/) || origin.match(/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/) || origin.match(/^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/);
        if (isAllowed) {
          console.log(`✅ Origin ${origin} matches development pattern`);
          return callback(null, true);
        }
      }

      console.log(`❌ Origin ${origin} is not allowed by CORS`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-CSRF-Token'],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
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
    .addServer('http://localhost:3001/api/v1', 'Development Server (localhost)')
    .addServer('http://192.168.70.174:3001/api/v1', 'Development Server (Network)')
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
    .addTag('Auth', '🔐 Authentication & Security')
    .addTag('Users', '👥 User Management')
    .addTag('Clinics', '🏥 Clinic Management')
    .addTag('Pets', '🐕 Pet Health Monitoring')
    .addTag('Appointments', '📅 Appointment System')
    .addTag('Ai-health', '🤖 AI Health Insights')
    .addTag('Telemedicine', '🎥 Telemedicine & Consultations')
    .addTag('Health', '💊 Health Monitoring')
    .addTag('Static-files', '🖼️ Static Files')
    .addTag('Rate-limit-monitor', '🚨 Rate Limit Monitoring')
    .addTag('Scheduled-tasks', '🔄 Scheduled Tasks')
    .addTag('Settings', '⚙️ Settings Management')
    .addTag('Breeds', '🐶 Breeds Management')
    .addTag('File-upload', '🖼️ File Upload')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Custom Swagger UI options for local development
  const swaggerOptions = {
    swaggerOptions: {
      // Ensure Swagger UI uses HTTP resources
      url: '/api/docs-json',
      // Disable HTTPS enforcement
      validatorUrl: null,
      // Custom CSS to handle mixed content
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
      `,
    },
    customSiteTitle: '🐾 Borzolini Clinic API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: ['https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js', 'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js'],
    customCssUrl: ['https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css'],
  };

  SwaggerModule.setup('api/docs', app, document, swaggerOptions);

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0'; // Bind to all network interfaces
  await app.listen(port, host);

  // Use structured logging for production, formatted for development
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    console.log(
      JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message: 'Borzolini Service started successfully',
        port,
        environment: process.env.NODE_ENV,
        docsUrl: `http://localhost:${port}/api/docs`,
      })
    );
  } else {
    console.log(`🚀 Borzolini Service is running on:`);
    console.log(`📚 API Documentation (localhost): http://localhost:${port}/api/docs`);
    console.log(`🌐 API Documentation (network): http://192.168.70.174:${port}/api/docs`);
    console.log(`🔧 API Base URL: http://192.168.70.174:${port}/api/v1`);
    console.log(`🐱 AI-Powered Pet Health Monitoring Platform`);
    console.log(`🔍 CORS Origins allowed: ${allowedOrigins.join(', ')}`);
  }
}

bootstrap().catch((error) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    console.error(
      JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        message: 'Failed to start application',
        error: error.message,
        stack: error.stack,
        environment: process.env.NODE_ENV,
      })
    );
  } else {
    console.error('❌ Failed to start application:', error);
  }

  process.exit(1);
});
