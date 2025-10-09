-- Create user_consents table for tracking all consent types
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Consent type and version
  consent_type VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL,
  
  -- Timestamps
  accepted_at TIMESTAMP NOT NULL,
  withdrawn_at TIMESTAMP,
  
  -- Audit trail
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);
CREATE INDEX idx_user_consents_user_type ON user_consents(user_id, consent_type);

-- Comments
COMMENT ON TABLE user_consents IS 'Tracks user consent for various purposes (GDPR/CCPA compliance)';
COMMENT ON COLUMN user_consents.consent_type IS 'Type of consent: medical_disclaimer, privacy_policy, terms_of_service, marketing, ai_monitoring, video_recording';
COMMENT ON COLUMN user_consents.version IS 'Version of the policy/disclaimer being accepted (e.g., v1.0)';
COMMENT ON COLUMN user_consents.withdrawn_at IS 'When user withdrew consent (NULL if still active)';

