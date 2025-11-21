# Supabase Setup Guide for Borzolini Service
This guide will help you set up Supabase for your clinic platform backend.
## Prerequisites
- Supabase account (free tier available)
- Node.js 18+ and pnpm installed
- Basic knowledge of PostgreSQL
## Step 1: Create Supabase Project
1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with your account
3. **Create New Project**
 - Choose your organization
 - Enter project name: `borzolini-clinic`
 - Enter database password (save this!)
 - Choose region closest to your users
 - Click "Create new project"
## Step 2: Get Project Credentials
1. **Go to Project Settings > API**
2. **Copy these values:**
 - Project URL
 - Anon (public) key
 - Service Role (secret) key
3. **Go to Project Settings > Database**
4. **Copy these values:**
 - Host
 - Database name (usually `postgres`)
 - Port (usually `5432`)
 - User (usually `postgres`)
 - Password (the one you set during creation)
## Step 3: Database Schema Setup
### Create Tables
Run these SQL commands in your Supabase SQL Editor:
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Users table
CREATE TABLE users (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 email VARCHAR(255) UNIQUE NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 first_name VARCHAR(100) NOT NULL,
 last_name VARCHAR(100) NOT NULL,
 role VARCHAR(50) NOT NULL DEFAULT 'pet_owner',
 phone VARCHAR(20),
 address TEXT,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Clinics table
CREATE TABLE clinics (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 name VARCHAR(255) NOT NULL,
 description TEXT,
 address TEXT NOT NULL,
 phone VARCHAR(20),
 email VARCHAR(255),
 website VARCHAR(255),
 logo_url VARCHAR(500),
 rating DECIMAL(3,2) DEFAULT 0,
 total_reviews INTEGER DEFAULT 0,
 is_verified BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Clinic staff table
CREATE TABLE clinic_staff (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
 user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 role VARCHAR(50) NOT NULL, -- 'admin', 'doctor', 'assistant'
 specialization VARCHAR(100),
 license_number VARCHAR(100),
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Pets table
CREATE TABLE pets (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
 name VARCHAR(100) NOT NULL,
 species VARCHAR(50) NOT NULL,
 breed VARCHAR(100),
 birth_date DATE,
 weight DECIMAL(5,2),
 color VARCHAR(100),
 microchip_id VARCHAR(100),
 photo_url VARCHAR(500),
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Pet health records table
CREATE TABLE pet_health_records (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
 record_date DATE NOT NULL,
 weight DECIMAL(5,2),
 temperature DECIMAL(4,1),
 heart_rate INTEGER,
 symptoms TEXT[],
 diagnosis TEXT,
 treatment TEXT,
 medications TEXT[],
 vet_notes TEXT,
 created_by UUID REFERENCES users(id),
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Appointments table
CREATE TABLE appointments (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
 clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
 vet_id UUID REFERENCES users(id),
 appointment_type VARCHAR(50) NOT NULL, -- 'consultation', 'home_visit', 'follow_up'
 status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
 scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
 duration_minutes INTEGER DEFAULT 30,
 notes TEXT,
 consultation_link VARCHAR(500),
 address TEXT,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- AI health insights table
CREATE TABLE ai_health_insights (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
 insight_type VARCHAR(50) NOT NULL, -- 'recommendation', 'alert', 'prediction'
 title VARCHAR(255) NOT NULL,
 description TEXT NOT NULL,
 confidence_score DECIMAL(3,2),
 urgency_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'urgent'
 suggested_action VARCHAR(255),
 dismissed BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Social media URLs are now stored directly in the clinics table
-- instagram_url and tiktok_url columns added to clinics table
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_scheduled_date ON appointments(scheduled_date);
CREATE INDEX idx_health_records_pet_id ON pet_health_records(pet_id);
CREATE INDEX idx_ai_insights_pet_id ON ai_health_insights(pet_id);
```
## Step 4: Storage Bucket Setup
1. **Go to Storage in your Supabase dashboard**
2. **Create new bucket:**
 - Name: `clinic-files`
 - Public bucket: `Yes` (for public access to clinic logos, pet photos)
 - File size limit: `50MB`
 - Allowed MIME types: `image/*, application/pdf`
3. **Set up bucket policies:**
```sql
-- Allow public read access to clinic-files bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'clinic-files');
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'clinic-files' AND auth.role() = 'authenticated');
-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (bucket_id = 'clinic-files' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'clinic-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```
## Step 5: Row Level Security (RLS)
Enable RLS on sensitive tables:
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_health_insights ENABLE ROW LEVEL SECURITY;
-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
-- Create policies for pets table
CREATE POLICY "Users can view own pets" ON pets FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = owner_id);
-- Create policies for health records
CREATE POLICY "Users can view own pet health records" ON pet_health_records FOR SELECT USING (
 EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_health_records.pet_id AND pets.owner_id = auth.uid())
);
-- Create policies for appointments
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (
 EXISTS (SELECT 1 FROM pets WHERE pets.id = appointments.pet_id AND pets.owner_id = auth.uid())
);
-- Create policies for AI insights
CREATE POLICY "Users can view own pet AI insights" ON ai_health_insights FOR SELECT USING (
 EXISTS (SELECT 1 FROM pets WHERE pets.id = ai_health_insights.pet_id AND pets.owner_id = auth.uid())
);
```
## Step 6: Environment Configuration
1. **Copy `config.env.example` to `.env`**
2. **Fill in your Supabase credentials:**
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_HOST=db.your-project-id.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=your-db-password-here
# File Storage
SUPABASE_STORAGE_BUCKET=clinic-files
SUPABASE_STORAGE_URL=https://your-project-id.supabase.co/storage/v1
```
## Step 7: Test Connection
1. **Install dependencies:**
 ```bash
 pnpm install
 ```
2. **Start the application:**
 ```bash
 pnpm run start:dev
 ```
3. **Check console for:**
 - Supabase client initialized successfully
 - Database connection established
## Step 8: Verify Setup
1. **Check API documentation:** `http://localhost:3001/api/docs`
2. **Test database connection** through the health check endpoint
3. **Verify storage bucket** is accessible
## Troubleshooting
### Common Issues:
1. **Connection refused:**
 - Check if your IP is whitelisted in Supabase
 - Go to Project Settings > Database > Connection pooling
2. **Authentication failed:**
 - Verify your database password
 - Check if you're using the correct connection string
3. **Storage access denied:**
 - Verify bucket policies are set correctly
 - Check if RLS is properly configured
4. **SSL connection issues:**
 - Ensure SSL is enabled in your connection
 - Check if your database URL includes SSL parameters
## Next Steps
1. **Create your first user** through the API
2. **Set up a clinic profile**
3. **Add a pet and health records**
4. **Test AI health monitoring features**
## Need Help?
- **Supabase Documentation:** [docs.supabase.com](https://docs.supabase.com)
- **Discord Community:** [discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues:** [github.com/supabase/supabase](https://github.com/supabase/supabase)
---
**Your Supabase-powered clinic platform is ready! **
