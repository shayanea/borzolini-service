-- Migration: Create Appointments Table
-- Description: Creates the main appointments table for the clinic management system
-- Date: 2024-01-01

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(50) NOT NULL DEFAULT 'normal',
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  reason TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescriptions JSONB DEFAULT '[]',
  follow_up_instructions TEXT,
  cost DECIMAL(10,2),
  payment_status VARCHAR(50) DEFAULT 'pending',
  is_telemedicine BOOLEAN DEFAULT FALSE,
  telemedicine_link VARCHAR(500),
  home_visit_address TEXT,
  is_home_visit BOOLEAN DEFAULT FALSE,
  pet_anxiety_mode BOOLEAN DEFAULT FALSE,
  reminder_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign Keys
  owner_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  staff_id UUID,
  service_id UUID,
  
  -- Constraints
  CONSTRAINT fk_appointments_owner_id FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_pet_id FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_clinic_id FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_staff_id FOREIGN KEY (staff_id) REFERENCES clinic_staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_appointments_service_id FOREIGN KEY (service_id) REFERENCES clinic_services(id) ON DELETE SET NULL,
  
  -- Check constraints
  CONSTRAINT chk_appointment_type CHECK (appointment_type IN (
    'consultation', 'vaccination', 'surgery', 'follow_up', 'emergency',
    'wellness_exam', 'dental_cleaning', 'laboratory_test', 'imaging',
    'therapy', 'grooming', 'behavioral_training', 'nutrition_consultation',
    'physical_therapy', 'specialist_consultation'
  )),
  CONSTRAINT chk_appointment_status CHECK (status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled',
    'no_show', 'rescheduled', 'waiting'
  )),
  CONSTRAINT chk_appointment_priority CHECK (priority IN (
    'low', 'normal', 'high', 'urgent', 'emergency'
  )),
  CONSTRAINT chk_payment_status CHECK (payment_status IN (
    'pending', 'paid', 'partial', 'refunded', 'failed'
  ))
);

-- Create indexes for better performance
CREATE INDEX idx_appointments_owner_id ON appointments(owner_id);
CREATE INDEX idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_priority ON appointments(priority);
CREATE INDEX idx_appointments_appointment_type ON appointments(appointment_type);
CREATE INDEX idx_appointments_scheduled_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_is_active ON appointments(is_active);
CREATE INDEX idx_appointments_is_telemedicine ON appointments(is_telemedicine);
CREATE INDEX idx_appointments_is_home_visit ON appointments(is_home_visit);
CREATE INDEX idx_appointments_created_at ON appointments(created_at);

-- Create composite indexes for common queries
CREATE INDEX idx_appointments_owner_status ON appointments(owner_id, status);
CREATE INDEX idx_appointments_clinic_status ON appointments(clinic_id, status);
CREATE INDEX idx_appointments_pet_status ON appointments(pet_id, status);
CREATE INDEX idx_appointments_scheduled_status ON appointments(scheduled_date, status);

-- Add comments for documentation
COMMENT ON TABLE appointments IS 'Main appointments table for clinic management system';
COMMENT ON COLUMN appointments.appointment_type IS 'Type of appointment: consultation, vaccination, surgery, etc.';
COMMENT ON COLUMN appointments.status IS 'Current status: pending, confirmed, in_progress, completed, etc.';
COMMENT ON COLUMN appointments.priority IS 'Priority level: low, normal, high, urgent, emergency';
COMMENT ON COLUMN appointments.prescriptions IS 'JSON array of prescriptions given during appointment';
COMMENT ON COLUMN appointments.reminder_settings IS 'JSON object with reminder preferences';
COMMENT ON COLUMN appointments.pet_anxiety_mode IS 'Flag for low-stress handling preference';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON TABLE appointments TO postgres;
