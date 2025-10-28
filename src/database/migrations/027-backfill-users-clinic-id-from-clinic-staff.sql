-- Backfill users.clinic_id based on clinic_staff membership
-- Idempotent: only updates when users.clinic_id is NULL or differs

UPDATE users u
SET clinic_id = cs.clinic_id
FROM clinic_staff cs
WHERE u.id = cs.user_id
  AND (u.clinic_id IS NULL OR u.clinic_id IS DISTINCT FROM cs.clinic_id);

-- Optional: ensure clinic_admins also get clinic_id if they appear in clinic_staff
-- (already covered by the statement above)

