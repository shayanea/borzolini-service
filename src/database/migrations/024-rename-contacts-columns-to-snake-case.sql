-- Migration: Rename contacts columns to snake_case (handles unquoted lowercase columns)

DO $$
DECLARE
  col_exists boolean;
BEGIN
  -- adminNotes -> admin_notes (handle adminNotes or adminnotes)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name IN ('adminNotes', 'adminnotes')
  ) INTO col_exists;
  IF col_exists THEN
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'adminNotes'
      ) THEN
        EXECUTE 'ALTER TABLE contacts RENAME COLUMN "adminNotes" TO admin_notes';
      ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'adminnotes'
      ) THEN
        EXECUTE 'ALTER TABLE contacts RENAME COLUMN adminnotes TO admin_notes';
      END IF;
    EXCEPTION WHEN undefined_column THEN
      -- ignore
    END;
  END IF;

  -- ipAddress -> ip_address
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name IN ('ipAddress', 'ipaddress')
  ) INTO col_exists;
  IF col_exists THEN
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'ipAddress'
      ) THEN
        EXECUTE 'ALTER TABLE contacts RENAME COLUMN "ipAddress" TO ip_address';
      ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'ipaddress'
      ) THEN
        EXECUTE 'ALTER TABLE contacts RENAME COLUMN ipaddress TO ip_address';
      END IF;
    EXCEPTION WHEN undefined_column THEN
    END;
  END IF;

  -- userAgent -> user_agent
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name IN ('userAgent', 'useragent')
  ) INTO col_exists;
  IF col_exists THEN
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'userAgent'
      ) THEN
        EXECUTE 'ALTER TABLE contacts RENAME COLUMN "userAgent" TO user_agent';
      ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'useragent'
      ) THEN
        EXECUTE 'ALTER TABLE contacts RENAME COLUMN useragent TO user_agent';
      END IF;
    EXCEPTION WHEN undefined_column THEN
    END;
  END IF;

  -- createdAt -> created_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name IN ('createdAt', 'createdat')
  ) INTO col_exists;
  IF col_exists THEN
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'createdAt'
      ) THEN
        EXECUTE 'ALTER TABLE contacts RENAME COLUMN "createdAt" TO created_at';
      ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'createdat'
      ) THEN
        EXECUTE 'ALTER TABLE contacts RENAME COLUMN createdat TO created_at';
      END IF;
    EXCEPTION WHEN undefined_column THEN
    END;
  END IF;

  -- updatedAt -> updated_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name IN ('updatedAt', 'updatedat')
  ) INTO col_exists;
  IF col_exists THEN
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'updatedAt'
      ) THEN
        EXECUTE 'ALTER TABLE contacts RENAME COLUMN "updatedAt" TO updated_at';
      ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'updatedat'
      ) THEN
        EXECUTE 'ALTER TABLE contacts RENAME COLUMN updatedat TO updated_at';
      END IF;
    EXCEPTION WHEN undefined_column THEN
    END;
  END IF;
END $$;

-- Drop old index if present and create new index on created_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_contacts_createdAt') THEN
    EXECUTE 'DROP INDEX idx_contacts_createdAt';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

