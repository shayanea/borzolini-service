-- Create appointment_reviews table
CREATE TABLE IF NOT EXISTS appointment_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    pet_id UUID NOT NULL,
    clinic_id UUID NOT NULL,
    overall_rating INTEGER NOT NULL DEFAULT 5 CHECK (overall_rating >= 1 AND overall_rating <= 5),
    vet_expertise_rating INTEGER NOT NULL DEFAULT 5 CHECK (vet_expertise_rating >= 1 AND vet_expertise_rating <= 5),
    communication_rating INTEGER NOT NULL DEFAULT 5 CHECK (communication_rating >= 1 AND communication_rating <= 5),
    punctuality_rating INTEGER NOT NULL DEFAULT 5 CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    home_visit_rating INTEGER NOT NULL DEFAULT 5 CHECK (home_visit_rating >= 1 AND home_visit_rating <= 5),
    follow_up_rating INTEGER NOT NULL DEFAULT 5 CHECK (follow_up_rating >= 1 AND follow_up_rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    positive_aspects TEXT,
    improvement_areas TEXT,
    would_recommend BOOLEAN NOT NULL DEFAULT true,
    review_type VARCHAR(50) NOT NULL CHECK (review_type IN ('home_visit', 'consultation', 'emergency', 'follow_up')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    is_reported BOOLEAN NOT NULL DEFAULT false,
    report_reason VARCHAR(500),
    pet_photos JSONB NOT NULL DEFAULT '[]',
    visit_photos JSONB NOT NULL DEFAULT '[]',
    clinic_response TEXT,
    clinic_response_date TIMESTAMP WITH TIME ZONE,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointment_reviews_appointment_id ON appointment_reviews(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reviews_user_id ON appointment_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reviews_pet_id ON appointment_reviews(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reviews_clinic_id ON appointment_reviews(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reviews_status ON appointment_reviews(status);
CREATE INDEX IF NOT EXISTS idx_appointment_reviews_review_type ON appointment_reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_appointment_reviews_created_at ON appointment_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_appointment_reviews_overall_rating ON appointment_reviews(overall_rating);

-- Add foreign key constraints
ALTER TABLE appointment_reviews 
ADD CONSTRAINT fk_appointment_reviews_appointment_id 
FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;

ALTER TABLE appointment_reviews 
ADD CONSTRAINT fk_appointment_reviews_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE appointment_reviews 
ADD CONSTRAINT fk_appointment_reviews_pet_id 
FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE;

ALTER TABLE appointment_reviews 
ADD CONSTRAINT fk_appointment_reviews_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate reviews for the same appointment
ALTER TABLE appointment_reviews 
ADD CONSTRAINT unique_appointment_review 
UNIQUE (appointment_id, user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointment_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_appointment_reviews_updated_at
    BEFORE UPDATE ON appointment_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_reviews_updated_at();

-- Add comments for documentation
COMMENT ON TABLE appointment_reviews IS 'Stores detailed reviews for completed appointments, including home visits';
COMMENT ON COLUMN appointment_reviews.overall_rating IS 'Overall experience rating (1-5 stars)';
COMMENT ON COLUMN appointment_reviews.vet_expertise_rating IS 'Rating for veterinarian expertise (1-5 stars)';
COMMENT ON COLUMN appointment_reviews.communication_rating IS 'Rating for communication quality (1-5 stars)';
COMMENT ON COLUMN appointment_reviews.punctuality_rating IS 'Rating for punctuality (1-5 stars)';
COMMENT ON COLUMN appointment_reviews.home_visit_rating IS 'Rating for home visit experience (1-5 stars)';
COMMENT ON COLUMN appointment_reviews.follow_up_rating IS 'Rating for follow-up care (1-5 stars)';
COMMENT ON COLUMN appointment_reviews.positive_aspects IS 'What went well during the visit';
COMMENT ON COLUMN appointment_reviews.improvement_areas IS 'Areas for improvement';
COMMENT ON COLUMN appointment_reviews.pet_photos IS 'JSON array of pet photos from the visit';
COMMENT ON COLUMN appointment_reviews.visit_photos IS 'JSON array of visit photos (with permission)';
COMMENT ON COLUMN appointment_reviews.review_type IS 'Type of appointment being reviewed';
COMMENT ON COLUMN appointment_reviews.status IS 'Review moderation status';
