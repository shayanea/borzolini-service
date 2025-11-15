-- Add toxic_compounds to parent tables
ALTER TABLE "pet_food_items" ADD COLUMN "toxic_compounds" jsonb;
ALTER TABLE "household_plants" ADD COLUMN "toxic_compounds" jsonb;
ALTER TABLE "household_items" ADD COLUMN "toxic_compounds" jsonb;

-- Add treatment_info to species-specific tables
ALTER TABLE "pet_food_safety_by_species" ADD COLUMN "treatment_info" text;
ALTER TABLE "household_plant_toxicity_by_species" ADD COLUMN "treatment_info" text;
ALTER TABLE "household_item_hazards_by_species" ADD COLUMN "treatment_info" text;
