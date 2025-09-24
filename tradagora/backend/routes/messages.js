const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock data for messages and conversations (for development)
const mockConversations = [];
const mockMessages = [];

// Mock listings (same as offers.js)
const mockListings = [
  {
    id: '1',
    title: 'iPhone 13 Pro veririm',
    description: 'Mükemmel durumda iPhone 13 Pro, 256GB, Space Gray. Kutusu ve aksesuarları ile birlikte.',
    category: 'Elektronik',
    condition: 'excellent',
    location: 'İstanbul',
    want_item: 'MacBook Air M2',
    want_description: 'MacBook Air M2 13 inch, 8GB RAM, 256GB SSD',
    is_active: true,
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    created_at: new Date().toISOString(),
    user: {
      full_name: 'Ahmet Yılmaz',
      phone: '+90 532 123 45 67'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
        alt_text: 'iPhone 13 Pro'
      }
    ]
  },
  {
    id: '2',
    title: 'Nike Air Max 270 veririm',
    description: 'Spor ayakkabı, 42 numara, çok az kullanılmış. Orijinal kutusu ile.',
    category: 'Giyim',
    condition: 'good',
    location: 'Ankara',
    want_item: 'Adidas Ultraboost',
    want_description: 'Adidas Ultraboost 22, 42 numara',
    is_active: true,
    user_id: '550e8400-e29b-41d4-a716-446655440002',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user: {
      full_name: 'Elif Demir',
      phone: '+90 533 987 65 43'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
        alt_text: 'Nike Air Max 270'
      }
    ]
  }
];

// Start a new conversation from a listing
router.post('/start-from-listing', authenticateToken, async (req, res) => {
  try {
    const { listingId, initialMessage } = req.body;
    const fromUserId = req.user.id;

    if (!listingId || !initialMessage) {
      return res.status(400).json({ error: 'Listing ID and initial message are required' });
    }

    const targetListing = mockListings.find(l => l.id === listingId);
    if (!targetListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const toUserId = targetListing.user_id;

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'Cannot start a conversation with yourself' });
    }

    // Check if a conversation already exists between these two users for this listing
    let conversation = mockConversations.find(
      (conv) =>
        (conv.participants.includes(fromUserId) &&
          conv.participants.includes(toUserId) &&
          conv.listingId === listingId)
    );

    if (!conversation) {
      conversation = {
        id: `conv_${fromUserId}_${toUserId}`, // Simple ID for mock
        listingId,
        participants: [fromUserId, toUserId],
        lastMessage: initialMessage,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0, // For the recipient
        participantsInfo: [
          { id: fromUserId, full_name: req.user.full_name },
          { id: toUserId, full_name: targetListing.user.full_name }
        ]
      };
      mockConversations.push(conversation);
    } else {
      conversation.lastMessage = initialMessage;
      conversation.lastMessageAt = new Date().toISOString();
      conversation.unreadCount++;
    }

    const newMessage = {
      id: Date.now().toString(),
      conversationId: conversation.id,
      fromUserId,
      toUserId,
      message: initialMessage,
      createdAt: new Date().toISOString(),
      read: false,
      fromUser: {
        full_name: req.user.full_name
      }
    };
    mockMessages.push(newMessage);

    res.status(201).json({ message: 'Conversation started successfully', conversation, newMessage });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Get all conversations for the current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userConversations = mockConversations.filter(conv => conv.participants.includes(userId));
    res.json({ conversations: userConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
router.get('/conversation/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = mockConversations.find(conv => conv.id === conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Unauthorized to view this conversation' });
    }

    const messages = mockMessages.filter(msg => msg.conversationId === conversationId);
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message in an existing conversation
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const fromUserId = req.user.id;

    if (!conversationId || !message) {
      return res.status(400).json({ error: 'Conversation ID and message are required' });
    }

    const conversation = mockConversations.find(conv => conv.id === conversationId);
    if (!conversation || !conversation.participants.includes(fromUserId)) {
      return res.status(403).json({ error: 'Unauthorized to send message in this conversation' });
    }

    const toUserId = conversation.participants.find(p => p !== fromUserId);

    const newMessage = {
      id: Date.now().toString(),
      conversationId,
      fromUserId,
      toUserId,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      fromUser: {
        full_name: req.user.full_name
      }
    };
    mockMessages.push(newMessage);

    // Update last message in conversation
    conversation.lastMessage = message;
    conversation.lastMessageAt = new Date().toISOString();
    conversation.unreadCount++; // Increment for the recipient

    res.status(201).json({ message: 'Message sent successfully', newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;