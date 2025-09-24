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

    // Filter mock data
    let filteredListings = [...mockListings];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredListings = filteredListings.filter(listing => 
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower) ||
        listing.want_item.toLowerCase().includes(searchLower)
      );
    }
    
    if (category) {
      filteredListings = filteredListings.filter(listing => 
        listing.category === category
      );
    }
    
    if (location) {
      filteredListings = filteredListings.filter(listing => 
        listing.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    res.json({
      listings: filteredListings,
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
    
    // Find in mock data
    const listing = mockListings.find(l => l.id === id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Create new listing (requires authentication)
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, condition, location, wantItem, wantDescription } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!title || !description || !category || !wantItem) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          url: `/uploads/listings/${file.filename}`,
          alt_text: file.originalname
        });
      });
    }

    // Create new listing (mock)
    const newListing = {
      id: Date.now().toString(),
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

    // Add to mock data
    mockListings.unshift(newListing);

    res.status(201).json({ 
      message: 'Listing created successfully',
      listing: newListing 
    });
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