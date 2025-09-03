# Export Functionality Documentation

## Overview

The export functionality allows users to export data from the clinic management system in CSV and Excel formats. This feature supports exporting data for clinics, users, pets, and appointments with comprehensive filtering options.

## Features

- **Multiple Formats**: Support for both CSV and Excel (.xlsx) export formats
- **Comprehensive Filtering**: All existing filter options are available for exports
- **Role-Based Access**: Different access levels based on user roles
- **Large Dataset Support**: Optimized for exporting large amounts of data
- **Formatted Headers**: Human-readable column headers in exports

## Available Export Endpoints

### 1. Clinics Export

#### CSV Export

- **Endpoint**: `GET /clinics/export/csv`
- **Access**: Admin, Veterinarian, Staff
- **Authentication**: Required (JWT Bearer token)

#### Excel Export

- **Endpoint**: `GET /clinics/export/excel`
- **Access**: Admin, Veterinarian, Staff
- **Authentication**: Required (JWT Bearer token)

#### Available Filters

- `name` - Filter by clinic name
- `city` - Filter by city
- `state` - Filter by state
- `is_verified` - Filter by verification status
- `is_active` - Filter by active status
- `services` - Filter by services offered (comma-separated)
- `specializations` - Filter by specializations (comma-separated)
- `rating_min` - Minimum rating filter
- `rating_max` - Maximum rating filter

#### Example Usage

```bash
# Export all clinics to CSV
GET /clinics/export/csv

# Export verified clinics in New York to Excel
GET /clinics/export/excel?is_verified=true&state=NY

# Export clinics with specific services
GET /clinics/export/csv?services=vaccinations,surgery&rating_min=4
```

### 2. Users Export

#### CSV Export

- **Endpoint**: `GET /users/export/csv`
- **Access**: Admin only
- **Authentication**: Required (JWT Bearer token)

#### Excel Export

- **Endpoint**: `GET /users/export/excel`
- **Access**: Admin only
- **Authentication**: Required (JWT Bearer token)

#### Available Filters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10000)
- `search` - Search by name or email
- `role` - Filter by user role (admin, veterinarian, staff, patient)
- `isActive` - Filter by active status (true/false)

#### Example Usage

```bash
# Export all users to CSV
GET /users/export/csv

# Export only patients to Excel
GET /users/export/excel?role=patient

# Export active veterinarians
GET /users/export/csv?role=veterinarian&isActive=true
```

### 3. Pets Export

#### CSV Export

- **Endpoint**: `GET /pets/export/csv`
- **Access**: Admin, Veterinarian, Staff
- **Authentication**: Required (JWT Bearer token)

#### Excel Export

- **Endpoint**: `GET /pets/export/excel`
- **Access**: Admin, Veterinarian, Staff
- **Authentication**: Required (JWT Bearer token)

#### Available Filters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10000)
- `species` - Filter by pet species
- `gender` - Filter by pet gender
- `size` - Filter by pet size
- `is_spayed_neutered` - Filter by spayed/neutered status
- `is_vaccinated` - Filter by vaccination status
- `search` - Search in name, breed, or color
- `owner_id` - Filter by owner ID (admin only)

#### Example Usage

```bash
# Export all pets to CSV
GET /pets/export/csv

# Export dogs only to Excel
GET /pets/export/excel?species=DOG

# Export vaccinated pets
GET /pets/export/csv?is_vaccinated=true

# Export pets by specific owner (admin only)
GET /pets/export/excel?owner_id=123e4567-e89b-12d3-a456-426614174000
```

### 4. Appointments Export

#### CSV Export

- **Endpoint**: `GET /appointments/export/csv`
- **Access**: Admin, Veterinarian, Staff
- **Authentication**: Required (JWT Bearer token)

#### Excel Export

- **Endpoint**: `GET /appointments/export/excel`
- **Access**: Admin, Veterinarian, Staff
- **Authentication**: Required (JWT Bearer token)

#### Available Filters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10000)
- `status` - Filter by appointment status
- `type` - Filter by appointment type
- `clinic_id` - Filter by clinic ID
- `staff_id` - Filter by staff ID
- `pet_id` - Filter by pet ID
- `owner_id` - Filter by owner ID (admin only)
- `date_from` - Filter by start date (ISO string)
- `date_to` - Filter by end date (ISO string)
- `is_telemedicine` - Filter by telemedicine appointments
- `search` - Search in pet name, owner name, or notes

#### Example Usage

```bash
# Export all appointments to CSV
GET /appointments/export/csv

# Export appointments for a specific date range
GET /appointments/export/excel?date_from=2024-01-01&date_to=2024-01-31

# Export telemedicine appointments
GET /appointments/export/csv?is_telemedicine=true

# Export appointments by clinic
GET /appointments/export/excel?clinic_id=123e4567-e89b-12d3-a456-426614174000
```

## Export Data Structure

### Clinics Export Fields

- `id` - Clinic ID
- `name` - Clinic name
- `description` - Clinic description
- `address` - Street address
- `city` - City
- `state` - State
- `zip_code` - ZIP code
- `phone` - Phone number
- `email` - Email address
- `website` - Website URL
- `rating` - Average rating
- `is_verified` - Verification status
- `is_active` - Active status
- `services` - Comma-separated list of services
- `specializations` - Comma-separated list of specializations
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Users Export Fields

- `id` - User ID
- `email` - Email address
- `first_name` - First name
- `last_name` - Last name
- `phone` - Phone number
- `role` - User role
- `is_active` - Active status
- `is_phone_verified` - Phone verification status
- `profile_completion_percentage` - Profile completion percentage
- `date_of_birth` - Date of birth
- `gender` - Gender
- `address` - Street address
- `city` - City
- `state` - State
- `zip_code` - ZIP code
- `emergency_contact_name` - Emergency contact name
- `emergency_contact_phone` - Emergency contact phone
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Pets Export Fields

- `id` - Pet ID
- `name` - Pet name
- `species` - Pet species
- `breed` - Pet breed
- `gender` - Pet gender
- `date_of_birth` - Date of birth
- `age` - Calculated age
- `age_in_months` - Age in months
- `weight` - Weight
- `size` - Pet size
- `color` - Pet color
- `is_spayed_neutered` - Spayed/neutered status
- `is_vaccinated` - Vaccination status
- `medical_history` - Medical history
- `owner_id` - Owner ID
- `owner_name` - Owner full name
- `owner_email` - Owner email
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Appointments Export Fields

- `id` - Appointment ID
- `scheduled_date` - Scheduled date and time
- `duration_minutes` - Duration in minutes
- `status` - Appointment status
- `type` - Appointment type
- `priority` - Priority level
- `notes` - Appointment notes
- `is_telemedicine` - Telemedicine flag
- `home_visit_address` - Home visit address
- `pet_id` - Pet ID
- `pet_name` - Pet name
- `pet_species` - Pet species
- `owner_id` - Owner ID
- `owner_name` - Owner full name
- `owner_email` - Owner email
- `clinic_id` - Clinic ID
- `clinic_name` - Clinic name
- `staff_id` - Staff ID
- `staff_name` - Staff full name
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Response Format

### Success Response

- **Status Code**: 200
- **Content-Type**:
  - CSV: `text/csv`
  - Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="[entity_type]_export_[date].[extension]"`

### Error Responses

- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Insufficient permissions for the requested operation
- **404 Not Found**: No data available for export
- **500 Internal Server Error**: Error generating export file

## Usage Examples

### Frontend Integration

```typescript
// Export clinics to CSV
const exportClinicsToCSV = async (filters: any) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`/api/clinics/export/csv?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clinics_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
};

// Export users to Excel
const exportUsersToExcel = async (filters: any) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`/api/users/export/excel?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
```

### cURL Examples

```bash
# Export all clinics to CSV
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -o clinics_export.csv \
     "http://localhost:3001/clinics/export/csv"

# Export pets with specific filters to Excel
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -o pets_export.xlsx \
     "http://localhost:3001/pets/export/excel?species=DOG&is_vaccinated=true"

# Export appointments for date range
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -o appointments_export.csv \
     "http://localhost:3001/appointments/export/csv?date_from=2024-01-01&date_to=2024-01-31"
```

## Performance Considerations

- **Large Datasets**: The export functionality is optimized for large datasets with a default limit of 10,000 records
- **Memory Usage**: Excel exports use streaming to minimize memory usage
- **File Size**: CSV files are generally smaller and faster to generate than Excel files
- **Timeout**: For very large exports, consider implementing pagination or background job processing

## Security Considerations

- **Authentication**: All export endpoints require valid JWT authentication
- **Authorization**: Role-based access control ensures users can only export data they have permission to access
- **Data Privacy**: Sensitive information is handled according to the same privacy rules as regular API endpoints
- **Rate Limiting**: Export endpoints are subject to the same rate limiting as other API endpoints

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Ensure you're providing a valid JWT token in the Authorization header
2. **403 Forbidden**: Check that your user role has permission to access the export endpoint
3. **404 Not Found**: Verify that there is data available for the specified filters
4. **Large File Downloads**: For very large exports, consider using pagination or background processing

### Error Handling

```typescript
try {
  const response = await fetch('/api/clinics/export/csv', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Export failed:', error.message);
    return;
  }

  // Handle successful export
  const blob = await response.blob();
  // ... download logic
} catch (error) {
  console.error('Network error:', error);
}
```

## Future Enhancements

- **Background Processing**: Implement background job processing for very large exports
- **Email Delivery**: Send export files via email for large datasets
- **Custom Field Selection**: Allow users to select which fields to include in exports
- **Scheduled Exports**: Implement scheduled/automated exports
- **Export History**: Track and manage export history
- **Additional Formats**: Support for JSON, XML, and other export formats
