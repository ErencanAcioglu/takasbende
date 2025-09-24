const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Temporary mock for development
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase environment variables not found. Using mock data for development.');
  
  // Mock Supabase client for development
  const mockSupabase = {
    from: (table) => ({
      select: () => ({
        eq: () => ({ data: [], error: null }),
        data: [],
        error: null
      }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ eq: () => ({ data: [], error: null }) }),
      delete: () => ({ eq: () => ({ data: [], error: null }) })
    }),
    auth: {
      signUp: () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
      signInWithPassword: () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
      getUser: () => ({ data: { user: { id: 'mock-user-id' } }, error: null })
    }
  };
  
  module.exports = mockSupabase;
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  module.exports = supabase;
}
