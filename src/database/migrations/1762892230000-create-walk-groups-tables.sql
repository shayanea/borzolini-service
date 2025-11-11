-- Migration: Create Walk Groups Tables
-- Description: Creates walk_groups and walk_group_participants tables for organizing group walking events
-- Date: 2025-11-12

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'walk_group_visibility') THEN
    CREATE TYPE walk_group_visibility AS ENUM ('public', 'private');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'walk_group_status') THEN
    CREATE TYPE walk_group_status AS ENUM ('scheduled', 'cancelled', 'completed');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_status') THEN
    CREATE TYPE participant_status AS ENUM ('joined', 'cancelled', 'attended');
  END IF;
END $$;

-- Create walk_groups table
CREATE TABLE walk_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  location_name VARCHAR(255),
  address TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  max_participants INT NOT NULL DEFAULT 10 CHECK (max_participants >= 2 AND max_participants <= 50),
  visibility walk_group_visibility NOT NULL DEFAULT 'public',
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  invite_url VARCHAR(500) NOT NULL,
  compatibility_rules JSONB NOT NULL DEFAULT '{
    "allowed_species": [],
    "allowed_sizes": [],
    "restricted_temperaments": [],
    "require_vaccinated": true,
    "require_spayed_neutered": false
  }'::jsonb,
  organizer_id UUID NOT NULL,
  status walk_group_status NOT NULL DEFAULT 'scheduled',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_walk_groups_organizer_id FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_location_required CHECK (address IS NOT NULL AND address != '')
);

-- Create walk_group_participants table
CREATE TABLE walk_group_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  walk_group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status participant_status NOT NULL DEFAULT 'joined',
  notes TEXT,
  
  CONSTRAINT fk_walk_group_participants_walk_group_id FOREIGN KEY (walk_group_id) REFERENCES walk_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_walk_group_participants_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_walk_group_participants_pet_id FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT uq_walk_group_participants_walk_group_pet UNIQUE (walk_group_id, pet_id)
);

-- Create indexes for better performance
CREATE INDEX idx_walk_groups_organizer_id ON walk_groups(organizer_id);
CREATE INDEX idx_walk_groups_status ON walk_groups(status);
CREATE INDEX idx_walk_groups_scheduled_date ON walk_groups(scheduled_date);
CREATE INDEX idx_walk_groups_visibility ON walk_groups(visibility);
CREATE INDEX idx_walk_groups_is_active ON walk_groups(is_active);
CREATE INDEX idx_walk_groups_invite_code ON walk_groups(invite_code);
CREATE INDEX idx_walk_groups_city ON walk_groups(city);
CREATE INDEX idx_walk_groups_country ON walk_groups(country);

-- Create composite indexes for common queries
CREATE INDEX idx_walk_groups_status_scheduled_date ON walk_groups(status, scheduled_date);
CREATE INDEX idx_walk_groups_city_status ON walk_groups(city, status);
CREATE INDEX idx_walk_groups_organizer_status ON walk_groups(organizer_id, status);

-- Create indexes for walk_group_participants
CREATE INDEX idx_walk_group_participants_walk_group_id ON walk_group_participants(walk_group_id);
CREATE INDEX idx_walk_group_participants_user_id ON walk_group_participants(user_id);
CREATE INDEX idx_walk_group_participants_pet_id ON walk_group_participants(pet_id);
CREATE INDEX idx_walk_group_participants_status ON walk_group_participants(status);

-- Create composite index for user's participation
CREATE INDEX idx_walk_group_participants_user_status ON walk_group_participants(user_id, status);

-- Add comments for documentation
COMMENT ON TABLE walk_groups IS 'Walk groups for organizing group walking events with pets';
COMMENT ON COLUMN walk_groups.invite_code IS 'Unique invite code for joining the walk group (8 characters, alphanumeric)';
COMMENT ON COLUMN walk_groups.invite_url IS 'Shareable URL for joining the walk group';
COMMENT ON COLUMN walk_groups.compatibility_rules IS 'JSONB object containing pet compatibility rules (species, size, temperament, vaccination, etc.)';
COMMENT ON TABLE walk_group_participants IS 'Participants (pets and owners) in walk groups';

