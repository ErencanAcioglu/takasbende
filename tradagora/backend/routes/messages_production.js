const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Start a new conversation from a listing
router.post('/start-from-listing', authenticateToken, async (req, res) => {
  try {
    const { listingId, initialMessage } = req.body;
    const fromUserId = req.user.id;

    if (!listingId || !initialMessage) {
      return res.status(400).json({ error: 'Listing ID and initial message are required' });
    }

    // Get listing details
    const { data: targetListing, error: listingError } = await supabase
      .from('listings')
      .select('id, user_id, title')
      .eq('id', listingId)
      .eq('is_active', true)
      .single();

    if (listingError || !targetListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const toUserId = targetListing.user_id;

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'Cannot start a conversation with yourself' });
    }

    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('user1_id', fromUserId)
      .eq('user2_id', toUserId)
      .single();

    let conversationId;
    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert([{
          listing_id: listingId,
          user1_id: fromUserId,
          user2_id: toUserId,
          last_message: initialMessage,
          last_message_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (conversationError) {
        return res.status(500).json({ error: 'Failed to create conversation' });
      }

      conversationId = newConversation.id;
    }

    // Create message
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        message: initialMessage,
        read: false
      }])
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey(full_name)
      `)
      .single();

    if (messageError) {
      return res.status(500).json({ error: 'Failed to send message' });
    }

    // Get conversation with participants info
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:users!conversations_user1_id_fkey(full_name),
        user2:users!conversations_user2_id_fkey(full_name)
      `)
      .eq('id', conversationId)
      .single();

    if (conversationError) {
      return res.status(500).json({ error: 'Failed to fetch conversation' });
    }

    res.status(201).json({
      message: 'Conversation started successfully',
      conversation: {
        id: conversation.id,
        listingId: conversation.listing_id,
        participants: [conversation.user1_id, conversation.user2_id],
        lastMessage: conversation.last_message,
        lastMessageAt: conversation.last_message_at,
        unreadCount: 0,
        participantsInfo: [
          { id: conversation.user1_id, full_name: conversation.user1.full_name },
          { id: conversation.user2_id, full_name: conversation.user2.full_name }
        ]
      },
      newMessage: {
        id: newMessage.id,
        conversationId: newMessage.conversation_id,
        fromUserId: newMessage.from_user_id,
        toUserId: newMessage.to_user_id,
        message: newMessage.message,
        createdAt: newMessage.created_at,
        read: newMessage.read,
        fromUser: { full_name: newMessage.from_user.full_name }
      }
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Get user's conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:users!conversations_user1_id_fkey(full_name, phone),
        user2:users!conversations_user2_id_fkey(full_name, phone),
        listing:listings(title, category)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      listingId: conv.listing_id,
      participants: [conv.user1_id, conv.user2_id],
      lastMessage: conv.last_message,
      lastMessageAt: conv.last_message_at,
      unreadCount: 0, // TODO: Calculate unread count
      participantsInfo: [
        { id: conv.user1_id, full_name: conv.user1.full_name, phone: conv.user1.phone },
        { id: conv.user2_id, full_name: conv.user2.full_name, phone: conv.user2.phone }
      ],
      listing: {
        title: conv.listing.title,
        category: conv.listing.category
      }
    }));

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages in a conversation
router.get('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Check if user is part of this conversation
    const { data: conversation, error: checkError } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (checkError || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view this conversation' });
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey(full_name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    res.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if user is part of this conversation
    const { data: conversation, error: checkError } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (checkError || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to send message to this conversation' });
    }

    const toUserId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;

    // Create message
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        from_user_id: userId,
        to_user_id: toUserId,
        message: message,
        read: false
      }])
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey(full_name)
      `)
      .single();

    if (messageError) {
      return res.status(500).json({ error: 'Failed to send message' });
    }

    // Update conversation last message
    await supabase
      .from('conversations')
      .update({
        last_message: message,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    res.status(201).json({
      message: 'Message sent successfully',
      newMessage: {
        id: newMessage.id,
        conversationId: newMessage.conversation_id,
        fromUserId: newMessage.from_user_id,
        toUserId: newMessage.to_user_id,
        message: newMessage.message,
        createdAt: newMessage.created_at,
        read: newMessage.read,
        fromUser: { full_name: newMessage.from_user.full_name }
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
