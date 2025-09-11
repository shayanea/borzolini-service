-- Migration: Add breed_id to animal_faqs
-- Date: 2025-09-11

ALTER TABLE animal_faqs
ADD COLUMN IF NOT EXISTS breed_id UUID NULL;

-- Optional: FK to breeds(id) without cascade (soft association)
ALTER TABLE animal_faqs
  ADD CONSTRAINT IF NOT EXISTS fk_animal_faqs_breed_id
  FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_animal_faqs_breed_id ON animal_faqs(breed_id);

