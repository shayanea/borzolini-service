# AI Health Module

This module uses OpenAI GPT-4 to generate health recommendations for pets. Think of it as a virtual vet assistant that analyzes pet profiles and suggests care tips.

## What It Does

### AI-Powered Recommendations

- Generates personalized care tips based on breed, age, and health history
- Predicts potential health issues before they become problems
- Gives breed-specific advice (e.g., hip dysplasia warnings for large dogs)
- Adjusts recommendations based on seasons (heatstroke warnings in summer, etc.)

### Health Monitoring

- Analyzes risk factors from the pet's profile
- Tracks health trends over time
- Assigns urgency levels (info, low, medium, high, emergency)
- Includes confidence scores so you know how reliable each recommendation is

### Feedback Loop

- Pet owners can rate recommendations (1-5 stars)
- Tracks if they actually acted on the advice
- Let's them dismiss irrelevant suggestions
- Uses feedback to improve future recommendations (though we're not training the model - just using it for relevance)

## How It Works

### Architecture

- **AI Health Service** - handles all the business logic and talks to OpenAI
- **AI Health Controller** - REST endpoints for the frontend
- **AI Health Insight Entity** - stores recommendations in the database
- **OpenAI Integration** - sends prompts to GPT-4 and parses responses
- **Fallback System** - uses rule-based logic when OpenAI is down or rate-limited

### Data We Use

The AI analyzes:

- Pet profile (breed, age, weight, species)
- Medical history (vaccinations, medications, allergies)
- Past appointments and their outcomes
- Health records and symptoms
- Owner feedback on previous recommendations

More data = better recommendations. A bare-bones profile gets generic advice, while a detailed profile gets really specific insights.

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

Get AI health dashboard with insights, health score, and next actions.

## AI Integration

### OpenAI Setup

We're using GPT-4 with these settings:

- **Temperature**: 0.7 (balances creativity with consistency - not too random, not too rigid)
- **Max Tokens**: 2000 (enough for detailed responses)
- **Model**: gpt-4 (gpt-3.5-turbo works too but gives lower quality)

**Cost note:** GPT-4 is expensive (~$0.03 per recommendation). Consider caching recommendations or using GPT-3.5-turbo for development.

### Prompt Engineering

Our prompts include:

- Full pet profile with all available data
- Recent symptoms or health changes
- Risk factors specific to the breed/age
- What the owner is asking about (if anything specific)
- Which categories they want (health, nutrition, behavior, etc.)

The prompt is basically: "You're a veterinarian. Here's a pet's profile. Generate 3-5 actionable health recommendations in JSON format."

### Response Handling

- Extracts JSON from the AI response (GPT-4 usually wraps it in markdown)
- Falls back to rule-based recommendations if parsing fails
- Validates all required fields before saving
- Normalizes urgency levels and categories to our enum values

**Gotcha:** GPT-4 sometimes ignores the JSON format and writes paragraphs. We have retry logic for this.

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

- Build prompt
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

When OpenAI is down, rate-limited, or your API key is missing, we fall back to rule-based recommendations. They're not as good as AI, but better than nothing.

### Age-Based Rules

- **Puppy/Kitten (< 1 year)** - reminds about vaccination schedule and socialization
- **Adult (1-7 years)** - general preventive care and exercise
- **Senior (> 7 years)** - age-related health monitoring and senior-specific care

### Breed-Specific Rules

- **Brachycephalic (flat-faced) breeds** - warns about heat sensitivity and breathing issues
- **Large breeds** - joint health and controlled exercise to prevent hip dysplasia
- **Small breeds** - more frequent feeding to prevent hypoglycemia

### Health Status Triggers

- **Missing vaccinations** - urgent alerts to get them vaccinated
- **Not spayed/neutered** - reproductive health recommendations
- **Known allergies** - dietary restrictions and environmental tips

**Pro tip:** The fallback system is great for testing without burning through OpenAI credits.

## Security & Privacy

### Data Protection

- Encrypted storage for all insights
- JWT-based authentication required
- Data isolation - users only see their own insights
- Audit logging for all AI interactions

### AI Safety

- Content filtering for safe recommendations
- Medical disclaimer included
- Always recommend veterinary consultation
- Validate all AI-generated content

## Getting Started

### 1. Add Your OpenAI Key

```bash
# In your .env file
OPENAI_API_KEY=sk-... # get from platform.openai.com
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo to save money
```

**Important:** Without an API key, it'll use the fallback system only.

### 2. Run Migrations

```bash
# This creates the ai_health_insights table
pnpm run migrate:run
```

### 3. Test It Out

Hit the Swagger UI at http://localhost:3001/api/docs and try the `/ai-health/recommendations` endpoint.

Or use it in code:

```typescript
// Generate recommendations for a pet
const recommendations = await aiHealthService.generateRecommendations({
  pet_id: 'pet-uuid',
  include_emergency_alerts: true,
  include_preventive_care: true,
  include_lifestyle_tips: true,
});
```

**First time?** Create a pet first (via `/pets` endpoint), then generate recommendations for that pet.

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
- background information
- Structured, parseable responses
- Include medical disclaimers and safety checks
