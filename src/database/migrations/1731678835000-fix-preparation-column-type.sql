ALTER TABLE "pet_food_safety_by_species" DROP COLUMN IF EXISTS "preparation";
ALTER TABLE "pet_food_safety_by_species" ADD COLUMN "preparation" text;
