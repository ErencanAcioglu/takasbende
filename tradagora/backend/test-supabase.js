// Supabase bağlantı testi
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Supabase Bağlantı Testi');
console.log('========================');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables eksik!');
  console.log('Lütfen .env dosyasını kontrol edin.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔄 Supabase bağlantısı test ediliyor...');
    
    // Test query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase bağlantı hatası:', error.message);
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('💡 Çözüm: Database schema uygulanmamış');
        console.log('Supabase SQL Editor\'da schema.sql dosyasını çalıştırın');
      }
    } else {
      console.log('✅ Supabase bağlantısı başarılı!');
      console.log('📊 Test sonucu:', data);
    }
  } catch (error) {
    console.error('❌ Test hatası:', error.message);
  }
}

testConnection();
