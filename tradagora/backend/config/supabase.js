const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️ Supabase environment variables not found, using fallback mode');
  module.exports = null;
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  module.exports = supabase;
}
