const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        created_at,
        listings:listings(id, title, category, is_active, created_at)
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const updateData = {};

    if (fullName) updateData.full_name = fullName;
    if (phone) updateData.phone = phone;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, email, full_name, phone, updated_at')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's listings
router.get('/listings', authenticateToken, async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('listings')
      .select(`
        *,
        images:listing_images(url, alt_text)
      `)
      .eq('user_id', req.user.id);

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    const { data: listings, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
});

// Get user's favorites
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(`
        listing:listings(
          *,
          user:users(full_name, phone),
          images:listing_images(url, alt_text)
        )
      `)
      .eq('user_id', req.user.id)
      .eq('listing.is_active', true);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const listings = favorites.map(fav => fav.listing).filter(Boolean);

    res.json({ favorites: listings });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add to favorites
router.post('/favorites/:listingId', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.params;

    // Check if listing exists
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id')
      .eq('id', listingId)
      .eq('is_active', true)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if already favorited
    const { data: existingFavorite } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('listing_id', listingId)
      .single();

    if (existingFavorite) {
      return res.status(400).json({ error: 'Already in favorites' });
    }

    // Add to favorites
    const { error } = await supabase
      .from('user_favorites')
      .insert([
        {
          user_id: req.user.id,
          listing_id: listingId,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites
router.delete('/favorites/:listingId', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.params;

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', req.user.id)
      .eq('listing_id', listingId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

module.exports = router;
