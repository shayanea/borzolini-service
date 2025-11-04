-- Household Safety Knowledge: foods, plants, and other household items
-- Supports 9 species via enum aligned with existing Breed.PetSpecies

-- Species enum (reuse existing if already present in DB); create if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'species') THEN
    CREATE TYPE species AS ENUM ('dog','cat','bird','rabbit','hamster','fish','reptile','horse','other');
  END IF;
END $$;

-- Safety level enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'food_safety_level') THEN
    CREATE TYPE food_safety_level AS ENUM ('safe','caution','avoid','toxic');
  END IF;
END $$;

-- Preparation enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prep') THEN
    CREATE TYPE prep AS ENUM ('raw','cooked','plain','seasoned','unknown');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS pet_food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  scientific_name TEXT,
  category TEXT,
  safety_overall food_safety_level NOT NULL,
  notes_markdown TEXT NOT NULL,
  last_reviewed_at TIMESTAMPTZ,
  source_primary TEXT NOT NULL,
  source_name TEXT NOT NULL,
  license TEXT,
  terms_snapshot JSONB,
  hash BYTEA NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pet_food_safety_by_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES pet_food_items(id) ON DELETE CASCADE,
  species species NOT NULL,
  safety food_safety_level NOT NULL,
  safe_amount TEXT,
  frequency TEXT,
  preparation prep DEFAULT 'unknown',
  risks TEXT[],
  emergency BOOLEAN DEFAULT FALSE,
  citations JSONB NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_food_species ON pet_food_safety_by_species(food_id, species);

CREATE TABLE IF NOT EXISTS pet_food_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES pet_food_items(id) ON DELETE CASCADE,
  alias TEXT NOT NULL UNIQUE
);

-- Plants
CREATE TYPE IF NOT EXISTS plant_toxicity_level AS ENUM ('non_toxic','minor','moderate','severe','fatal');

CREATE TABLE IF NOT EXISTS household_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  scientific_name TEXT,
  common_aliases TEXT[] DEFAULT '{}',
  toxicity_overall plant_toxicity_level NOT NULL,
  notes_markdown TEXT NOT NULL,
  last_reviewed_at TIMESTAMPTZ,
  source_primary TEXT NOT NULL,
  source_name TEXT NOT NULL,
  license TEXT,
  terms_snapshot JSONB,
  hash BYTEA NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS household_plant_toxicity_by_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES household_plants(id) ON DELETE CASCADE,
  species species NOT NULL,
  toxicity plant_toxicity_level NOT NULL,
  clinical_signs TEXT[],
  emergency BOOLEAN DEFAULT FALSE,
  citations JSONB NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_plant_species ON household_plant_toxicity_by_species(plant_id, species);

-- Other household items
CREATE TYPE IF NOT EXISTS hazard_severity AS ENUM ('info','caution','danger','emergency');

CREATE TABLE IF NOT EXISTS household_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  category TEXT,
  severity_overall hazard_severity NOT NULL,
  notes_markdown TEXT NOT NULL,
  last_reviewed_at TIMESTAMPTZ,
  source_primary TEXT NOT NULL,
  source_name TEXT NOT NULL,
  license TEXT,
  terms_snapshot JSONB,
  hash BYTEA NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS household_item_hazards_by_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES household_items(id) ON DELETE CASCADE,
  species species NOT NULL,
  severity hazard_severity NOT NULL,
  risks TEXT[],
  emergency BOOLEAN DEFAULT FALSE,
  citations JSONB NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_item_species ON household_item_hazards_by_species(item_id, species);

-- Basic text search support
CREATE INDEX IF NOT EXISTS idx_food_items_search ON pet_food_items USING GIN (to_tsvector('simple', canonical_name || ' ' || coalesce(scientific_name,'')));
CREATE INDEX IF NOT EXISTS idx_plants_search ON household_plants USING GIN (to_tsvector('simple', canonical_name || ' ' || coalesce(scientific_name,'')));
CREATE INDEX IF NOT EXISTS idx_items_search ON household_items USING GIN (to_tsvector('simple', canonical_name));

