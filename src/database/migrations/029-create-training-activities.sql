-- Training & Play Activities (rich content) for cats and dogs
-- Reuses existing species enum if present

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'species') THEN
    CREATE TYPE species AS ENUM ('dog','cat','bird','rabbit','hamster','fish','reptile','horse','other');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_difficulty') THEN
    CREATE TYPE activity_difficulty AS ENUM ('easy','moderate','advanced');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS training_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content_markdown TEXT NOT NULL,
  difficulty activity_difficulty NOT NULL DEFAULT 'easy',
  avg_duration_minutes INT,
  indoor BOOLEAN,
  equipment TEXT[],
  tags TEXT[] NOT NULL DEFAULT '{}',
  risks TEXT[] DEFAULT '{}',
  enrichment TEXT[] DEFAULT '{}', -- e.g., 'nose_work','chase','puzzle'
  video_url TEXT,
  source_primary TEXT,
  source_name TEXT,
  license TEXT,
  terms_snapshot JSONB,
  hash BYTEA NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_activity_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES training_activities(id) ON DELETE CASCADE,
  species species NOT NULL,
  suitability TEXT,             -- guidance like 'ideal for kittens', 'short sessions for seniors'
  prerequisites TEXT[],         -- e.g., ['sit','stay']
  cautions TEXT[],              -- species-specific cautions
  citations JSONB DEFAULT '[]'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_training_activity_species ON training_activity_species(activity_id, species);

CREATE INDEX IF NOT EXISTS idx_training_activities_search ON training_activities USING GIN (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,'')));

