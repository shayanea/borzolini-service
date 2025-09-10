-- Add social media URL columns to clinics table
ALTER TABLE clinics 
ADD COLUMN instagram_url VARCHAR(255),
ADD COLUMN tiktok_url VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN clinics.instagram_url IS 'Instagram profile URL for content scraping';
COMMENT ON COLUMN clinics.tiktok_url IS 'TikTok profile URL for content scraping';

-- Create indexes for better performance on social media URL lookups
CREATE INDEX IF NOT EXISTS idx_clinics_instagram_url ON clinics(instagram_url) WHERE instagram_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clinics_tiktok_url ON clinics(tiktok_url) WHERE tiktok_url IS NOT NULL;
