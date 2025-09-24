-- Fixed Tradagora Schema for Supabase
-- This version fixes the conversation_id error

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS listing_images CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    want_item VARCHAR(255) NOT NULL,
    want_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing images table
CREATE TABLE listing_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    offer_item VARCHAR(255) NOT NULL,
    offer_description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE
);

-- Conversations table
CREATE TABLE conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    participant1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    participant2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites table
CREATE TABLE user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Create indexes for better performance
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_listings_is_active ON listings(is_active);
CREATE INDEX idx_offers_listing_id ON offers(listing_id);
CREATE INDEX idx_offers_from_user_id ON offers(from_user_id);
CREATE INDEX idx_offers_to_user_id ON offers(to_user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_from_user_id ON messages(from_user_id);
CREATE INDEX idx_messages_to_user_id ON messages(to_user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (without complex joins)
CREATE POLICY "Users can view their own data" ON users
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can view active listings" ON listings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own listings" ON listings
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can view listing images" ON listing_images
    FOR SELECT USING (true);

CREATE POLICY "Users can manage images for their listings" ON listing_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = listing_images.listing_id 
            AND listings.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can view offers for their listings" ON offers
    FOR SELECT USING (
        auth.uid()::text = to_user_id::text OR 
        auth.uid()::text = from_user_id::text
    );

CREATE POLICY "Users can create offers" ON offers
    FOR INSERT WITH CHECK (auth.uid()::text = from_user_id::text);

CREATE POLICY "Users can update offers for their listings" ON offers
    FOR UPDATE USING (auth.uid()::text = to_user_id::text);

CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        auth.uid()::text = participant1_id::text OR 
        auth.uid()::text = participant2_id::text
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid()::text = participant1_id::text OR 
        auth.uid()::text = participant2_id::text
    );

CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        auth.uid()::text = from_user_id::text OR 
        auth.uid()::text = to_user_id::text
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid()::text = from_user_id::text);

CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid()::text = user_id::text);
