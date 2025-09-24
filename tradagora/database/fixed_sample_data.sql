-- Fixed sample data for Tradagora
-- Run this after creating the fixed schema

-- Insert sample users
INSERT INTO users (id, email, password, full_name, phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'demo@tradagora.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', '+90 533 987 65 43'),
('550e8400-e29b-41d4-a716-446655440002', 'ahmet@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ahmet Yılmaz', '+90 532 123 45 67'),
('550e8400-e29b-41d4-a716-446655440003', 'elif@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Elif Demir', '+90 533 987 65 43');

-- Insert sample listings
INSERT INTO listings (id, user_id, title, description, category, condition, location, want_item, want_description, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'iPhone 13 Pro veririm', 'Mükemmel durumda iPhone 13 Pro, 256GB, Space Gray. Kutusu ve aksesuarları ile birlikte.', 'Elektronik', 'excellent', 'İstanbul', 'MacBook Air M2', 'MacBook Air M2 13 inch, 8GB RAM, 256GB SSD', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Nike Air Max 270 veririm', 'Spor ayakkabı, 42 numara, çok az kullanılmış. Orijinal kutusu ile.', 'Giyim', 'good', 'Ankara', 'Adidas Ultraboost', 'Adidas Ultraboost 22, 42 numara', true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Guitar dersi veririm', 'Profesyonel gitarist olarak 5 yıllık deneyimim var. Başlangıç ve orta seviye dersler.', 'Hizmet', 'excellent', 'İzmir', 'Piyano dersi', 'Klasik piyano dersi almak istiyorum', true);

-- Insert sample listing images
INSERT INTO listing_images (listing_id, url, alt_text) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop', 'iPhone 13 Pro'),
('660e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', 'Nike Air Max 270'),
('660e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop', 'Guitar lesson');

-- Insert sample offers
INSERT INTO offers (listing_id, from_user_id, to_user_id, offer_item, offer_description, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Samsung Galaxy S21', 'Sıfır ayarında, kutulu Samsung Galaxy S21.', 'pending'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Puma RS-X', 'Az kullanılmış Puma RS-X, 42 numara.', 'accepted');

-- Insert sample conversations
INSERT INTO conversations (id, listing_id, participant1_id, participant2_id, last_message, last_message_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Merhaba, iPhone 13 Pro ilanınızla ilgileniyorum.', NOW());

-- Insert sample messages
INSERT INTO messages (conversation_id, from_user_id, to_user_id, message, read) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Merhaba, iPhone 13 Pro ilanınızla ilgileniyorum. Samsung Galaxy S21 teklifim var.', false),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Merhaba, teklifiniz için teşekkürler. Detayları konuşabiliriz.', true);
