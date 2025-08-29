-- Migration: Create Pets Table
-- Description: Creates comprehensive pets table for the pet clinic platform
-- Date: 2024-01-01

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pets table
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'horse', 'other')),
  breed VARCHAR(100),
  gender VARCHAR(20) NOT NULL DEFAULT 'unknown' CHECK (gender IN ('male', 'female', 'unknown')),
  date_of_birth DATE,
  weight DECIMAL(5,2),
  size VARCHAR(20) CHECK (size IN ('tiny', 'small', 'medium', 'large', 'giant')),
  color VARCHAR(100),
  microchip_number VARCHAR(50),
  is_spayed_neutered BOOLEAN DEFAULT FALSE,
  is_vaccinated BOOLEAN DEFAULT FALSE,
  medical_history TEXT,
  behavioral_notes TEXT,
  dietary_requirements TEXT,
  allergies JSONB DEFAULT '[]',
  medications JSONB DEFAULT '[]',
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  photo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_pets_owner_id FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_gender ON pets(gender);
CREATE INDEX idx_pets_size ON pets(size);
CREATE INDEX idx_pets_is_active ON pets(is_active);
CREATE INDEX idx_pets_is_vaccinated ON pets(is_vaccinated);
CREATE INDEX idx_pets_is_spayed_neutered ON pets(is_spayed_neutered);
CREATE INDEX idx_pets_created_at ON pets(created_at);

-- Create composite indexes for common queries
CREATE INDEX idx_pets_owner_species ON pets(owner_id, species);
CREATE INDEX idx_pets_owner_gender ON pets(owner_id, gender);
CREATE INDEX idx_pets_owner_size ON pets(owner_id, size);

-- Add comments for documentation
COMMENT ON TABLE pets IS 'Comprehensive pet information and health tracking';
COMMENT ON COLUMN pets.species IS 'Type of pet: dog, cat, bird, rabbit, hamster, fish, reptile, horse, other';
COMMENT ON COLUMN pets.gender IS 'Pet gender: male, female, unknown';
COMMENT ON COLUMN pets.size IS 'Size category: tiny, small, medium, large, giant';
COMMENT ON COLUMN pets.allergies IS 'JSON array of pet allergies and sensitivities';
COMMENT ON COLUMN pets.medications IS 'JSON array of current medications';
COMMENT ON COLUMN pets.medical_history IS 'Detailed medical history and notes';
COMMENT ON COLUMN pets.behavioral_notes IS 'Behavioral observations and training notes';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_pets_updated_at();

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON TABLE pets TO postgres;
