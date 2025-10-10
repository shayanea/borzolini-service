# Pets Module The Pets Module provides pet management functionality for the clinic management system.
## Features
- **Pet CRUD Operations**: Create, read, update, and delete pets
- **Owner Management**: Associate pets with user owners
- **Health Tracking**: Track vaccination status, spay/neuter status, and medical history
- **Filtering**: Filter pets by species, gender, size, health status, and more
- **Statistics**: pet statistics and analytics
- **Role-Based Access**: Different access levels for admins, veterinarians, staff, and patients
## Entities
### Pet Entity
- Basic information (name, species, breed, gender, date of birth)
- Physical characteristics (weight, size, color)
- Health information (vaccination status, spay/neuter status, medical history)
- Emergency contact information
- Photo and documentation support
- Computed properties (age, age in months)
### Enums
- **PetSpecies**: DOG, CAT, BIRD, RABBIT, HAMSTER, FISH, REPTILE, HORSE, OTHER
- **PetGender**: MALE, FEMALE, UNKNOWN
- **PetSize**: TINY, SMALL, MEDIUM, LARGE, GIANT
## API Endpoints
### Public Endpoints
None - all endpoints require authentication
### Protected Endpoints
- `POST /pets` - Create a new pet
- `GET /pets` - Get all pets with filtering and pagination
- `GET /pets/my-pets` - Get current user's pets
- `GET /pets/:id` - Get pet by ID
- `PATCH /pets/:id` - Update pet
- `DELETE /pets/:id` - Soft delete pet
- `DELETE /pets/:id/hard` - Hard delete pet (admin only)
### Special Endpoints
- `GET /pets/stats` - Get pet statistics (admin/vet/staff only)
- `GET /pets/species/:species` - Get pets by species
- `GET /pets/needing-vaccination` - Get pets needing vaccination (admin/vet/staff only)
- `GET /pets/needing-spay-neuter` - Get pets needing spay/neuter (admin/vet/staff only)
- `POST /pets/validate` - Validate pet data without creating
## Business Logic
### Pet Creation
- Automatically associates pet with authenticated user
- Calculates size category based on weight if not provided
- Validates owner existence
- Supports date of birth conversion
### Access Control
- Users can only access their own pets
- Admins, veterinarians, and staff can access all pets
- Role-based filtering and statistics access
### Health Tracking
- Vaccination status monitoring
- Spay/neuter status tracking
- Medical history and behavioral notes
- Allergy and medication management
## Dependencies
- **UsersModule**: For user validation and owner relationships
- **TypeORM**: For database operations and entity management
- **Auth Guards**: JWT authentication and role-based access control
## Usage Examples
### Creating a Pet
```typescript
const newPet = await petsService.create(
 {
 name: 'Buddy',
 species: PetSpecies.DOG,
 breed: 'Golden Retriever',
 gender: PetGender.MALE,
 date_of_birth: '2020-03-15',
 weight: 45.5,
 is_vaccinated: true,
 is_spayed_neutered: true,
 },
 userId
);
```
### Filtering Pets
```typescript
const filters: PetFilters = {
 species: PetSpecies.DOG,
 is_vaccinated: false,
 search: 'Golden',
};
const result = await petsService.findAll(filters, 1, 10);
```
### Getting Statistics
```typescript
const stats = await petsService.getPetStats();
console.log(`Total pets: ${stats.total}`);
console.log(`Dogs: ${stats.bySpecies[PetSpecies.DOG]}`);
console.log(`Average age: ${stats.averageAge} years`);
```
## Database Schema
The pets table includes:
- UUID primary key
- Owner relationship (foreign key to users table)
- Appointment relationships (one-to-many with clinic_appointments)
- health and behavioral tracking fields
- Timestamps for creation and updates
- Soft delete support via is_active flag
## Future Enhancements
- Pet photo upload and management
- Vaccination schedule tracking
- Weight history and growth charts
- Behavioral assessment tools
- Integration with appointment scheduling
- AI-powered health insights
