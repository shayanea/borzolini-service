-- Daily Training Assignments for automated pet training programs
-- Enables users to receive personalized daily training activities for their pets

CREATE TABLE IF NOT EXISTS daily_training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES training_activities(id) ON DELETE CASCADE,
  assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  feedback TEXT,
  difficulty_progression JSONB DEFAULT '{}'::jsonb, -- Track difficulty changes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_daily_assignment UNIQUE (user_id, pet_id, activity_id, assignment_date)
);

-- Performance indexes for daily assignment queries
CREATE INDEX IF NOT EXISTS idx_daily_training_user_date ON daily_training_assignments(user_id, assignment_date);
CREATE INDEX IF NOT EXISTS idx_daily_training_pet_date ON daily_training_assignments(pet_id, assignment_date) WHERE pet_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_training_completed ON daily_training_assignments(user_id, is_completed, assignment_date);
CREATE INDEX IF NOT EXISTS idx_daily_training_activity ON daily_training_assignments(activity_id);

-- Comments for documentation
COMMENT ON TABLE daily_training_assignments IS 'Stores daily training assignments for users and their pets, enabling automated personalized training programs';
COMMENT ON COLUMN daily_training_assignments.difficulty_progression IS 'JSON object tracking difficulty level changes and progression over time';
