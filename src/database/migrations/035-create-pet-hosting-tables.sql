-- Migration: Create Pet Hosting Tables
-- Description: Creates tables for pet hosting module including hosts, bookings, availability, reviews, and photos
-- Date: 2024-01-15

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pet_hosts table
CREATE TABLE pet_hosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  
  -- Host Profile
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  certifications JSONB DEFAULT '[]',
  
  -- Location
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Capacity
  max_pets INTEGER NOT NULL DEFAULT 1,
  pet_size_preferences JSONB DEFAULT '[]',
  
  -- Amenities & Services
  amenities JSONB DEFAULT '[]',
  services_offered JSONB DEFAULT '[]',
  
  -- Pricing
  base_daily_rate DECIMAL(10, 2) NOT NULL DEFAULT 30.00,
  size_pricing_tiers JSONB DEFAULT '{"small": 1.0, "medium": 1.2, "large": 1.5, "giant": 2.0}',
  duration_discounts JSONB DEFAULT '{"weekly": 0.1, "monthly": 0.2}',
  
  -- Trust Metrics
  response_rate DECIMAL(5, 2) DEFAULT 0.00,
  completion_rate DECIMAL(5, 2) DEFAULT 0.00,
  response_time_avg_hours DECIMAL(5, 2),
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_super_host BOOLEAN DEFAULT FALSE,
  
  -- Ratings
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_pet_hosts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_max_pets CHECK (max_pets > 0),
  CONSTRAINT chk_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT chk_response_rate CHECK (response_rate >= 0 AND response_rate <= 100),
  CONSTRAINT chk_completion_rate CHECK (completion_rate >= 0 AND completion_rate <= 100)
);

-- Create pet_hosting_bookings table
CREATE TABLE pet_hosting_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dates
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  size_multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
  duration_discount DECIMAL(5, 4) DEFAULT 0.00,
  additional_services_fee DECIMAL(10, 2) DEFAULT 0.00,
  total_price DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending_approval',
  
  -- Special Requirements
  special_instructions TEXT,
  medication_schedule JSONB DEFAULT '[]',
  dietary_needs TEXT,
  
  -- Host Approval
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending',
  
  -- Foreign Keys
  host_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_pet_hosting_bookings_host_id FOREIGN KEY (host_id) REFERENCES pet_hosts(id) ON DELETE CASCADE,
  CONSTRAINT fk_pet_hosting_bookings_pet_id FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_pet_hosting_bookings_owner_id FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_booking_status CHECK (status IN (
    'pending_approval', 'approved', 'rejected', 'confirmed', 
    'in_progress', 'completed', 'cancelled'
  )),
  CONSTRAINT chk_checkout_after_checkin CHECK (check_out_date > check_in_date),
  CONSTRAINT chk_payment_status CHECK (payment_status IN (
    'pending', 'paid', 'partial', 'refunded', 'failed'
  ))
);

-- Create pet_host_availability table
CREATE TABLE pet_host_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_pets_available INTEGER NOT NULL DEFAULT 1,
  custom_daily_rate DECIMAL(10, 2),
  is_blocked BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_pet_host_availability_host_id FOREIGN KEY (host_id) REFERENCES pet_hosts(id) ON DELETE CASCADE,
  CONSTRAINT chk_availability_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_max_pets_available CHECK (max_pets_available > 0)
);

-- Create pet_host_reviews table
CREATE TABLE pet_host_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  host_id UUID NOT NULL,
  booking_id UUID NOT NULL,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  
  -- Multi-dimensional Ratings
  care_quality INTEGER NOT NULL CHECK (care_quality >= 1 AND care_quality <= 5),
  communication INTEGER NOT NULL CHECK (communication >= 1 AND communication <= 5),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
  overall INTEGER NOT NULL CHECK (overall >= 1 AND overall <= 5),
  
  -- Review Content
  title VARCHAR(255),
  comment TEXT,
  review_photos JSONB DEFAULT '[]',
  
  -- Host Response
  host_response TEXT,
  host_response_date TIMESTAMP WITH TIME ZONE,
  
  -- Verification
  is_verified BOOLEAN DEFAULT TRUE,
  is_helpful_count INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_pet_host_reviews_host_id FOREIGN KEY (host_id) REFERENCES pet_hosts(id) ON DELETE CASCADE,
  CONSTRAINT fk_pet_host_reviews_booking_id FOREIGN KEY (booking_id) REFERENCES pet_hosting_bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_pet_host_reviews_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_pet_host_reviews_pet_id FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- Create pet_host_photos table
CREATE TABLE pet_host_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL,
  
  photo_url TEXT NOT NULL,
  caption VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_pet_host_photos_host_id FOREIGN KEY (host_id) REFERENCES pet_hosts(id) ON DELETE CASCADE,
  CONSTRAINT chk_photo_category CHECK (category IN (
    'profile', 'facility', 'outdoor_space', 'indoor_space', 'amenities'
  ))
);

-- Create indexes for better performance
CREATE INDEX idx_pet_hosts_user_id ON pet_hosts(user_id);
CREATE INDEX idx_pet_hosts_city ON pet_hosts(city);
CREATE INDEX idx_pet_hosts_state ON pet_hosts(state);
CREATE INDEX idx_pet_hosts_is_active ON pet_hosts(is_active);
CREATE INDEX idx_pet_hosts_is_verified ON pet_hosts(is_verified);
CREATE INDEX idx_pet_hosts_is_super_host ON pet_hosts(is_super_host);
CREATE INDEX idx_pet_hosts_rating ON pet_hosts(rating);
CREATE INDEX idx_pet_hosts_location ON pet_hosts(latitude, longitude);

CREATE INDEX idx_pet_hosting_bookings_host_id ON pet_hosting_bookings(host_id);
CREATE INDEX idx_pet_hosting_bookings_pet_id ON pet_hosting_bookings(pet_id);
CREATE INDEX idx_pet_hosting_bookings_owner_id ON pet_hosting_bookings(owner_id);
CREATE INDEX idx_pet_hosting_bookings_status ON pet_hosting_bookings(status);
CREATE INDEX idx_pet_hosting_bookings_dates ON pet_hosting_bookings(check_in_date, check_out_date);
CREATE INDEX idx_pet_hosting_bookings_check_in ON pet_hosting_bookings(check_in_date);
CREATE INDEX idx_pet_hosting_bookings_check_out ON pet_hosting_bookings(check_out_date);

CREATE INDEX idx_pet_host_availability_host_id ON pet_host_availability(host_id);
CREATE INDEX idx_pet_host_availability_dates ON pet_host_availability(start_date, end_date);
CREATE INDEX idx_pet_host_availability_is_blocked ON pet_host_availability(is_blocked);

CREATE INDEX idx_pet_host_reviews_host_id ON pet_host_reviews(host_id);
CREATE INDEX idx_pet_host_reviews_booking_id ON pet_host_reviews(booking_id);
CREATE INDEX idx_pet_host_reviews_user_id ON pet_host_reviews(user_id);
CREATE INDEX idx_pet_host_reviews_is_verified ON pet_host_reviews(is_verified);

CREATE INDEX idx_pet_host_photos_host_id ON pet_host_photos(host_id);
CREATE INDEX idx_pet_host_photos_category ON pet_host_photos(category);
CREATE INDEX idx_pet_host_photos_is_primary ON pet_host_photos(is_primary);

-- Create composite indexes for common queries
CREATE INDEX idx_pet_hosts_active_verified ON pet_hosts(is_active, is_verified);
CREATE INDEX idx_bookings_host_status ON pet_hosting_bookings(host_id, status);
CREATE INDEX idx_bookings_owner_status ON pet_hosting_bookings(owner_id, status);
CREATE INDEX idx_availability_host_dates ON pet_host_availability(host_id, start_date, end_date);

-- Add comments for documentation
COMMENT ON TABLE pet_hosts IS 'Pet host profiles for boarding/hosting services';
COMMENT ON TABLE pet_hosting_bookings IS 'Pet hosting bookings with approval workflow';
COMMENT ON TABLE pet_host_availability IS 'Host availability calendar and capacity management';
COMMENT ON TABLE pet_host_reviews IS 'Reviews for pet hosts from completed bookings';
COMMENT ON TABLE pet_host_photos IS 'Photos for pet host profiles';

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pet_hosts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pet_hosts_updated_at
  BEFORE UPDATE ON pet_hosts
  FOR EACH ROW
  EXECUTE FUNCTION update_pet_hosts_updated_at();

CREATE TRIGGER trigger_update_pet_hosting_bookings_updated_at
  BEFORE UPDATE ON pet_hosting_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_pet_hosts_updated_at();

CREATE TRIGGER trigger_update_pet_host_availability_updated_at
  BEFORE UPDATE ON pet_host_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_pet_hosts_updated_at();

CREATE TRIGGER trigger_update_pet_host_reviews_updated_at
  BEFORE UPDATE ON pet_host_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_pet_hosts_updated_at();

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON TABLE pet_hosts TO postgres;
GRANT ALL PRIVILEGES ON TABLE pet_hosting_bookings TO postgres;
GRANT ALL PRIVILEGES ON TABLE pet_host_availability TO postgres;
GRANT ALL PRIVILEGES ON TABLE pet_host_reviews TO postgres;
GRANT ALL PRIVILEGES ON TABLE pet_host_photos TO postgres;

