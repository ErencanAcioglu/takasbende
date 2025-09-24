const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock data for offers and listings (for development)
const mockOffers = [];
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
    user_id: '1', // Owner of the listing
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
    user_id: '2', // Owner of the listing
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

// Create a new offer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { listingId, offerItem, offerDescription } = req.body;
    const fromUserId = req.user.id; // User making the offer

    if (!listingId || !offerItem) {
      return res.status(400).json({ error: 'Listing ID and offer item are required' });
    }

    const targetListing = mockListings.find(l => l.id === listingId);
    if (!targetListing) {
      return res.status(404).json({ error: 'Target listing not found' });
    }

    if (targetListing.user_id === fromUserId) {
      return res.status(400).json({ error: 'Cannot offer to your own listing' });
    }

    const newOffer = {
      id: Date.now().toString(),
      listingId,
      fromUserId,
      toUserId: targetListing.user_id,
      offerItem,
      offerDescription: offerDescription || null,
      status: 'pending', // pending, accepted, rejected
      createdAt: new Date().toISOString(),
      fromUser: {
        full_name: req.user.full_name,
        phone: req.user.phone
      }
    };

    mockOffers.push(newOffer);

    res.status(201).json({ message: 'Offer created successfully', offer: newOffer });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// Get offers for a specific listing (owner can see)
router.get('/listing/:listingId', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    const targetListing = mockListings.find(l => l.id === listingId);
    if (!targetListing || targetListing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view offers for this listing' });
    }

    const offers = mockOffers.filter(offer => offer.listingId === listingId);

    res.json({ offers });
  } catch (error) {
    console.error('Get listing offers error:', error);
    res.status(500).json({ error: 'Failed to fetch offers for listing' });
  }
});

// Get offers made by the current user
router.get('/my-offers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const offers = mockOffers.filter(offer => offer.fromUserId === userId);
    res.json({ offers });
  } catch (error) {
    console.error('Get my offers error:', error);
    res.status(500).json({ error: 'Failed to fetch my offers' });
  }
});

// Accept an offer
router.put('/:offerId/accept', authenticateToken, async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;

    const offerIndex = mockOffers.findIndex(o => o.id === offerId);
    if (offerIndex === -1) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const offer = mockOffers[offerIndex];
    const targetListing = mockListings.find(l => l.id === offer.listingId);

    if (!targetListing || targetListing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to accept this offer' });
    }

    offer.status = 'accepted';
    // In a real scenario, this would trigger a trade process, notifications, etc.

    res.json({ message: 'Offer accepted successfully', offer });
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

// Reject an offer
router.put('/:offerId/reject', authenticateToken, async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;

    const offerIndex = mockOffers.findIndex(o => o.id === offerId);
    if (offerIndex === -1) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const offer = mockOffers[offerIndex];
    const targetListing = mockListings.find(l => l.id === offer.listingId);

    if (!targetListing || targetListing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to reject this offer' });
    }

    offer.status = 'rejected';

    res.json({ message: 'Offer rejected successfully', offer });
  } catch (error) {
    console.error('Reject offer error:', error);
    res.status(500).json({ error: 'Failed to reject offer' });
  }
});

module.exports = router;