const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const aiMatching = require('../services/aiMatching');

const router = express.Router();

// Mock data for development
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
    user_id: '1',
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
    user_id: '2',
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
  },
  {
    id: '3',
    title: 'MacBook Air M2 veririm',
    description: 'Sıfır ayarında MacBook Air M2, 8GB RAM, 256GB SSD. Kutusu ve tüm aksesuarları ile.',
    category: 'Elektronik',
    condition: 'new',
    location: 'İzmir',
    want_item: 'iPhone 15 Pro',
    want_description: 'iPhone 15 Pro, 256GB veya üzeri',
    is_active: true,
    user_id: '3',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    user: {
      full_name: 'Can Özkan',
      phone: '+90 544 567 89 01'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
        alt_text: 'MacBook Air M2'
      }
    ]
  }
];

// Get matches for a listing
router.get('/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { type = 'direct' } = req.query; // direct, chain, similar

    // Get the listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .eq('is_active', true)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get all active listings for matching
    const { data: allListings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .eq('is_active', true)
      .neq('id', listingId);

    if (listingsError) {
      return res.status(500).json({ error: 'Failed to fetch listings' });
    }

    let matches = [];

    if (type === 'direct') {
      // Direct matches using AI
      matches = await aiMatching.findMatches(listing, allListings);
    } else if (type === 'chain') {
      // Chain trades using AI
      matches = await aiMatching.findChainTrades(listing, allListings);
    } else if (type === 'similar') {
      // Similar items using AI
      matches = await aiMatching.findSimilarItems(listing, allListings);
    }

    res.json({
      listing,
      matches,
      type,
      total: matches.length
    });
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

// AI-powered smart search
router.post('/search', async (req, res) => {
  try {
    const { query, userContext = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchResults = await aiMatching.smartSearch(query, mockListings, userContext);
    
    res.json({
      query,
      results: searchResults,
      total: searchResults.length,
      intent: searchResults[0]?.intent || 'general'
    });
  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({ error: 'Failed to perform smart search' });
  }
});

// AI-powered recommendations
router.get('/recommendations/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    // Get user's listings (mock for now)
    const userListings = mockListings.filter(l => l.user_id === userId);
    
    const recommendations = await aiMatching.getRecommendations(
      userId, 
      userListings, 
      mockListings, 
      parseInt(limit)
    );
    
    res.json({
      userId,
      recommendations,
      total: recommendations.length
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// AI-powered category detection
router.post('/detect-category', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const category = await aiMatching.detectCategory(title, description);
    
    res.json({
      title,
      description,
      detectedCategory: category
    });
  } catch (error) {
    console.error('Category detection error:', error);
    res.status(500).json({ error: 'Failed to detect category' });
  }
});

// AI-powered condition assessment
router.post('/assess-condition', async (req, res) => {
  try {
    const { title, description, userClaimedCondition } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const assessedCondition = await aiMatching.assessCondition(
      title, 
      description, 
      userClaimedCondition
    );
    
    res.json({
      title,
      description,
      userClaimedCondition,
      assessedCondition,
      confidence: assessedCondition === userClaimedCondition ? 'high' : 'medium'
    });
  } catch (error) {
    console.error('Condition assessment error:', error);
    res.status(500).json({ error: 'Failed to assess condition' });
  }
});

// AI-powered value equivalence for bartering
router.post('/calculate-equivalence', async (req, res) => {
  try {
    const { item1, item2 } = req.body;
    
    if (!item1 || !item2) {
      return res.status(400).json({ error: 'Both items are required' });
    }

    const equivalence = await aiMatching.calculateValueEquivalence(item1, item2);
    
    res.json({
      item1: item1.title,
      item2: item2.title,
      equivalence,
      description: equivalence > 80 ? 'Excellent match for barter' : 
                  equivalence > 60 ? 'Good match for barter' : 
                  equivalence > 40 ? 'Fair match for barter' : 'Poor match for barter'
    });
  } catch (error) {
    console.error('Value equivalence error:', error);
    res.status(500).json({ error: 'Failed to calculate equivalence' });
  }
});

// AI-powered trade success prediction
router.post('/predict-success', async (req, res) => {
  try {
    const { listing1, listing2, user1Profile, user2Profile } = req.body;
    
    if (!listing1 || !listing2) {
      return res.status(400).json({ error: 'Both listings are required' });
    }

    const prediction = await aiMatching.predictTradeSuccess(
      listing1, 
      listing2, 
      user1Profile || {}, 
      user2Profile || {}
    );
    
    res.json({
      listing1: listing1.title,
      listing2: listing2.title,
      prediction
    });
  } catch (error) {
    console.error('Trade success prediction error:', error);
    res.status(500).json({ error: 'Failed to predict trade success' });
  }
});

// AI-powered similarity calculation
router.post('/calculate-similarity', async (req, res) => {
  try {
    const { item1, item2, context = {} } = req.body;
    
    if (!item1 || !item2) {
      return res.status(400).json({ error: 'Both items are required' });
    }

    const similarity = await aiMatching.calculateSimilarity(item1, item2, context);
    
    res.json({
      item1: item1.title,
      item2: item2.title,
      similarity,
      context
    });
  } catch (error) {
    console.error('Similarity calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate similarity' });
  }
});

// AI analytics and insights
router.get('/analytics/trends', async (req, res) => {
  try {
    const { category, location, timeframe = '30d' } = req.query;
    
    // Mock analytics data
    const trends = {
      popularCategories: [
        { category: 'Elektronik', count: 45, growth: '+12%' },
        { category: 'Giyim', count: 32, growth: '+8%' },
        { category: 'Ev & Yaşam', count: 28, growth: '+15%' }
      ],
      trendingItems: [
        { item: 'iPhone 15 Pro', demand: 'high', desirability: 95 },
        { item: 'MacBook Air M2', demand: 'high', desirability: 90 },
        { item: 'Nike Air Max', demand: 'medium', desirability: 75 }
      ],
      locationStats: [
        { location: 'İstanbul', listings: 120, trades: 45 },
        { location: 'Ankara', listings: 85, trades: 32 },
        { location: 'İzmir', listings: 65, trades: 28 }
      ],
      successRates: {
        direct: 78,
        chain: 45,
        partial: 62
      }
    };
    
    res.json({
      timeframe,
      trends,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

module.exports = router;