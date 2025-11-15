-- Structured Training Programs and Steps

-- Reuse existing enums (activity_difficulty, species) if present

CREATE TABLE IF NOT EXISTS training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  description_markdown TEXT NOT NULL,
  difficulty activity_difficulty NOT NULL DEFAULT 'easy',
  tags TEXT[] NOT NULL DEFAULT '{}',
  species species[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_program_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES training_activities(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  notes TEXT,
  CONSTRAINT unique_program_step UNIQUE (program_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_training_program_steps_program ON training_program_steps(program_id, step_order);
