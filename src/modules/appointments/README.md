# Appointments Module The Appointments Module provides appointment scheduling and management functionality for the clinic management system.
## Features
- **Appointment CRUD Operations**: Create, read, update, and delete appointments
- **Smart Scheduling**: Conflict detection and prevention
- **Multiple Appointment Types**: Consultation, vaccination, surgery, emergency, and more
- **Status Management**: Track appointment lifecycle from pending to completed
- **Priority System**: Handle urgent and emergency cases
- **Telemedicine Support**: Virtual consultation capabilities
- **Home Visit Support**: On-site veterinary services
- **Time Slot Management**: Available time slot discovery
- **Filtering**: Filter by status, type, priority, clinic, staff, and more
- **Statistics & Analytics**: appointment insights
## Entities
### Appointment Entity
- **Basic Information**: Type, status, priority, scheduled date, duration
- **Timing**: Actual start/end times, estimated end time
- **Medical Details**: Reason, symptoms, diagnosis, treatment plan, prescriptions
- **Service Options**: Telemedicine, home visits, consultation links
- **Financial**: Cost, payment status
- **Reminders**: Email, SMS, push notification settings
- **Computed Properties**: Overdue status, upcoming status, time until appointment
### Enums
- **AppointmentType**: CONSULTATION, VACCINATION, SURGERY, FOLLOW_UP, EMERGENCY, WELLNESS_EXAM, DENTAL_CLEANING, LABORATORY_TEST, IMAGING, THERAPY, GROOMING, BEHAVIORAL_TRAINING, NUTRITION_CONSULTATION, PHYSICAL_THERAPY, SPECIALIST_CONSULTATION
- **AppointmentStatus**: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED, WAITING
- **AppointmentPriority**: LOW, NORMAL, HIGH, URGENT, EMERGENCY
## API Endpoints
### Public Endpoints
None - all endpoints require authentication
### Protected Endpoints
- `POST /appointments` - Create a new appointment
- `GET /appointments` - Get all appointments with filtering and pagination
- `GET /appointments/my-appointments` - Get current user's appointments
- `GET /appointments/:id` - Get appointment by ID
- `PATCH /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Cancel appointment
### Special Endpoints
- `GET /appointments/pet/:petId` - Get appointments by pet
- `GET /appointments/clinic/:clinicId` - Get appointments by clinic (admin/vet/staff only)
- `GET /appointments/staff/:staffId` - Get appointments by staff member (admin/vet/staff only)
- `GET /appointments/stats` - Get appointment statistics (admin/vet/staff only)
- `GET /appointments/available-slots/:clinicId` - Get available time slots
- `PATCH /appointments/:id/status` - Update appointment status
- `PATCH /appointments/:id/reschedule` - Reschedule appointment
- `GET /appointments/today` - Get today's appointments
- `GET /appointments/upcoming` - Get upcoming appointments
## Business Logic
### Appointment Creation
- Validates pet ownership and clinic availability
- Checks for scheduling conflicts
- Automatically sets default status and priority
- Supports telemedicine and home visit options
### Conflict Detection
- Prevents double-booking of pets
- Checks for overlapping time slots
- Considers appointment duration
- Validates staff and clinic availability
### Status Management
- Automatic timing updates (start/end times)
- Status-based workflow enforcement
- Rescheduling capabilities
- Cancellation handling
### Access Control
- Users can only access their own appointments
- Admins, veterinarians, and staff can access all appointments
- Role-based filtering and statistics access
## Dependencies
- **UsersModule**: For user validation and owner relationships
- **PetsModule**: For pet validation and relationships
- **ClinicsModule**: For clinic, staff, and service validation
- **TypeORM**: For database operations and entity management
- **Auth Guards**: JWT authentication and role-based access control
## Usage Examples
### Creating an Appointment
```typescript
const newAppointment = await appointmentsService.create({
 appointment_type: AppointmentType.CONSULTATION,
 scheduled_date: '2024-01-15T10:00:00Z',
 duration_minutes: 30,
 reason: 'Annual wellness checkup',
 pet_id: 'pet-uuid',
 clinic_id: 'clinic-uuid',
 staff_id: 'staff-uuid',
 is_telemedicine: false,
}, userId);
```
### Filtering Appointments
```typescript
const filters: AppointmentFilters = {
 status: AppointmentStatus.CONFIRMED,
 type: AppointmentType.VACCINATION,
 clinic_id: 'clinic-uuid',
 date_from: new Date('2024-01-01'),
 date_to: new Date('2024-01-31'),
};
const result = await appointmentsService.findAll(filters, 1, 10);
```
### Getting Available Time Slots
```typescript
const availableSlots = await appointmentsService.getAvailableTimeSlots(
 'clinic-uuid',
 new Date('2024-01-15'),
 30 // 30-minute slots
);
```
### Updating Appointment Status
```typescript
const updatedAppointment = await appointmentsService.updateStatus(
 'appointment-uuid',
 AppointmentStatus.IN_PROGRESS,
 userId,
 userRole
);
```
## Database Schema
The appointments table includes:
- UUID primary key
- Foreign key relationships (owner, pet, clinic, staff, service)
- appointment details
- Timestamps for creation and updates
- Soft delete support via is_active flag
- JSON fields for flexible data storage
## Integration Points
### With Pets Module
- Links appointments to specific pets
- Validates pet ownership
- Tracks pet medical history
### With Clinics Module
- Associates appointments with clinics
- Links to staff members and services
- Manages clinic schedules
### With Users Module
- Tracks appointment owners
- Manages user permissions
- Handles user-specific views
## Future Enhancements
- **Calendar Integration**: Google Calendar, Outlook sync
- **Notification System**: Automated reminders and updates
- **Payment Processing**: Integrated billing and payments
- **Video Conferencing**: Built-in telemedicine platform
- **Mobile App Support**: Push notifications and mobile scheduling
- **AI Scheduling**: Intelligent appointment optimization
- **Recurring Appointments**: Regular checkup scheduling
- **Waitlist Management**: Automatic fill-in for cancellations
