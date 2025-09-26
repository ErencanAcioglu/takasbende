const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
// Resend removed - using EmailJS from frontend
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

// EmailJS used from frontend instead of Resend

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://takasbende.onrender.com/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', profile.id)
      .single();

    if (existingUser) {
      return done(null, existingUser);
    }

    // Check if user exists with same email
    const { data: emailUser, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', profile.emails[0].value)
      .single();

    if (emailUser) {
      // Update existing user with Google ID
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          google_id: profile.id,
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', emailUser.id)
        .select()
        .single();

      if (updateError) {
        return done(updateError, null);
      }

      return done(null, updatedUser);
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        google_id: profile.id,
        email: profile.emails[0].value,
        full_name: profile.displayName,
        password: 'google_oauth_user', // Dummy password for Google users
        is_verified: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      return done(createError, null);
    }

    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

// No mock users - using Supabase only

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password and full name are required' });
    }

    // Check if user already exists in Supabase
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase (initially unverified)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        email,
        password: hashedPassword,
        full_name: fullName,
        phone: phone || null,
        is_verified: false
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Mail doğrulamayı kaldır - sadece doğrulama kodu sayfasına yönlendir

    // Send verification code via EmailJS (frontend will handle this)
    // The frontend will send the email with the verification code

    res.status(201).json({
      message: 'User created successfully. Please enter the verification code sent to your email.',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        phone: newUser.phone,
        created_at: newUser.created_at,
        is_verified: false
      },
      verificationCode: '111111' // For development - remove in production
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Verify Code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    console.log('Verify code request:', { email, code });

    // Validate input
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Geçici olarak herkes için 111111 kabul et
    if (code === '111111') {
      console.log('Code is 111111, looking for user with email:', email);
      
      // Find user in Supabase
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      console.log('User lookup result:', { user, findError });

      if (findError || !user) {
        console.log('User not found, returning 400');
        return res.status(400).json({ error: 'User not found' });
      }

      // Update user as verified
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ error: 'Failed to verify user' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: updatedUser.id, email: updatedUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Email verified successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          phone: updatedUser.phone,
          created_at: updatedUser.created_at,
          is_verified: true
        },
        token
      });
    } else {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Failed to verify code' });
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

    // Check if email is verified
    if (!user.is_verified) {
      return res.status(401).json({ 
        error: 'Please verify your email before logging in. Check your inbox for verification email.' 
      });
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
    // Find user in Supabase
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, full_name, phone, created_at')
      .eq('id', req.user.id)
      .single();

    if (findError || !user) {
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

    // Update user in Supabase
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone: phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, full_name, phone, created_at')
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        phone: updatedUser.phone,
        created_at: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }


// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;