-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'default',
    description TEXT,
    general_settings JSONB NOT NULL DEFAULT '{
        "clinicName": "Borzolini Veterinary Clinic",
        "currency": "USD",
        "timezone": "America/New_York",
        "businessHours": "8:00 AM - 6:00 PM"
    }',
    notification_settings JSONB NOT NULL DEFAULT '{
        "enableNotifications": true,
        "emailNotifications": true,
        "smsNotifications": false,
        "notificationEmail": "admin@clinic.com"
    }',
    appointment_settings JSONB NOT NULL DEFAULT '{
        "defaultAppointmentDuration": 30,
        "bookingLeadTime": 24,
        "cancellationPolicy": 24,
        "maxAppointmentsPerDay": 50
    }',
    security_settings JSONB NOT NULL DEFAULT '{
        "sessionTimeout": 30,
        "passwordExpiry": 90,
        "twoFactorAuthentication": false
    }',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_settings_name ON settings(name);
CREATE INDEX IF NOT EXISTS idx_settings_is_active ON settings(is_active);
CREATE INDEX IF NOT EXISTS idx_settings_is_default ON settings(is_default);
CREATE INDEX IF NOT EXISTS idx_settings_created_at ON settings(created_at);

-- Create unique constraint for default settings
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_unique_default ON settings(is_default) WHERE is_default = true;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings if none exist
INSERT INTO settings (name, description, is_default, is_active)
VALUES (
    'default',
    'Default system settings',
    true,
    true
) ON CONFLICT (is_default) WHERE is_default = true DO NOTHING;
