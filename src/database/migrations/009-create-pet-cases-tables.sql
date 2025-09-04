-- Migration: 009 - Create Pet Cases Tables
-- Description: Create tables for clinic-integrated pet case management system
-- Created: 2024-09-04

-- ================================================
-- PET CASES TABLES
-- ================================================

-- Create clinic_pet_cases table
CREATE TABLE IF NOT EXISTS clinic_pet_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(20) NOT NULL UNIQUE,
    clinic_id UUID NOT NULL,
    pet_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    vet_id UUID,
    case_type VARCHAR(50) NOT NULL DEFAULT 'consultation',
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50) NOT NULL DEFAULT 'normal',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    initial_symptoms JSONB DEFAULT '[]'::jsonb,
    current_symptoms JSONB DEFAULT '[]'::jsonb,
    vital_signs JSONB,
    diagnosis TEXT,
    treatment_plan JSONB,
    ai_insights JSONB,
    timeline JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_clinic_pet_cases_clinic
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    CONSTRAINT fk_clinic_pet_cases_pet
        FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    CONSTRAINT fk_clinic_pet_cases_owner
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_clinic_pet_cases_vet
        FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE SET NULL,

    -- Check constraints
    CONSTRAINT chk_case_type CHECK (case_type IN (
        'consultation', 'follow_up', 'emergency', 'preventive',
        'chronic_condition', 'post_surgery', 'behavioral', 'nutritional'
    )),
    CONSTRAINT chk_case_status CHECK (status IN (
        'open', 'in_progress', 'pending_consultation', 'pending_visit',
        'under_observation', 'resolved', 'closed', 'escalated'
    )),
    CONSTRAINT chk_case_priority CHECK (priority IN (
        'low', 'normal', 'high', 'urgent', 'emergency'
    ))
);

-- Create clinic_case_timeline table
CREATE TABLE IF NOT EXISTS clinic_case_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_by UUID,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_case_timeline_case
        FOREIGN KEY (case_id) REFERENCES clinic_pet_cases(id) ON DELETE CASCADE,
    CONSTRAINT fk_case_timeline_creator
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

    -- Check constraints
    CONSTRAINT chk_timeline_event_type CHECK (event_type IN (
        'case_created', 'symptoms_updated', 'vital_signs_recorded',
        'consultation_scheduled', 'consultation_completed', 'visit_scheduled',
        'visit_completed', 'diagnosis_made', 'treatment_prescribed',
        'medication_administered', 'follow_up_scheduled', 'ai_insight_generated',
        'case_escalated', 'case_resolved', 'case_closed', 'note_added',
        'file_attached', 'status_changed', 'priority_changed'
    ))
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Indexes for clinic_pet_cases
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_clinic_id ON clinic_pet_cases(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_pet_id ON clinic_pet_cases(pet_id);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_owner_id ON clinic_pet_cases(owner_id);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_vet_id ON clinic_pet_cases(vet_id);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_status ON clinic_pet_cases(status);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_priority ON clinic_pet_cases(priority);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_case_type ON clinic_pet_cases(case_type);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_is_active ON clinic_pet_cases(is_active);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_created_at ON clinic_pet_cases(created_at);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_updated_at ON clinic_pet_cases(updated_at);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_cases_case_number ON clinic_pet_cases(case_number);

-- Indexes for clinic_case_timeline
CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id ON clinic_case_timeline(case_id);
CREATE INDEX IF NOT EXISTS idx_case_timeline_event_type ON clinic_case_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_case_timeline_created_by ON clinic_case_timeline(created_by);
CREATE INDEX IF NOT EXISTS idx_case_timeline_occurred_at ON clinic_case_timeline(occurred_at);

-- ================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for clinic_pet_cases
DROP TRIGGER IF EXISTS update_clinic_pet_cases_updated_at ON clinic_pet_cases;
CREATE TRIGGER update_clinic_pet_cases_updated_at
    BEFORE UPDATE ON clinic_pet_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- INITIAL DATA SEEDING (Optional)
-- ================================================

-- You can add initial seed data here if needed
-- Example:
-- INSERT INTO clinic_pet_cases (id, case_number, clinic_id, pet_id, owner_id, title, description)
-- VALUES (gen_random_uuid(), 'CASE-2024-0001', 'clinic-uuid-here', 'pet-uuid-here', 'owner-uuid-here', 'Initial Case', 'Description here');

-- ================================================
-- MIGRATION COMPLETED
-- ================================================

-- Migration completed successfully!
