-- Add is_verified column to users table
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Update existing users to be verified (for testing)
UPDATE users SET is_verified = true WHERE email IS NOT NULL;

-- Add google_id column for Google OAuth
ALTER TABLE users ADD COLUMN google_id TEXT;

-- Create index for better performance
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_is_verified ON users(is_verified);
