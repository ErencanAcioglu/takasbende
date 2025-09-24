const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a new offer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { listingId, offerItem, offerDescription } = req.body;
    const fromUserId = req.user.id;

    if (!listingId || !offerItem) {
      return res.status(400).json({ error: 'Listing ID and offer item are required' });
    }

    // Check if listing exists
    const { data: targetListing, error: listingError } = await supabase
      .from('listings')
      .select('id, user_id')
      .eq('id', listingId)
      .eq('is_active', true)
      .single();

    if (listingError || !targetListing) {
      return res.status(404).json({ error: 'Target listing not found' });
    }

    if (targetListing.user_id === fromUserId) {
      return res.status(400).json({ error: 'Cannot offer to your own listing' });
    }

    // Create offer in Supabase
    const { data: newOffer, error: insertError } = await supabase
      .from('offers')
      .insert([{
        listing_id: listingId,
        from_user_id: fromUserId,
        to_user_id: targetListing.user_id,
        offer_item: offerItem,
        offer_description: offerDescription || null,
        status: 'pending'
      }])
      .select(`
        *,
        from_user:users!offers_from_user_id_fkey(full_name, phone)
      `)
      .single();

    if (insertError) {
      return res.status(500).json({ error: 'Failed to create offer' });
    }

    res.status(201).json({
      message: 'Offer created successfully',
      offer: newOffer
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// Get offers for a specific listing (owner can see)
router.get('/listing/:listingId', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    // Check if listing exists and belongs to user
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view offers for this listing' });
    }

    // Get offers for this listing
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select(`
        *,
        from_user:users!offers_from_user_id_fkey(full_name, phone)
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (offersError) {
      return res.status(500).json({ error: 'Failed to fetch offers' });
    }

    res.json({ offers: offers || [] });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Get offers made by the current user
router.get('/my-offers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: offers, error } = await supabase
      .from('offers')
      .select(`
        *,
        listing:listings(title, category, condition),
        to_user:users!offers_to_user_id_fkey(full_name, phone)
      `)
      .eq('from_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch offers' });
    }

    res.json({ offers: offers || [] });
  } catch (error) {
    console.error('Error fetching my offers:', error);
    res.status(500).json({ error: 'Failed to fetch my offers' });
  }
});

// Accept an offer
router.put('/:offerId/accept', authenticateToken, async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;

    // Get offer details
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select(`
        *,
        listing:listings(user_id)
      `)
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Check if user is the listing owner
    if (offer.listing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to accept this offer' });
    }

    // Update offer status
    const { data: updatedOffer, error: updateError } = await supabase
      .from('offers')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', offerId)
      .select(`
        *,
        from_user:users!offers_from_user_id_fkey(full_name, phone)
      `)
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to accept offer' });
    }

    res.json({
      message: 'Offer accepted successfully',
      offer: updatedOffer
    });
  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

// Reject an offer
router.put('/:offerId/reject', authenticateToken, async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;

    // Get offer details
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select(`
        *,
        listing:listings(user_id)
      `)
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Check if user is the listing owner
    if (offer.listing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to reject this offer' });
    }

    // Update offer status
    const { data: updatedOffer, error: updateError } = await supabase
      .from('offers')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', offerId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to reject offer' });
    }

    res.json({
      message: 'Offer rejected successfully',
      offer: updatedOffer
    });
  } catch (error) {
    console.error('Error rejecting offer:', error);
    res.status(500).json({ error: 'Failed to reject offer' });
  }
});

module.exports = router;
