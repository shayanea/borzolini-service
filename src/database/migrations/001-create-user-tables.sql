-- Migration: Create User Tables
-- Description: Creates comprehensive user management tables with preferences and activity tracking
-- Date: 2024-01-01

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(100),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'patient',
  avatar VARCHAR(255),
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  preferred_language VARCHAR(100) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  gender VARCHAR(20),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(100),
  emergency_contact_relationship VARCHAR(100),
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  insurance_provider VARCHAR(100),
  insurance_policy_number VARCHAR(100),
  insurance_group_number VARCHAR(100),
  insurance_expiry_date DATE,
  notes TEXT,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  refresh_token VARCHAR(255),
  refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
  email_verification_token VARCHAR(255),
  email_verification_expires_at TIMESTAMP WITH TIME ZONE,
  phone_verification_otp VARCHAR(10),
  phone_verification_expires_at TIMESTAMP WITH TIME ZONE,
  password_reset_token VARCHAR(255),
  password_reset_expires_at TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  profile_completion_percentage INTEGER DEFAULT 0,
  account_status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  notification_settings JSONB NOT NULL DEFAULT '{
    "email": {
      "appointments": true,
      "reminders": true,
      "healthAlerts": true,
      "marketing": false,
      "newsletter": true
    },
    "sms": {
      "appointments": true,
      "reminders": true,
      "healthAlerts": true
    },
    "push": {
      "appointments": true,
      "reminders": true,
      "healthAlerts": true
    }
  }',
  privacy_settings JSONB NOT NULL DEFAULT '{
    "profileVisibility": "public",
    "showPhone": true,
    "showAddress": false,
    "showEmail": false,
    "allowContact": true
  }',
  communication_preferences JSONB NOT NULL DEFAULT '{
    "preferredLanguage": "en",
    "preferredContactMethod": "email",
    "timezone": "UTC",
    "quietHours": {
      "enabled": false,
      "startTime": "22:00",
      "endTime": "08:00"
    }
  }',
  theme VARCHAR(100) DEFAULT 'auto',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_preferences_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_activities table
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'success',
  description VARCHAR(255),
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_activities_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_email_verified ON users(is_email_verified);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_is_active ON user_preferences(is_active);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(type);
CREATE INDEX idx_user_activities_status ON user_activities(status);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- Create unique constraints
CREATE UNIQUE INDEX idx_user_preferences_user_id_unique ON user_preferences(user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: Password123!)
INSERT INTO users (
  email, 
  first_name, 
  last_name, 
  password_hash, 
  role, 
  is_email_verified, 
  is_phone_verified, 
  is_active,
  phone,
  address,
  city,
  postal_code,
  country,
  preferred_language,
  timezone
) VALUES (
  'admin@borzolini.com',
  'Admin',
  'User',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8mG', -- Password123!
  'admin',
  true,
  true,
  true,
  '+1234567890',
  '123 Admin Street',
  'Admin City',
  '12345',
  'USA',
  'en',
  'America/New_York'
);

-- Create default preferences for admin user
INSERT INTO user_preferences (user_id) 
SELECT id FROM users WHERE email = 'admin@borzolini.com';

-- Create sample activity for admin user
INSERT INTO user_activities (user_id, type, status, description, metadata, ip_address, user_agent, location)
SELECT 
  id,
  'register',
  'success',
  'User registered successfully',
  '{"email": "admin@borzolini.com", "role": "admin"}',
  '192.168.1.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'New York, USA'
FROM users WHERE email = 'admin@borzolini.com';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON TABLE users TO postgres;
GRANT ALL PRIVILEGES ON TABLE user_preferences TO postgres;
GRANT ALL PRIVILEGES ON TABLE user_activities TO postgres;

-- Create sequence for auto-incrementing IDs (if needed)
-- CREATE SEQUENCE IF NOT EXISTS users_id_seq;
-- ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
