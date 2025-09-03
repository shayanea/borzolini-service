# Breeds Module

This module provides comprehensive breed management for the pet clinic platform, including detailed breed information, health data, and API endpoints for breed operations.

## Features

- **Comprehensive Breed Database**: Detailed breed information including temperament, health risks, size, and care requirements
- **Multi-Species Support**: Supports dogs, cats, birds, rabbits, hamsters, fish, reptiles, horses, and other pets
- **Health Information**: Breed-specific health risks and life expectancy data
- **Care Guidelines**: Grooming and exercise needs for each breed
- **Search & Filter**: Advanced search capabilities and filtering by species
- **Statistics**: Breed statistics and analytics

## Database Schema

### Breeds Table
```sql
CREATE TABLE breeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL,
  size_category VARCHAR(20),
  temperament TEXT,
  health_risks JSONB DEFAULT '[]',
  life_expectancy_min INTEGER,
  life_expectancy_max INTEGER,
  weight_min DECIMAL(5,2),
  weight_max DECIMAL(5,2),
  origin_country VARCHAR(100),
  description TEXT,
  grooming_needs VARCHAR(50),
  exercise_needs VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_breed_per_species UNIQUE (name, species)
);
```

### Pet-Breed Relationship
```sql
-- Added to pets table
ALTER TABLE pets ADD COLUMN breed_id UUID REFERENCES breeds(id) ON DELETE SET NULL;
```

## API Endpoints

### Get All Breeds (No Pagination)
```http
GET /breeds
Authorization: Bearer <token>
```

**Response:**
```json
{
  "breeds_by_species": [
    {
      "species": "dog",
      "breeds": [
        {
          "id": "uuid",
          "name": "Golden Retriever",
          "species": "dog",
          "size_category": "large",
          "temperament": "Intelligent, friendly, and devoted",
          "health_risks": ["Hip dysplasia", "Elbow dysplasia", "Cancer"],
          "life_expectancy_min": 10,
          "life_expectancy_max": 12,
          "weight_min": 55,
          "weight_max": 75,
          "origin_country": "Scotland",
          "description": "A large-sized gun dog...",
          "grooming_needs": "moderate",
          "exercise_needs": "high",
          "is_active": true,
          "created_at": "2024-01-01T00:00:00Z",
          "updated_at": "2024-01-01T00:00:00Z"
        }
      ]
    }
  ],
  "total_breeds": 25,
  "total_species": 8
}
```

### Get Breeds by Species
```http
GET /breeds/species/dog
Authorization: Bearer <token>
```

### Search Breeds
```http
GET /breeds/search?q=golden
Authorization: Bearer <token>
```

### Get Breed Statistics
```http
GET /breeds/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_breeds": 25,
  "breeds_by_species": {
    "dog": 8,
    "cat": 6,
    "bird": 3,
    "rabbit": 2,
    "hamster": 1,
    "fish": 2,
    "reptile": 2,
    "other": 1
  },
  "breeds_by_size": {
    "tiny": 3,
    "small": 8,
    "medium": 7,
    "large": 5,
    "giant": 2
  }
}
```

### Create Breed (Admin Only)
```http
POST /breeds
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Breed",
  "species": "dog",
  "size_category": "medium",
  "temperament": "Friendly and energetic",
  "health_risks": ["Hip dysplasia"],
  "life_expectancy_min": 10,
  "life_expectancy_max": 14,
  "weight_min": 30,
  "weight_max": 50,
  "origin_country": "United States",
  "description": "A new breed description",
  "grooming_needs": "moderate",
  "exercise_needs": "high"
}
```

### Update Breed (Admin Only)
```http
PATCH /breeds/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "temperament": "Updated temperament description"
}
```

### Delete Breed (Admin Only)
```http
DELETE /breeds/:id
Authorization: Bearer <admin_token>
```

## Supported Species

- **Dogs**: 8 breeds including Labrador Retriever, Golden Retriever, German Shepherd, etc.
- **Cats**: 6 breeds including Persian, Maine Coon, British Shorthair, etc.
- **Birds**: 3 breeds including Canary, Cockatiel, African Grey
- **Rabbits**: 2 breeds including Holland Lop, Flemish Giant
- **Hamsters**: 1 breed (Syrian Hamster)
- **Fish**: 2 types including Goldfish, Betta
- **Reptiles**: 2 types including Bearded Dragon, Leopard Gecko

## Breed Data Structure

Each breed includes:
- **Basic Info**: Name, species, size category
- **Physical**: Weight range, origin country
- **Behavioral**: Temperament, exercise needs
- **Health**: Common health risks, life expectancy
- **Care**: Grooming needs, description

## Usage Examples

### Frontend Integration
```typescript
// Get all breeds for a dropdown
const response = await fetch('/api/breeds', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { breeds_by_species } = await response.json();

// Filter breeds by species
const dogBreeds = breeds_by_species.find(s => s.species === 'dog')?.breeds || [];
```

### Pet Registration
```typescript
// When creating a pet, reference the breed
const petData = {
  name: "Buddy",
  species: "dog",
  breed_id: "golden-retriever-uuid", // Reference to breed
  // ... other pet data
};
```

## Seeding

The module includes a comprehensive seeder with real breed data:

```bash
# Run the seeder
npm run seed

# Or run breeds seeder specifically
npm run seed:breeds
```

## Permissions

- **Read Operations**: All authenticated users
- **Write Operations**: Admin users only
- **Search & Statistics**: All authenticated users

## Future Enhancements

- [ ] Breed-specific health recommendations
- [ ] Breed compatibility with other pets
- [ ] Breed popularity analytics
- [ ] Breed-specific care guides
- [ ] Integration with veterinary databases
- [ ] Breed image galleries
- [ ] Breed-specific feeding recommendations
