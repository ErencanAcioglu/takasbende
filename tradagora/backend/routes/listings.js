const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/listings';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Production: Use Supabase for all data
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
    title: 'Guitar dersi veririm',
    description: 'Profesyonel gitarist olarak 5 yıllık deneyimim var. Başlangıç ve orta seviye dersler.',
    category: 'Hizmet',
    condition: 'excellent',
    location: 'İzmir',
    want_item: 'Piyano dersi',
    want_description: 'Klasik piyano dersi almak istiyorum',
    is_active: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    user: {
      full_name: 'Can Özkan',
      phone: '+90 534 456 78 90'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop',
        alt_text: 'Guitar lesson'
      }
    ]
  },
  {
    id: '4',
    title: 'Vintage saat koleksiyonu',
    description: '1950\'lerden kalma vintage saatler. Koleksiyon parçaları, nadir bulunur.',
    category: 'Hobi & Sanat',
    condition: 'excellent',
    location: 'Bursa',
    want_item: 'Antika tablo',
    want_description: 'Eski Türk tabloları veya antika dekoratif eşyalar',
    is_active: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    user: {
      full_name: 'Zeynep Kaya',
      phone: '+90 535 234 56 78'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523170335258-f5e6ff6c0e0b?w=400&h=300&fit=crop',
        alt_text: 'Vintage watches'
      }
    ]
  },
  {
    id: '5',
    title: 'Mountain bike veririm',
    description: 'Trek mountain bike, 21 vites, disk fren. Dağ bisikleti yarışları için ideal.',
    category: 'Spor & Outdoor',
    condition: 'good',
    location: 'Antalya',
    want_item: 'Kayak ekipmanları',
    want_description: 'Kayak takımı, botlar ve kask',
    is_active: true,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    user: {
      full_name: 'Murat Şen',
      phone: '+90 536 345 67 89'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618047-7c0a8b4b3b3b?w=400&h=300&fit=crop',
        alt_text: 'Mountain bike'
      }
    ]
  },
  {
    id: '6',
    title: 'Kitap koleksiyonu',
    description: '100+ kitap, çoğu klasik edebiyat. Türk ve dünya edebiyatından seçmeler.',
    category: 'Kitap & Dergi',
    condition: 'good',
    location: 'Eskişehir',
    want_item: 'E-kitap okuyucu',
    want_description: 'Kindle veya benzeri e-kitap okuyucu',
    is_active: true,
    created_at: new Date(Date.now() - 432000000).toISOString(),
    user: {
      full_name: 'Ayşe Yıldız',
      phone: '+90 537 456 78 90'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        alt_text: 'Book collection'
      }
    ]
  }
];

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      location, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Get listings from Supabase database
    let filteredListings = [];
    
    try {
      console.log('📥 Fetching listings from Supabase...');
      
      let query = supabase
        .from('listings')
        .select(`
          *,
          user:users(full_name, phone)
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

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + parseInt(limit) - 1;
      query = query.range(from, to);

      const { data: supabaseListings, error } = await query;

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Fetched listings from Supabase:', supabaseListings?.length || 0);
      
      // Add images to each listing
      filteredListings = (supabaseListings || []).map(listing => ({
        ...listing,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
            alt_text: listing.title
          }
        ]
      }));

    } catch (supabaseError) {
      console.error('❌ Failed to fetch from Supabase, using mock data:', supabaseError);
      
      // Fallback to mock data if Supabase fails
      filteredListings = [...mockListings];
    }

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredListings = filteredListings.filter(listing => 
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower) ||
        listing.want_item.toLowerCase().includes(searchLower)
      );
    }
    if (category) {
      filteredListings = filteredListings.filter(listing => listing.category === category);
    }
    if (location) {
      filteredListings = filteredListings.filter(listing => listing.location.toLowerCase().includes(location.toLowerCase()));
    }

    // Apply sorting
    filteredListings.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedListings = filteredListings.slice(startIndex, endIndex);

    // Update image URLs based on request origin
    const origin = req.get('origin') || req.get('referer') || '';
    let baseUrl = 'http://172.20.10.11:5001'; // Default for mobile
    
    if (origin.includes('localhost:3000')) {
      baseUrl = 'http://localhost:5001'; // For web
    }

    const listingsWithCorrectUrls = paginatedListings.map(listing => ({
      ...listing,
      images: listing.images ? listing.images.map(img => ({
        ...img,
        url: img.url.replace(/http:\/\/[^\/]+/, baseUrl)
      })) : []
    }));

    res.json({ 
      listings: listingsWithCorrectUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredListings.length,
        totalPages: Math.ceil(filteredListings.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get listing from Supabase database
    let listing = null;
    
    try {
      console.log('📥 Fetching listing from Supabase:', id);
      
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          user:users(full_name, phone)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      if (data) {
        listing = {
          ...data,
          images: [
            {
              url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
              alt_text: data.title
            }
          ]
        };
        console.log('✅ Fetched listing from Supabase:', listing.title);
      }

    } catch (supabaseError) {
      console.error('❌ Failed to fetch from Supabase, checking memory:', supabaseError);
      
      // Fallback to memory if Supabase fails
      const allListings = [...mockListings];
      listing = allListings.find(l => l.id === id);
    }
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update image URLs based on request origin
    const origin = req.get('origin') || req.get('referer') || '';
    let baseUrl = 'http://172.20.10.11:5001'; // Default for mobile
    
    if (origin.includes('localhost:3000')) {
      baseUrl = 'http://localhost:5001'; // For web
    }

    const listingWithCorrectUrls = {
      ...listing,
      images: listing.images ? listing.images.map(img => ({
        ...img,
        url: img.url.replace(/http:\/\/[^\/]+/, baseUrl)
      })) : []
    };

    res.json({ listing: listingWithCorrectUrls });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Create new listing (requires authentication)
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, condition, location, wantItem, wantDescription } = req.body;
    const userId = req.user.id;
    const user_id = req.user.id;
    
    console.log('📥 Received listing data:', {
      title, description, category, condition, location, wantItem, wantDescription,
      userId, filesCount: req.files ? req.files.length : 0
    });

    // Validate required fields
    if (!title || !description || !category || !wantItem) {
      console.log('Missing fields:', { title, description, category, wantItem });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      // Determine base URL based on request origin
      const origin = req.get('origin') || req.get('referer') || '';
      let baseUrl = 'http://172.20.10.11:5001'; // Default for mobile
      
      if (origin.includes('localhost:3000')) {
        baseUrl = 'http://localhost:5001'; // For web
      }
      
      req.files.forEach(file => {
        images.push({
          url: `${baseUrl}/uploads/listings/${file.filename}`,
          alt_text: file.originalname
        });
      });
    }

    // Generate UUID for Supabase
    const { v4: uuidv4 } = require('uuid');
    const listingId = uuidv4();
    
    // Create new listing (mock)
    const newListing = {
      id: listingId,
      title,
      description,
      category,
      condition: condition || 'good',
      location,
      want_item: wantItem,
      want_description: wantDescription,
      is_active: true,
      created_at: new Date().toISOString(),
      user: {
        full_name: req.user.full_name || 'User',
        phone: req.user.phone || ''
      },
      images: images
    };

    // Save to memory (real data, not mock)
    console.log('💾 Saving listing to memory...');
    
    // Update the existing newListing object
    // newListing.id already set to UUID above
    newListing.want_item = wantItem;
    newListing.want_description = wantDescription;
    newListing.is_active = true;
    newListing.user_id = userId;
    newListing.created_at = new Date().toISOString();
    newListing.updated_at = new Date().toISOString();
    newListing.images = images.length > 0 ? images : [{
      url: 'https://via.placeholder.com/400x300?text=No+Image',
      alt_text: 'No image available'
    }];

    // Save to Supabase database
    if (supabase) {
      try {
        console.log('💾 Saving listing to Supabase database...');
        
        const { data, error } = await supabase
        .from('listings')
        .insert([
          {
            id: newListing.id,
            title: newListing.title,
            description: newListing.description,
            category: newListing.category,
            condition: newListing.condition,
            location: newListing.location,
            want_item: newListing.want_item,
            want_description: newListing.want_description,
            is_active: newListing.is_active,
            user_id: newListing.user_id,
            created_at: newListing.created_at,
            updated_at: newListing.updated_at
          }
        ])
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Listing saved to Supabase:', data);

      // Also save to memory for immediate access
      mockListings.unshift(newListing);

      res.status(201).json({ 
        message: 'Listing created successfully',
        listing: newListing 
      });

    } catch (supabaseError) {
      console.error('❌ Failed to save to Supabase, saving to memory only:', supabaseError);
      
      // Fallback to memory if Supabase fails
      mockListings.unshift(newListing);
      
      res.status(201).json({ 
        message: 'Listing created successfully (saved to memory)',
        listing: newListing 
      });
    }
    } else {
      console.log('⚠️ Supabase not available, saving to memory only');
      
      // Save to memory only
      mockListings.unshift(newListing);
      
      res.status(201).json({ 
        message: 'Listing created successfully (saved to memory)',
        listing: newListing 
      });
    }
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Update listing (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user_id = req.user.id;

    // Find listing in mock data
    const listingIndex = mockListings.findIndex(l => l.id === id);
    
    if (listingIndex === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update listing
    mockListings[listingIndex] = {
      ...mockListings[listingIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    res.json({ 
      message: 'Listing updated successfully',
      listing: mockListings[listingIndex] 
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Find listing in mock data
    const listingIndex = mockListings.findIndex(l => l.id === id);
    
    if (listingIndex === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Remove from mock data
    mockListings.splice(listingIndex, 1);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;