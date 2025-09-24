const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
  console.log('🔐 Auth middleware called for:', req.path);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🔑 Token received:', token ? 'YES' : 'NO');

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT Decoded:', decoded);
    
    // Verify user exists in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    console.log('Supabase user lookup:', { user, error });

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('JWT Error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };
