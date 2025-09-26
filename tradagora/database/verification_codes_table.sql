-- Verification codes table
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- RLS policies
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own verification codes
CREATE POLICY "Users can read their own verification codes" ON verification_codes
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own verification codes
CREATE POLICY "Users can insert their own verification codes" ON verification_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own verification codes
CREATE POLICY "Users can update their own verification codes" ON verification_codes
    FOR UPDATE USING (auth.uid() = user_id);
