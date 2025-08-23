-- Migration: Create Clinics Tables
-- Description: Creates comprehensive clinic management tables for the pet clinic platform
-- Date: 2024-01-01

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clinics table
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url VARCHAR(500),
  banner_url VARCHAR(500),
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  operating_hours JSONB NOT NULL DEFAULT '{
    "monday": {"open": "09:00", "close": "17:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
    "thursday": {"open": "09:00", "close": "17:00", "closed": false},
    "friday": {"open": "09:00", "close": "17:00", "closed": false},
    "saturday": {"open": "10:00", "close": "15:00", "closed": false},
    "sunday": {"open": "00:00", "close": "00:00", "closed": true}
  }',
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  services JSONB NOT NULL DEFAULT '[]',
  specializations JSONB NOT NULL DEFAULT '[]',
  payment_methods JSONB NOT NULL DEFAULT '["cash", "credit_card", "insurance"]',
  insurance_providers JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinic_staff table
CREATE TABLE clinic_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'admin', 'doctor', 'assistant', 'receptionist'
  specialization VARCHAR(100),
  license_number VARCHAR(100),
  experience_years INTEGER,
  education TEXT[],
  certifications TEXT[],
  bio TEXT,
  profile_photo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  hire_date DATE NOT NULL,
  termination_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_clinic_staff_clinic_id FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  CONSTRAINT fk_clinic_staff_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create clinic_services table
CREATE TABLE clinic_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'preventive', 'diagnostic', 'surgical', 'emergency', 'wellness'
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  requires_appointment BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_clinic_services_clinic_id FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Create clinic_reviews table
CREATE TABLE clinic_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_helpful_count INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_clinic_reviews_clinic_id FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  CONSTRAINT fk_clinic_reviews_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create clinic_photos table
CREATE TABLE clinic_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  category VARCHAR(100), -- 'facility', 'staff', 'equipment', 'waiting_area', 'examination_room'
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_clinic_photos_clinic_id FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Create clinic_operating_hours table (alternative to JSONB approach)
CREATE TABLE clinic_operating_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_clinic_operating_hours_clinic_id FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Create clinic_appointments table
CREATE TABLE clinic_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  staff_id UUID,
  service_id UUID,
  appointment_type VARCHAR(50) NOT NULL, -- 'consultation', 'vaccination', 'surgery', 'follow_up', 'emergency'
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  notes TEXT,
  consultation_link VARCHAR(500),
  address TEXT,
  is_telemedicine BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_clinic_appointments_clinic_id FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  CONSTRAINT fk_clinic_appointments_pet_id FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_clinic_appointments_owner_id FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_clinic_appointments_staff_id FOREIGN KEY (staff_id) REFERENCES clinic_staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_clinic_appointments_service_id FOREIGN KEY (service_id) REFERENCES clinic_services(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_clinics_name ON clinics(name);
CREATE INDEX idx_clinics_city ON clinics(city);
CREATE INDEX idx_clinics_is_active ON clinics(is_active);
CREATE INDEX idx_clinics_is_verified ON clinics(is_verified);
CREATE INDEX idx_clinics_rating ON clinics(rating);
CREATE INDEX idx_clinics_created_at ON clinics(created_at);

CREATE INDEX idx_clinic_staff_clinic_id ON clinic_staff(clinic_id);
CREATE INDEX idx_clinic_staff_user_id ON clinic_staff(user_id);
CREATE INDEX idx_clinic_staff_role ON clinic_staff(role);
CREATE INDEX idx_clinic_staff_is_active ON clinic_staff(is_active);

CREATE INDEX idx_clinic_services_clinic_id ON clinic_services(clinic_id);
CREATE INDEX idx_clinic_services_category ON clinic_services(category);
CREATE INDEX idx_clinic_services_is_active ON clinic_services(is_active);

CREATE INDEX idx_clinic_reviews_clinic_id ON clinic_reviews(clinic_id);
CREATE INDEX idx_clinic_reviews_user_id ON clinic_reviews(user_id);
CREATE INDEX idx_clinic_reviews_rating ON clinic_reviews(rating);
CREATE INDEX idx_clinic_reviews_created_at ON clinic_reviews(created_at);

CREATE INDEX idx_clinic_photos_clinic_id ON clinic_photos(clinic_id);
CREATE INDEX idx_clinic_photos_category ON clinic_photos(category);
CREATE INDEX idx_clinic_photos_is_active ON clinic_photos(is_active);

CREATE INDEX idx_clinic_operating_hours_clinic_id ON clinic_operating_hours(clinic_id);
CREATE INDEX idx_clinic_operating_hours_day ON clinic_operating_hours(day_of_week);

CREATE INDEX idx_clinic_appointments_clinic_id ON clinic_appointments(clinic_id);
CREATE INDEX idx_clinic_appointments_pet_id ON clinic_appointments(pet_id);
CREATE INDEX idx_clinic_appointments_owner_id ON clinic_appointments(owner_id);
CREATE INDEX idx_clinic_appointments_staff_id ON clinic_appointments(staff_id);
CREATE INDEX idx_clinic_appointments_status ON clinic_appointments(status);
CREATE INDEX idx_clinic_appointments_scheduled_date ON clinic_appointments(scheduled_date);

-- Create unique constraints
CREATE UNIQUE INDEX idx_clinic_staff_clinic_user_unique ON clinic_staff(clinic_id, user_id);
CREATE UNIQUE INDEX idx_clinic_services_clinic_name_unique ON clinic_services(clinic_id, name);
CREATE UNIQUE INDEX idx_clinic_reviews_clinic_user_unique ON clinic_reviews(clinic_id, user_id);
CREATE UNIQUE INDEX idx_clinic_operating_hours_clinic_day_unique ON clinic_operating_hours(clinic_id, day_of_week);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_staff_updated_at BEFORE UPDATE ON clinic_staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_services_updated_at BEFORE UPDATE ON clinic_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_reviews_updated_at BEFORE UPDATE ON clinic_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_operating_hours_updated_at BEFORE UPDATE ON clinic_operating_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_appointments_updated_at BEFORE UPDATE ON clinic_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample clinic data
INSERT INTO clinics (
  name,
  description,
  address,
  city,
  state,
  postal_code,
  country,
  phone,
  email,
  website,
  is_verified,
  is_active,
  services,
  specializations
) VALUES (
  'Borzolini Pet Clinic',
  'Leading veterinary clinic providing comprehensive pet care with state-of-the-art facilities and experienced staff.',
  '123 Pet Care Avenue',
  'New York',
  'NY',
  '10001',
  'USA',
  '+1-555-0123',
  'info@borzolini.com',
  'https://borzolini.com',
  true,
  true,
  '["vaccinations", "surgery", "dental_care", "emergency_care", "wellness_exams"]',
  '["feline_medicine", "canine_medicine", "exotic_pets", "emergency_medicine"]'
);

-- Insert sample clinic staff
INSERT INTO clinic_staff (
  clinic_id,
  user_id,
  role,
  specialization,
  license_number,
  experience_years,
  education,
  bio,
  hire_date
) 
SELECT 
  c.id,
  u.id,
  'admin',
  'Clinic Management',
  'ADM-001',
  5,
  '{"Veterinary Business Administration", "Healthcare Management"}',
  'Experienced clinic administrator with expertise in veterinary practice management.',
  '2023-01-01'
FROM clinics c, users u 
WHERE c.name = 'Borzolini Pet Clinic' AND u.email = 'admin@borzolini.com';

-- Insert sample clinic services
INSERT INTO clinic_services (
  clinic_id,
  name,
  description,
  category,
  duration_minutes,
  price
)
SELECT 
  c.id,
  'Wellness Exam',
  'Comprehensive health checkup including physical examination and vaccinations',
  'preventive',
  45,
  75.00
FROM clinics c WHERE c.name = 'Borzolini Pet Clinic';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON TABLE clinics TO postgres;
GRANT ALL PRIVILEGES ON TABLE clinic_staff TO postgres;
GRANT ALL PRIVILEGES ON TABLE clinic_services TO postgres;
GRANT ALL PRIVILEGES ON TABLE clinic_reviews TO postgres;
GRANT ALL PRIVILEGES ON TABLE clinic_photos TO postgres;
GRANT ALL PRIVILEGES ON TABLE clinic_operating_hours TO postgres;
GRANT ALL PRIVILEGES ON TABLE clinic_appointments TO postgres;
