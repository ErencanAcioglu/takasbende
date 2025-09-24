const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock users for development
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    full_name: 'Test User',
    phone: '+90 532 123 45 67',
    created_at: new Date().toISOString()
  }
];

// Add test user with known password
const testPassword = 'password123';
const hashedTestPassword = bcrypt.hashSync(testPassword, 10);
mockUsers.push({
  id: '2',
  email: 'demo@tradagora.com',
  password: hashedTestPassword,
  full_name: 'Demo User',
  phone: '+90 533 987 65 43',
  created_at: new Date().toISOString()
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password and full name are required' });
    }

    // Check if user already exists (mock)
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        email,
        password: hashedPassword,
        full_name: fullName,
        phone: phone || null
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        phone: newUser.phone,
        created_at: newUser.created_at
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user in Supabase
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Find user (mock)
    const user = mockUsers.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const userId = req.user.id;

    // Find user (mock)
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      full_name: fullName || mockUsers[userIndex].full_name,
      phone: phone || mockUsers[userIndex].phone,
      updated_at: new Date().toISOString()
    };

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: mockUsers[userIndex].id,
        email: mockUsers[userIndex].email,
        full_name: mockUsers[userIndex].full_name,
        phone: mockUsers[userIndex].phone,
        created_at: mockUsers[userIndex].created_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;