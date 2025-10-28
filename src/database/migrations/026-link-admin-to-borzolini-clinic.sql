-- Link admin to Borzolini Pet Clinic
WITH target_clinic AS (
  SELECT id FROM clinics WHERE name = 'Borzolini Pet Clinic' LIMIT 1
),
target_user AS (
  SELECT id FROM users WHERE email = 'admin@borzolini.com' LIMIT 1
)
UPDATE users u
SET clinic_id = tc.id
FROM target_clinic tc, target_user tu
WHERE u.id = tu.id
  AND (u.clinic_id IS DISTINCT FROM tc.id);

-- Also ensure an entry exists in clinic_staff so permissions/features relying on staff mapping work
INSERT INTO clinic_staff (clinic_id, user_id, role, specialization, license_number, experience_years, education, bio, hire_date, is_active)
SELECT tc.id, tu.id, 'admin', 'Clinic Management', 'ADM-001', 5, ARRAY['Veterinary Business Administration','Healthcare Management'], 'Clinic administrator', '2023-01-01', true
FROM (SELECT id FROM clinics WHERE name = 'Borzolini Pet Clinic' LIMIT 1) tc,
     (SELECT id FROM users WHERE email = 'admin@borzolini.com' LIMIT 1) tu
WHERE NOT EXISTS (
  SELECT 1 FROM clinic_staff cs WHERE cs.clinic_id = tc.id AND cs.user_id = tu.id
);

