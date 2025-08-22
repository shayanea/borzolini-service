import * as fs from 'fs';
import * as path from 'path';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '../app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

/**
 * Script to generate Swagger/OpenAPI documentation
 * Exports both JSON and YAML formats
 */
async function generateSwaggerDocs() {
  console.log('🔄 Generating Swagger documentation...');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, { logger: false });

  // Apply global validation pipe (same as main.ts)
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

  // Set global prefix (same as main.ts)
  app.setGlobalPrefix('api/v1');

  // Swagger configuration (enhanced version)
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

      ### 🧪 Sample Users (Development)
      | Email | Password | Role | Status |
      |-------|----------|------|---------|
      | admin@borzolini.com | Password123! | Admin | Verified |
      | dr.smith@borzolini.com | Password123! | Veterinarian | Verified |
      | john.doe@example.com | Password123! | Patient | Verified |

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

  // Generate OpenAPI document
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });

  // Ensure docs directory exists
  const docsDir = path.join(__dirname, '../../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Export as JSON
  const jsonPath = path.join(docsDir, 'swagger.json');
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
  console.log(`✅ Swagger JSON exported to: ${jsonPath}`);

  // Export as YAML (optional)
  try {
    const yaml = require('yaml');
    const yamlPath = path.join(docsDir, 'swagger.yaml');
    fs.writeFileSync(yamlPath, yaml.stringify(document));
    console.log(`✅ Swagger YAML exported to: ${yamlPath}`);
  } catch (error) {
    console.log('⚠️  YAML export skipped (yaml package not installed)');
  }

  // Generate API statistics
  const stats = generateApiStats(document);
  const statsPath = path.join(docsDir, 'api-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`📊 API statistics exported to: ${statsPath}`);

  // Generate markdown documentation
  const markdownPath = path.join(docsDir, 'API_REFERENCE.md');
  const markdownContent = generateMarkdownDocs(document, stats);
  fs.writeFileSync(markdownPath, markdownContent);
  console.log(`📝 Markdown documentation exported to: ${markdownPath}`);

  await app.close();
  console.log('🎉 Swagger documentation generation completed!');
}

/**
 * Generate API statistics from OpenAPI document
 */
function generateApiStats(document: any) {
  const paths = document.paths || {};
  const endpoints = Object.keys(paths);
  const methods = [];
  const tags = new Set();

  endpoints.forEach((endpoint) => {
    Object.keys(paths[endpoint]).forEach((method) => {
      methods.push(method.toUpperCase());
      const operation = paths[endpoint][method];
      if (operation.tags) {
        operation.tags.forEach((tag) => tags.add(tag));
      }
    });
  });

  const methodCounts = methods.reduce((acc, method) => {
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEndpoints: endpoints.length,
    totalOperations: methods.length,
    methodBreakdown: methodCounts,
    tags: Array.from(tags),
    tagCount: tags.size,
    generatedAt: new Date().toISOString(),
    version: document.info.version,
  };
}

/**
 * Generate markdown documentation from OpenAPI document
 */
function generateMarkdownDocs(document: any, stats: any) {
  return `# ${document.info.title}

${document.info.description}

## API Statistics

- **Total Endpoints**: ${stats.totalEndpoints}
- **Total Operations**: ${stats.totalOperations}
- **Tags**: ${stats.tagCount}
- **Version**: ${stats.version}
- **Generated**: ${stats.generatedAt}

### HTTP Methods Distribution

${Object.entries(stats.methodBreakdown)
  .map(([method, count]) => `- **${method}**: ${count} endpoints`)
  .join('\n')}

### Available Tags

${stats.tags.map((tag) => `- ${tag}`).join('\n')}

## Authentication

This API uses JWT Bearer token authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Base URLs

- **Development**: \`http://localhost:3001/api/v1\`
- **Production**: \`https://api.borzolini.com/api/v1\`

## Contact & Support

- **Team**: Borzolini Clinic Team
- **Website**: https://borzolini.com
- **Email**: support@borzolini.com

---

*This documentation was auto-generated from the OpenAPI specification.*
`;
}

// Run the script
if (require.main === module) {
  generateSwaggerDocs().catch((error) => {
    console.error('❌ Failed to generate Swagger documentation:', error);
    process.exit(1);
  });
}

export { generateSwaggerDocs };
