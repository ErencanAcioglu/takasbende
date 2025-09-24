const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      condition, 
      location, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build Supabase query
    let query = supabase
      .from('listings')
      .select(`
        *,
        user:users(full_name, phone),
        images:listing_images(url, alt_text)
      `)
      .eq('is_active', true);
    
    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,want_item.ilike.%${search}%`);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (condition) {
      query = query.eq('condition', condition);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);
    
    const { data: listings, error, count } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      listings: listings || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get a specific listing
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        user:users(full_name, phone),
        images:listing_images(url, alt_text)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error || !listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    res.json({ listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Create a new listing
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      location,
      want_item,
      want_description
    } = req.body;
    
    if (!title || !description || !category || !condition || !location) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    // Create listing in Supabase
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert([{
        title,
        description,
        category,
        condition,
        location,
        want_item: want_item || null,
        want_description: want_description || null,
        user_id: req.user.id,
        is_active: true
      }])
      .select()
      .single();
    
    if (listingError) {
      return res.status(500).json({ error: 'Failed to create listing' });
    }
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageInserts = req.files.map(file => ({
        listing_id: listing.id,
        url: `/uploads/${file.filename}`,
        alt_text: file.originalname
      }));
      
      const { error: imageError } = await supabase
        .from('listing_images')
        .insert(imageInserts);
      
      if (imageError) {
        console.error('Error uploading images:', imageError);
      }
    }
    
    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Update a listing
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      condition,
      location,
      want_item,
      want_description,
      is_active
    } = req.body;
    
    // Check if listing exists and belongs to user
    const { data: existingListing, error: checkError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (checkError || !existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    if (existingListing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this listing' });
    }
    
    // Update listing
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (condition) updateData.condition = condition;
    if (location) updateData.location = location;
    if (want_item !== undefined) updateData.want_item = want_item;
    if (want_description !== undefined) updateData.want_description = want_description;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    updateData.updated_at = new Date().toISOString();
    
    const { data: listing, error: updateError } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      return res.status(500).json({ error: 'Failed to update listing' });
    }
    
    res.json({
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete a listing
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if listing exists and belongs to user
    const { data: existingListing, error: checkError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (checkError || !existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    if (existingListing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this listing' });
    }
    
    // Delete listing (this will cascade delete images due to foreign key)
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      return res.status(500).json({ error: 'Failed to delete listing' });
    }
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;
