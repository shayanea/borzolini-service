# Sample Data Documentation 🗃️

This document describes all the sample data that will be created when running the database seeders.

## 🌱 Database Seeding Overview

The seeding process creates a complete, realistic dataset for testing and development purposes. All data is interconnected and follows proper relationships.

## 👥 Users Data

### Admin Users
- **admin@borzolini.com** - System administrator with full access
  - Role: Admin
  - Location: New York, USA
  - Verified: Yes

### Veterinary Staff
- **dr.smith@borzolini.com** - Dr. Sarah Smith
  - Role: Veterinarian
  - Specialization: General Veterinary Medicine
  - Experience: 8 years
  - Location: Chicago, USA

- **dr.johnson@borzolini.com** - Dr. Michael Johnson
  - Role: Veterinarian
  - Specialization: General Veterinary Medicine
  - Experience: 8 years
  - Location: Denver, USA

- **dr.garcia@borzolini.com** - Dr. Maria Garcia
  - Role: Veterinarian
  - Specialization: General Veterinary Medicine
  - Experience: 8 years
  - Location: Phoenix, USA

### Support Staff
- **nurse.wilson@borzolini.com** - Nurse Emily Wilson
  - Role: Staff
  - Specialization: Veterinary Nursing
  - Experience: 3 years
  - Location: Los Angeles, USA

### Patient Users (Pet Owners)
- **john.doe@example.com** - John Doe
  - Role: Patient
  - Location: New York, USA
  - Insurance: Blue Cross Blue Shield

- **jane.smith@example.com** - Jane Smith
  - Role: Patient
  - Location: Chicago, USA
  - Insurance: Aetna

- **mike.brown@example.com** - Mike Brown
  - Role: Patient
  - Location: Denver, USA
  - Insurance: None

- **sarah.wilson@example.com** - Sarah Wilson
  - Role: Patient
  - Location: Los Angeles, USA
  - Insurance: Cigna

- **alex.chen@example.com** - Alex Chen
  - Role: Patient
  - Location: Seattle, USA
  - Insurance: UnitedHealth

## 🏥 Clinics Data

### 1. Borzolini Pet Clinic
- **Location**: New York, NY, USA
- **Services**: Vaccinations, surgery, dental care, emergency care, wellness exams
- **Specializations**: Feline medicine, canine medicine, exotic pets, emergency medicine
- **Status**: Verified, Active
- **Operating Hours**: Mon-Fri 9AM-5PM, Sat 10AM-3PM, Sun Closed

### 2. Happy Paws Veterinary Center
- **Location**: Los Angeles, CA, USA
- **Services**: Preventive care, vaccinations, wellness exams, nutrition counseling
- **Specializations**: Preventive medicine, nutrition, behavioral medicine
- **Status**: Verified, Active
- **Operating Hours**: Mon-Fri 8AM-6PM, Sat 9AM-4PM, Sun Closed

### 3. Emergency Pet Hospital
- **Location**: Chicago, IL, USA
- **Services**: Emergency care, critical care, emergency surgery, trauma treatment
- **Specializations**: Emergency medicine, critical care, trauma surgery
- **Status**: Verified, Active
- **Operating Hours**: 24/7

## 🐕 Pets Data

### John Doe's Pets
1. **Buddy** - Golden Retriever (Male, Large)
   - Age: ~4 years
   - Weight: 65.5 lbs
   - Status: Vaccinated, Spayed/Neutered
   - Special needs: Grain-free diet, allergies to chicken and wheat

2. **Luna** - Domestic Shorthair (Female, Small)
   - Age: ~2.5 years
   - Weight: 8.2 lbs
   - Status: Vaccinated, Spayed/Neutered
   - Special needs: High-protein diet

### Jane Smith's Pets
1. **Max** - Labrador Retriever (Male, Large)
   - Age: ~4 years
   - Weight: 72.0 lbs
   - Status: Vaccinated, Spayed/Neutered
   - Special needs: Hip dysplasia monitoring, joint health formula

2. **Whiskers** - Persian (Male, Medium)
   - Age: ~4 years
   - Weight: 12.5 lbs
   - Status: Vaccinated, Spayed/Neutered
   - Special needs: Regular grooming, eye care routine

### Mike Brown's Pets
1. **Rocky** - German Shepherd (Male, Large)
   - Age: ~2.5 years
   - Weight: 78.0 lbs
   - Status: Vaccinated, Not Spayed/Neutered
   - Special needs: Service dog training, high-quality working dog food

### Sarah Wilson's Pets
1. **Bella** - Cavalier King Charles Spaniel (Female, Small)
   - Age: ~2 years
   - Weight: 18.5 lbs
   - Status: Vaccinated, Spayed/Neutered
   - Special needs: Heart monitoring, heart-healthy diet

2. **Oliver** - Maine Coon (Male, Large)
   - Age: ~2.5 years
   - Weight: 16.8 lbs
   - Status: Vaccinated, Spayed/Neutered
   - Special needs: Regular dental care, large breed monitoring

### Alex Chen's Pets
1. **Shadow** - Border Collie (Female, Medium)
   - Age: ~3.5 years
   - Weight: 42.0 lbs
   - Status: Vaccinated, Spayed/Neutered
   - Special needs: Active working dog, mental stimulation

2. **Mittens** - Ragdoll (Female, Medium)
   - Age: ~2 years
   - Weight: 11.2 lbs
   - Status: Vaccinated, Spayed/Neutered
   - Special needs: Regular grooming, gentle handling

## 📅 Appointments Data

### Wellness Exams
- **Buddy** - Annual wellness checkup at Borzolini Pet Clinic
- **Max** - Annual wellness checkup at Borzolini Pet Clinic
- **Bella** - Annual wellness checkup at Happy Paws Veterinary Center

### Vaccinations
- **Luna** - Core vaccinations at Borzolini Pet Clinic
- **Shadow** - Annual vaccinations at Happy Paws Veterinary Center

### Dental Care
- **Whiskers** - Professional dental cleaning at Borzolini Pet Clinic
- **Oliver** - Dental cleaning at Borzolini Pet Clinic

### Emergency Care
- **Rocky** - Emergency consultation for service dog training injury

### Telemedicine
- **Mittens** - Telemedicine wellness checkup with behavioral consultation

### Follow-up Appointments
- **Max** - Follow-up on hip dysplasia treatment
- **Buddy** - Booster vaccinations at Happy Paws
- **Luna** - 6-month wellness checkup
- **Shadow** - Working dog fitness assessment

## 🏥 Clinic Services

### Preventive Care
- Wellness Exam ($75, 45 min)
- Vaccination ($45, 30 min)

### Dental Care
- Dental Cleaning ($150, 60 min)

### Emergency Care
- Emergency Care ($200, 90 min)

### Surgical Procedures
- Surgery ($500, 120 min)

### Diagnostic Services
- Laboratory Tests ($85, 30 min)
- X-Ray Imaging ($120, 45 min)

### Specialized Services
- Behavioral Consultation ($95, 60 min)
- Nutrition Consultation ($65, 45 min)
- Grooming ($75, 90 min)

## 🔐 Authentication

- **Default Password**: `Password123!` for all users
- **JWT Authentication**: Required for all protected endpoints
- **Role-Based Access**: Different permissions based on user role

## 📊 Data Statistics

- **Total Users**: 10 (1 Admin, 3 Veterinarians, 1 Staff, 5 Patients)
- **Total Clinics**: 3
- **Total Pets**: 9
- **Total Appointments**: 15
- **Total Services**: 10 per clinic

## 🚀 Running the Seeders

```bash
# Run all seeders
pnpm run seed

# Or run individually
pnpm run seed:users
pnpm run seed:clinics
pnpm run seed:pets
pnpm run seed:appointments
```

## 🔄 Clearing Data

```bash
# Clear all seeded data
pnpm run seed:clear
```

## 📝 Notes

- All data is realistic and follows proper veterinary practice patterns
- Relationships between entities are properly maintained
- Sample data includes various scenarios (emergencies, telemedicine, follow-ups)
- Data spans multiple time periods for realistic testing
- All required fields are populated with meaningful values
- Foreign key relationships are properly established

## 🎯 Use Cases

This sample data supports testing of:
- User authentication and authorization
- Pet management workflows
- Appointment scheduling and management
- Clinic operations
- Multi-clinic scenarios
- Emergency and telemedicine features
- Follow-up appointment workflows
- Role-based access control
- Data filtering and search
- Reporting and analytics
