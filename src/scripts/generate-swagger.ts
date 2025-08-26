import * as fs from "fs";
import * as path from "path";

import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "../app.module";
import { NestFactory } from "@nestjs/core";

interface ApiStats {
  totalEndpoints: number;
  totalControllers: number;
  tags: string[];
  methods: {
    GET: number;
    POST: number;
    PUT: number;
    DELETE: number;
    PATCH: number;
  };
  authEndpoints: number;
  publicEndpoints: number;
}

async function generateSwagger() {
  try {
    console.log("🚀 Starting Swagger documentation generation...");

    // Create a minimal app instance for Swagger generation
    const app = await NestFactory.create(AppModule, {
      logger: false, // Disable logging during generation
    });

    // Configure Swagger
    const config = new DocumentBuilder()
      .setTitle("Clinic Management API")
      .setDescription("AI-Powered Pet Clinic Management Platform Backend API")
      .setVersion("1.0.0")
      .addTag("auth", "Authentication endpoints")
      .addTag("users", "User management endpoints")
      .addTag("clinics", "Clinic management endpoints")
      .addTag("appointments", "Appointment management endpoints")
      .addTag("pets", "Pet management endpoints")
      .addTag("payments", "Payment processing endpoints")
      .addTag("telemedicine", "Telemedicine endpoints")
      .addTag("ai-health", "AI health monitoring endpoints")
      .addTag("social-media", "Social media integration endpoints")
      .addTag("health", "Health check endpoints")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (_controllerKey: string, methodKey: string) =>
        methodKey,
    });

    // Ensure docs directory exists
    const docsDir = path.join(__dirname, "../../docs");
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Write Swagger JSON
    const swaggerPath = path.join(docsDir, "swagger.json");
    fs.writeFileSync(swaggerPath, JSON.stringify(document, null, 2));
    console.log(`✅ Swagger JSON generated: ${swaggerPath}`);

    // Generate API statistics
    const stats = generateApiStats(document);
    const statsPath = path.join(docsDir, "api-stats.json");
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    console.log(`✅ API statistics generated: ${statsPath}`);

    // Generate README
    const readmePath = path.join(docsDir, "README.md");
    const readmeContent = generateReadme(stats);
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ API documentation README generated: ${readmePath}`);

    // Close the app
    await app.close();

    console.log("🎉 Swagger documentation generation completed successfully!");
    console.log(`📁 Documentation files saved in: ${docsDir}`);
    console.log(`🌐 Swagger UI available at: http://localhost:3001/api/docs`);

    return stats;
  } catch (error) {
    console.error("❌ Error generating Swagger documentation:", error);

    // Fallback: create a basic Swagger file
    console.log("🔄 Creating fallback Swagger documentation...");
    await createFallbackSwagger();
    throw error;
  }
}

async function createFallbackSwagger() {
  try {
    const docsDir = path.join(__dirname, "../../docs");
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Create a basic Swagger document
    const basicSwagger = {
      openapi: "3.0.0",
      info: {
        title: "Clinic Management API",
        description: "AI-Powered Pet Clinic Management Platform Backend API",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3001",
          description: "Development server",
        },
      ],
      tags: [
        { name: "auth", description: "Authentication endpoints" },
        { name: "users", description: "User management endpoints" },
        { name: "health", description: "Health check endpoints" },
      ],
      paths: {
        "/health": {
          get: {
            tags: ["health"],
            summary: "Health check",
            responses: {
              "200": {
                description: "Health check successful",
              },
            },
          },
        },
      },
    };

    const swaggerPath = path.join(docsDir, "swagger.json");
    fs.writeFileSync(swaggerPath, JSON.stringify(basicSwagger, null, 2));
    console.log(`✅ Fallback Swagger JSON generated: ${swaggerPath}`);

    // Create basic stats
    const stats = {
      totalEndpoints: 1,
      totalControllers: 3,
      tags: ["auth", "users", "health"],
      methods: { GET: 1, POST: 0, PUT: 0, DELETE: 0, PATCH: 0 },
      authEndpoints: 0,
      publicEndpoints: 1,
    };

    const statsPath = path.join(docsDir, "api-stats.json");
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    console.log(`✅ Fallback API statistics generated: ${statsPath}`);

    // Create basic README
    const readmePath = path.join(docsDir, "README.md");
    const readmeContent = generateReadme(stats);
    fs.writeFileSync(readmePath, readmeContent);
    console.log(
      `✅ Fallback API documentation README generated: ${readmePath}`,
    );

    console.log("✅ Fallback documentation created successfully");
  } catch (fallbackError) {
    console.error("❌ Failed to create fallback documentation:", fallbackError);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateApiStats(document: { paths: any }): ApiStats {
  const paths = document.paths || {};
  const tags = new Set<string>();
  const methods = {
    GET: 0,
    POST: 0,
    PUT: 0,
    DELETE: 0,
    PATCH: 0,
  };

  let totalEndpoints = 0;
  let authEndpoints = 0;
  let publicEndpoints = 0;

  Object.keys(paths).forEach((path) => {
    Object.keys(paths[path]).forEach((method) => {
      const upperMethod = method.toUpperCase();
      if (upperMethod in methods) {
        methods[upperMethod as keyof typeof methods]++;
        totalEndpoints++;

        const operation = paths[path][method];
        if (operation?.tags) {
          operation.tags.forEach((tag: string) => tags.add(tag));
        }

        // Check if endpoint requires authentication
        if (operation?.security && operation.security.length > 0) {
          authEndpoints++;
        } else {
          publicEndpoints++;
        }
      }
    });
  });

  return {
    totalEndpoints,
    totalControllers: tags.size,
    tags: Array.from(tags).sort(),
    methods,
    authEndpoints,
    publicEndpoints,
  };
}

function generateReadme(stats: ApiStats): string {
  const methodCounts = Object.entries(stats.methods)
    .map(([method, count]) => `- ${method}: ${count}`)
    .join("\n");

  const tagList = stats.tags.map((tag) => `- ${tag}`).join("\n");

  return `# Clinic Management API Documentation

## Overview
This is the API documentation for the AI-Powered Pet Clinic Management Platform Backend.

## API Statistics
- **Total Endpoints**: ${stats.totalEndpoints}
- **Total Controllers**: ${stats.totalControllers}
- **Authentication Required**: ${stats.authEndpoints}
- **Public Endpoints**: ${stats.publicEndpoints}

## HTTP Methods
${methodCounts}

## API Controllers
${tagList}

## Authentication
Most endpoints require JWT authentication. Include the JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Base URL
\`\`\`
http://localhost:3001
\`\`\`

## Interactive Documentation
Access the interactive Swagger UI at: http://localhost:3001/api/docs

## File Structure
- \`swagger.json\` - Complete OpenAPI specification
- \`api-stats.json\` - API statistics and metadata
- \`README.md\` - This documentation file

## Getting Started
1. Start the application: \`pnpm start:dev\`
2. Open Swagger UI: http://localhost:3001/api/docs
3. Use the interactive documentation to explore endpoints
4. Test endpoints directly from the UI

## Notes
- All timestamps are in ISO 8601 format
- IDs are UUIDs
- Error responses follow standard HTTP status codes
- Request/response examples are provided in the Swagger UI
`;
}

// Run the generation if this file is executed directly
if (require.main === module) {
  generateSwagger()
    .then(() => {
      console.log("✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

export { generateSwagger, generateApiStats, generateReadme };
