# AI Health Module

Provides AI-powered health recommendations for pets using OpenAI GPT-4.

## Features

### AI-Powered Recommendations
- Personalized care tips based on breed, age, and health status
- Predictive health insights
- Breed-specific advice
- Seasonal care guidance

### Health Monitoring
- Risk factor analysis
- Health trend tracking
- Urgency assessment
- Confidence scoring for recommendations

### Feedback System
- Owner ratings and feedback
- Action tracking
- Dismissal management
- Continuous improvement based on user input

## Architecture

### Core Components
- **AI Health Service** - Business logic and AI integration
- **AI Health Controller** - REST API endpoints
- **AI Health Insight Entity** - Database model
- **OpenAI Integration** - GPT-4 powered recommendations
- **Fallback System** - Rule-based recommendations when AI is unavailable

### Data Sources
- Pet profiles (species, breed, age, weight, medical history)
- Appointment history
- Health records (vaccinations, medications, allergies)
- Owner preferences and feedback

## Insight Categories

- **Health & Wellness** - Preventive care, vaccinations, health monitoring
- **Nutrition & Diet** - Dietary needs, weight management, allergies
- **Behavior & Training** - Behavior modification, training, socialization
- **Lifestyle & Exercise** - Exercise requirements, activity recommendations
- **Grooming & Hygiene** - Grooming needs, dental care, parasite prevention

## API Endpoints

### Generate Recommendations
```http
POST /api/v1/ai-health/recommendations
```

Generate personalized AI recommendations for a pet.

**Request Body:**
```json
{
  "pet_id": "uuid",
  "categories": ["health", "nutrition", "behavior"],
  "insight_types": ["recommendation", "alert", "reminder"],
  "include_emergency_alerts": true,
  "include_preventive_care": true,
  "include_lifestyle_tips": true,
  "custom_context": "Recent lethargy and decreased appetite"
}
```

### Get Pet Insights
```http
GET /api/v1/ai-health/pets/{petId}/insights?includeDismissed=false
```

Retrieve all AI insights for a specific pet.

### Get Insights by Category
```http
GET /api/v1/ai-health/pets/{petId}/insights/category/{category}
```

Get insights filtered by specific category.

### Get Urgent Insights
```http
GET /api/v1/ai-health/pets/{petId}/insights/urgent
```

Retrieve only urgent insights requiring immediate attention.

### Get Insights Summary
```http
GET /api/v1/ai-health/pets/{petId}/insights/summary
```

Get dashboard summary with counts and recent insights.

### Update Insight
```http
PUT /api/v1/ai-health/insights/{insightId}
```

Update insight with owner feedback and actions.

**Request Body:**
```json
{
  "dismissed": false,
  "acted_upon": true,
  "owner_feedback": "Scheduled vaccination appointment",
  "owner_rating": 5
}
```

### Refresh Insights
```http
POST /api/v1/ai-health/pets/{petId}/insights/refresh
```

Regenerate AI recommendations based on updated data.

### AI Health Dashboard
```http
GET /api/v1/ai-health/dashboard/{petId}
```

Get comprehensive AI health dashboard with insights, health score, and next actions.

## AI Integration

### OpenAI GPT-4
- **Model**: GPT-4 for advanced reasoning
- **Temperature**: 0.7 for balanced creativity and consistency
- **Max Tokens**: 2000 for comprehensive responses
- **Fallback**: Rule-based system when AI is unavailable

### Prompt Engineering
The system uses prompts that include:
- Complete pet profile
- Health history and recent symptoms
- Risk factor analysis
- Owner context and preferences
- Specific requirements and categories

### Response Parsing
- JSON extraction from AI responses
- Fallback handling when parsing fails
- Validation of required fields
- Normalization to system format

## Health Scoring System

### Score Calculation
- **Base Score**: 100 points
- **Urgent Alerts**: -15 points each
- **High Alerts**: -5 points each
- **Range**: 0-100 points

### Score Interpretation
- **90-100**: Excellent health
- **70-89**: Good health
- **50-69**: Moderate health
- **0-49**: Poor health, immediate attention required

## Workflow

### 1. Data Collection
- Gather pet profile information
- Collect appointment history
- Analyze health trends
- Identify risk factors

### 2. AI Analysis
- Build comprehensive prompt
- Send to OpenAI API
- Parse AI response
- Generate structured insights

### 3. Insight Storage
- Save to database
- Assign urgency levels
- Set confidence scores
- Link supporting data

### 4. User Interaction
- Display insights to owners
- Collect feedback and ratings
- Track actions taken
- Update insight status

### 5. Continuous Improvement
- Learn from user feedback
- Refine AI prompts
- Update rule-based system
- Improve recommendation quality

## Fallback System

When OpenAI is unavailable, the system provides rule-based recommendations based on:

### Age-Based Rules
- **Puppy/Kitten (< 1 year)**: Vaccination schedules, socialization
- **Adult (1-7 years)**: Preventive care, lifestyle optimization
- **Senior (> 7 years)**: Health monitoring, age-related care

### Breed-Specific Rules
- **Brachycephalic Breeds**: Respiratory care, heat sensitivity
- **Large Breeds**: Joint health, exercise requirements
- **Small Breeds**: Hypoglycemia prevention, frequent feeding

### Health Status Rules
- **Unvaccinated**: Immediate vaccination alerts
- **Unspayed/Unneutered**: Reproductive health recommendations
- **Allergies**: Dietary and environmental considerations

## Security & Privacy

### Data Protection
- Encrypted storage for all insights
- JWT-based authentication required
- Data isolation - users only see their own insights
- Audit logging for all AI interactions

### AI Safety
- Content filtering for safe recommendations
- Medical disclaimer included
- Always recommend professional veterinary consultation
- Validate all AI-generated content

## Getting Started

### 1. Environment Setup
```bash
# Add OpenAI API key to .env
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4
```

### 2. Database Migration
```bash
# Run the AI health insights migration
pnpm run migrate:run
```

### 3. Generate Recommendations
```typescript
// Example: Generate recommendations for a pet
const recommendations = await aiHealthService.generateRecommendations({
  pet_id: 'pet-uuid',
  include_emergency_alerts: true,
  include_preventive_care: true,
  include_lifestyle_tips: true,
});
```

## Monitoring & Analytics

### Performance Metrics
- Response time for AI recommendation generation
- Success rate of AI calls
- Fallback usage frequency
- User engagement rates

### Quality Metrics
- Owner ratings average
- Action completion percentage
- Dismissal rate
- Feedback sentiment analysis

### AI Model Metrics
- Token usage tracking
- Model performance and relevance
- Prompt effectiveness
- Cost per recommendation

## Contributing

### Development Guidelines
- All code must be TypeScript
- Unit and integration tests required
- API documentation with Swagger/OpenAPI
- Proper error handling and logging

### AI Prompt Engineering
- Clear, specific instructions
- Comprehensive background information
- Structured, parseable responses
- Include medical disclaimers and safety checks
