# 🏥 Clinics Module

The Clinics Module is a comprehensive solution for managing veterinary clinics in the Borzolini Pet Clinic platform. It provides full CRUD operations for clinics, staff management, services, reviews, photos, and operating hours.

## 🚀 Features

### Core Clinic Management

- **Clinic CRUD Operations**: Create, read, update, and delete clinic profiles
- **Comprehensive Clinic Data**: Store detailed information including contact details, location, services, and specializations
- **Operating Hours**: Flexible operating hours management with JSONB support and detailed time tracking
- **Clinic Verification**: Built-in verification system for clinic authenticity
- **Active/Inactive Status**: Manage clinic availability and status

### Staff Management

- **Role-Based Staff**: Support for admin, doctor, assistant, receptionist, and technician roles
- **Staff Profiles**: Detailed staff information including education, certifications, and experience
- **Hire/Termination Tracking**: Complete employment history management
- **Specialization Support**: Track staff specializations and expertise areas

### Service Management

- **Service Categories**: Organized service classification (preventive, diagnostic, surgical, emergency, etc.)
- **Pricing & Duration**: Flexible pricing and appointment duration management
- **Service Status**: Active/inactive service management
- **Appointment Requirements**: Configure whether services require appointments

### Review & Rating System

- **User Reviews**: Allow users to rate and review clinics
- **Rating Validation**: 1-5 star rating system with validation
- **Review Verification**: Built-in review verification system
- **Helpful Votes**: Track helpful review votes
- **Automatic Rating Updates**: Clinic ratings automatically update based on reviews

### Photo Management

- **Photo Categories**: Organized photo management (facility, staff, equipment, etc.)
- **Primary Photo Support**: Designate primary clinic photos
- **Caption & Metadata**: Rich photo information and descriptions
- **Active/Inactive Photos**: Manage photo visibility

### Advanced Features

- **Search & Filtering**: Advanced search with multiple filter options
- **Pagination**: Built-in pagination support for large datasets
- **Sorting**: Flexible sorting by various criteria
- **Statistics**: Comprehensive clinic statistics and metrics
- **Geographic Search**: Search clinics by city, state, and location

## 🗄️ Database Schema

### Core Tables

- `clinics` - Main clinic information
- `clinic_staff` - Staff members and their roles
- `clinic_services` - Services offered by clinics
- `clinic_reviews` - User reviews and ratings
- `clinic_photos` - Clinic photos and images
- `clinic_operating_hours` - Detailed operating hours
- `clinic_appointments` - Appointment scheduling

### Key Relationships

- Clinics have many staff members, services, reviews, photos, and appointments
- Staff members belong to clinics and have specific roles
- Services are associated with clinics and can be categorized
- Reviews are linked to both clinics and users
- Photos are organized by category and can be designated as primary

## 🔧 API Endpoints

### Clinic Management

- `POST /clinics` - Create a new clinic (Admin only)
- `GET /clinics` - Get all clinics with filtering and pagination
- `GET /clinics/:id` - Get clinic by ID
- `GET /clinics/name/:name` - Get clinics by name
- `GET /clinics/city/:city` - Get clinics by city
- `PATCH /clinics/:id` - Update clinic (Admin only)
- `DELETE /clinics/:id` - Delete clinic (Admin only)

### Search & Discovery

- `GET /clinics/search?q=query` - Search clinics by query string
- `GET /clinics?name=clinic&city=city&rating_min=4` - Advanced filtering
- `GET /clinics?page=1&limit=10&sort_by=rating&sort_order=DESC` - Pagination and sorting

### Staff Management

- `POST /clinics/:id/staff` - Add staff member to clinic (Admin only)
- `DELETE /clinics/:clinicId/staff/:userId` - Remove staff member (Admin only)

### Service Management

- `POST /clinics/:id/services` - Add service to clinic (Admin only)
- `PATCH /clinics/services/:id` - Update clinic service (Admin only)
- `DELETE /clinics/services/:id` - Delete clinic service (Admin only)

### Review System

- `POST /clinics/:id/reviews` - Add review to clinic (Authenticated users)

### Photo Management

- `POST /clinics/:id/photos` - Add photo to clinic (Admin only)
- `DELETE /clinics/photos/:id` - Delete clinic photo (Admin only)

### Statistics

- `GET /clinics/:id/stats` - Get clinic statistics

## 📊 Data Models

### Clinic Entity

```typescript
interface Clinic {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  is_active: boolean;
  operating_hours: OperatingHours;
  emergency_contact?: string;
  emergency_phone?: string;
  services: string[];
  specializations: string[];
  payment_methods: string[];
  insurance_providers: string[];
  created_at: Date;
  updated_at: Date;
}
```

### Staff Entity

```typescript
interface ClinicStaff {
  id: string;
  clinic_id: string;
  user_id: string;
  role: StaffRole;
  specialization?: string;
  license_number?: string;
  experience_years?: number;
  education: string[];
  certifications: string[];
  bio?: string;
  profile_photo_url?: string;
  is_active: boolean;
  hire_date: Date;
  termination_date?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### Service Entity

```typescript
interface ClinicService {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  duration_minutes: number;
  price?: number;
  currency: string;
  is_active: boolean;
  requires_appointment: boolean;
  created_at: Date;
  updated_at: Date;
}
```

## 🔐 Authentication & Authorization

### Public Endpoints

- `GET /clinics/:id` - Get clinic details
- `GET /clinics/search` - Search clinics
- `GET /clinics/name/:name` - Get clinics by name
- `GET /clinics/city/:city` - Get clinics by city
- `GET /clinics/:id/stats` - Get clinic statistics

### Authenticated Endpoints

- `GET /clinics` - List clinics (with filtering) - All authenticated users
- `POST /clinics/:id/reviews` - Add reviews (any authenticated user)

### Admin Only Endpoints

- `POST /clinics` - Create clinics
- `PATCH /clinics/:id` - Update clinics
- `DELETE /clinics/:id` - Delete clinics
- `POST /clinics/:id/staff` - Manage staff
- `DELETE /clinics/:clinicId/staff/:userId` - Remove staff
- `POST /clinics/:id/services` - Manage services
- `PATCH /clinics/services/:id` - Update services
- `DELETE /clinics/services/:id` - Delete services
- `POST /clinics/:id/photos` - Manage photos
- `DELETE /clinics/photos/:id` - Delete photos

## 🚀 Usage Examples

### Creating a New Clinic

```typescript
const newClinic = await this.clinicsService.create({
  name: 'Borzolini Pet Clinic',
  description: 'Leading veterinary clinic providing comprehensive pet care',
  address: '123 Pet Care Avenue',
  city: 'New York',
  state: 'NY',
  phone: '+1-555-0123',
  email: 'info@borzolini.com',
  services: ['vaccinations', 'surgery', 'dental_care'],
  specializations: ['feline_medicine', 'canine_medicine'],
});
```

### Adding Staff Member

```typescript
const newStaff = await this.clinicsService.addStaff({
  clinic_id: 'clinic-uuid',
  user_id: 'user-uuid',
  role: StaffRole.DOCTOR,
  specialization: 'Veterinary Surgery',
  license_number: 'VET-12345',
  experience_years: 8,
  education: ['Doctor of Veterinary Medicine'],
  bio: 'Experienced veterinary surgeon',
  hire_date: '2024-01-01',
});
```

### Adding Clinic Service

```typescript
const newService = await this.clinicsService.addService({
  clinic_id: 'clinic-uuid',
  name: 'Wellness Exam',
  description: 'Comprehensive health checkup',
  category: ServiceCategory.PREVENTIVE,
  duration_minutes: 45,
  price: 75.0,
  currency: 'USD',
});
```

### Searching Clinics

```typescript
const results = await this.clinicsService.searchClinics('veterinary', {
  page: 1,
  limit: 10,
  sort_by: 'rating',
  sort_order: 'DESC',
});
```

## 🧪 Testing

The module includes comprehensive testing support:

- Unit tests for all service methods
- Integration tests for API endpoints
- Entity validation tests
- Business logic validation tests

## 📈 Performance Features

- **Database Indexing**: Optimized indexes for common queries
- **Query Optimization**: Efficient TypeORM query builders
- **Pagination**: Built-in pagination to handle large datasets
- **Lazy Loading**: Optional relationship loading for performance
- **Caching Ready**: Prepared for Redis caching implementation

## 🔄 Database Migrations

The module includes a comprehensive migration file (`003-create-clinics-tables.sql`) that:

- Creates all necessary tables with proper constraints
- Sets up indexes for optimal performance
- Includes sample data for testing
- Handles foreign key relationships
- Sets up triggers for automatic timestamp updates

## 🌟 Future Enhancements

- **Real-time Updates**: WebSocket support for live clinic updates
- **Advanced Analytics**: Detailed clinic performance metrics
- **Integration APIs**: Third-party service integrations
- **Mobile App Support**: Optimized for mobile applications
- **Multi-language Support**: Internationalization support
- **Advanced Search**: Elasticsearch integration for better search

## 📚 Dependencies

- **NestJS**: Core framework
- **TypeORM**: Database ORM
- **Class Validator**: DTO validation
- **Swagger**: API documentation
- **JWT**: Authentication
- **Role-based Access Control**: Authorization

## 🤝 Contributing

When contributing to the Clinics Module:

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure proper error handling and validation
5. Follow TypeScript best practices
6. Add proper Swagger documentation for new endpoints

## 📄 License

This module is part of the Borzolini Pet Clinic platform and follows the same licensing terms.
