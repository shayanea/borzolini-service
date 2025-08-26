import { generateSwagger } from "./generate-swagger";

// Test the Swagger generation
generateSwagger()
  .then(() => {
    console.log("✅ Swagger generation test completed successfully");
  })
  .catch((error) => {
    console.error("❌ Swagger generation test failed:", error);
  });
