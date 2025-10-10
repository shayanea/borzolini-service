# FAQ Module

This module provides FAQ (Frequently Asked Questions) management for the pet clinic platform, containing the most common questions about the 4 most popular animal types: Dogs, Cats, Birds, and Rabbits.

## Features

- **FAQ Database**: 50+ most asked questions about popular pet types
- **Multi-Species Support**: Covers dogs, cats, birds, and rabbits
- **Categorized Questions**: Organized by health care, feeding, training, exercise, housing, and general care
- **Search**: Elasticsearch-powered full-text search with fuzzy matching and relevance scoring
- **AutoSuggestions**: Intelligent autofor search queries with completion suggestions
- **Smart Ranking**: Results ranked by relevance with question matches prioritized over answer matches
- **Fallback Support**: Database fallback when Elasticsearch is unavailable
- **Statistics**: FAQ analytics and usage statistics
- **RESTful API**: CRUD operations with proper authentication

## Database Schema

### Animal FAQs Table

```sql
CREATE TABLE animal_faqs (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 species VARCHAR(50) NOT NULL,
 category VARCHAR(100) NOT NULL,
 question TEXT NOT NULL,
 answer TEXT NOT NULL,
 order_index INTEGER,
 is_active BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

 CONSTRAINT unique_question_per_species_category UNIQUE (species, category, question)
);
```

## API Endpoints

### Get All FAQs (Grouped by Species)

```http
GET /faq
Authorization: Bearer <token>
```

**Response:**

```json
[
 {
 "species": "dog",
 "faqs": [
 {
 "id": "uuid",
 "species": "dog",
 "category": "health_care",
 "question": "What is the average lifespan of a dog?",
 "answer": "Typically 10-13 years, varying by breed and size...",
 "order_index": 1,
 "created_at": "2024-01-01T00:00:00Z",
 "updated_at": "2024-01-01T00:00:00Z"
 }
 ]
 }
]
```

### Get FAQs by Species

```http
GET /faq/species/{species}
Authorization: Bearer <token>
```

### Get FAQs by Species and Category

```http
GET /faq/species/{species}/category/{category}
Authorization: Bearer <token>
```

### Search FAQs

```http
GET /faq/search?q={query}&species={species}
Authorization: Bearer <token>
```

**Response:**

```json
{
 "query": "lifespan",
 "total": 4,
 "results": [
 {
 "id": "uuid",
 "species": "dog",
 "category": "health_care",
 "question": "What is the average lifespan of a dog?",
 "answer": "Typically 10-13 years...",
 "order_index": 1,
 "created_at": "2024-01-01T00:00:00Z",
 "updated_at": "2024-01-01T00:00:00Z"
 }
 ]
}
```

### Get FAQ Statistics

```http
GET /faq/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
 "total_faqs": 50,
 "faqs_by_species": {
 "dog": 15,
 "cat": 15,
 "bird": 12,
 "rabbit": 8
 },
 "faqs_by_category": {
 "health_care": 20,
 "feeding_nutrition": 12,
 "training_behavior": 10,
 "exercise_activity": 5,
 "housing_environment": 2,
 "general_care": 1
 }
}
```

### Get Specific FAQ

```http
GET /faq/{id}
Authorization: Bearer <token>
```

### Get AutoSuggestions

```http
GET /faq/autocomplete/suggestions?q={query}&species={species}&size={size}
Authorization: Bearer <token>
```

**Parameters:**
- `q` (required): Search query for suggestions
- `species` (optional): Filter by animal species (`dog`, `cat`, `bird`, `rabbit`)
- `size` (optional): Maximum number of suggestions (default: 10)

**Response:**
```json
{
 "query": "vaccin",
 "suggestions": [
 {
 "text": "What vaccinations does my dog need?",
 "score": 0.95,
 "frequency": 1
 },
 {
 "text": "What vaccinations does my cat need?",
 "score": 0.89,
 "frequency": 1
 }
 ],
 "total": 2,
 "species": "dog"
}
```

### Index All FAQs in Elasticsearch (Admin Only)

```http
POST /faq/elasticsearch/index-all
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
 "message": "Successfully indexed all FAQs in Elasticsearch",
 "indexed_count": 54
}
```

### Index Specific FAQ in Elasticsearch (Admin Only)

```http
POST /faq/elasticsearch/index/{id}
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
 "message": "Successfully indexed FAQ \"What vaccinations does my dog need?\" in Elasticsearch"
}
```

## Supported Species

- **Dogs**: 15 FAQs covering health, feeding, training, exercise, and general care
- **Cats**: 15 FAQs covering health, feeding, training, exercise, and general care
- **Birds**: 12 FAQs covering health, feeding, training, exercise, and general care
- **Rabbits**: 8 FAQs covering health, feeding, training, housing, and general care

## FAQ Categories

- **Health Care**: Veterinary visits, vaccinations, signs of illness, dental care
- **Feeding & Nutrition**: Diet, feeding schedules, food types, nutritional needs
- **Training & Behavior**: Training methods, behavioral issues, socialization
- **Exercise & Activity**: Exercise needs, activity requirements, spaying/neutering
- **Housing & Environment**: Space requirements, indoor vs outdoor, cage setup
- **General Care**: New home adjustment, entertainment, general tips

## Usage Examples

### Frontend Integration

```typescript
// Get all FAQs for a dropdown
const response = await fetch('/api/faq', {
 headers: { Authorization: `Bearer ${token}` },
});
const faqsBySpecies = await response.json();

// Get FAQs for a specific species
const dogFaqs = await fetch('/api/faq/species/dog', {
 headers: { Authorization: `Bearer ${token}` },
});

// Search FAQs
const searchResults = await fetch('/api/faq/search?q=lifespan', {
 headers: { Authorization: `Bearer ${token}` },
});
```

### Mobile App Integration

```typescript
// Display FAQs in a mobile-friendly format
const faqs = await faqService.getFaqsBySpecies('dog');
faqs.forEach((faq) => {
 console.log(`Q: ${faq.question}`);
 console.log(`A: ${faq.answer}`);
});
```

## Seeding

The module includes a seeder with real FAQ data:

```bash
# Run the seeder
npm run seed

# Or run FAQ seeder specifically
npm run seed:faq
```

## Permissions

- **Read Operations**: All authenticated users
- **Search & Statistics**: All authenticated users
- **Write Operations**: Currently read-only (can be extended for admin management)

## Integration with Other Modules

- **Breeds Module**: FAQ species align with supported pet species
- **Pets Module**: FAQs can be filtered by pet species
- **Analytics Module**: FAQ usage can be tracked for insights

## Future Enhancements

- [ ] Admin interface for FAQ management
- [ ] FAQ usage analytics and popular questions tracking
- [ ] Multi-language support for FAQs
- [ ] FAQ rating and feedback system
- [ ] Integration with chatbot for automated responses
- [ ] FAQ categories customization per clinic
- [ ] FAQ search suggestions and autocomplete

## Performance Considerations

- Full-text search index on question and answer content
- Proper indexing on species, category, and active status
- Efficient querying with composite indexes
- Caching layer can be added for frequently accessed FAQs

---

_This FAQ module provides essential pet care information to help pet owners make informed decisions about their animals' health and well-being._
