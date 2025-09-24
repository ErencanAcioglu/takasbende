// Detaylı Supabase bağlantı testi
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 DETAYLI SUPABASE BAĞLANTI TESTİ');
console.log('=====================================');

// Environment variables kontrolü
console.log('\n📋 Environment Variables:');
console.log('========================');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Supabase client oluşturma
console.log('\n🔗 Supabase Client Oluşturuluyor...');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase client oluşturuldu');

// Test 1: Temel bağlantı
async function testBasicConnection() {
  console.log('\n🧪 Test 1: Temel Bağlantı');
  console.log('========================');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Temel bağlantı hatası:', error.message);
      return false;
    } else {
      console.log('✅ Temel bağlantı başarılı');
      console.log('📊 Sonuç:', data);
      return true;
    }
  } catch (error) {
    console.error('❌ Test hatası:', error.message);
    return false;
  }
}

// Test 2: Tablo varlığı kontrolü
async function testTableExistence() {
  console.log('\n🧪 Test 2: Tablo Varlığı');
  console.log('========================');
  
  const tables = ['users', 'listings', 'offers', 'conversations', 'messages'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} tablosu: ${error.message}`);
        results[table] = false;
      } else {
        console.log(`✅ ${table} tablosu: Mevcut`);
        results[table] = true;
      }
    } catch (error) {
      console.log(`❌ ${table} tablosu: ${error.message}`);
      results[table] = false;
    }
  }
  
  return results;
}

// Test 3: RLS (Row Level Security) kontrolü
async function testRLS() {
  console.log('\n🧪 Test 3: RLS Kontrolü');
  console.log('======================');
  
  try {
    // RLS aktif mi kontrol et
    const { data, error } = await supabase
      .rpc('check_rls_status');
    
    if (error) {
      console.log('⚠️ RLS durumu kontrol edilemedi:', error.message);
    } else {
      console.log('✅ RLS durumu:', data);
    }
  } catch (error) {
    console.log('⚠️ RLS kontrolü yapılamadı:', error.message);
  }
}

// Test 4: Auth testi
async function testAuth() {
  console.log('\n🧪 Test 4: Auth Sistemi');
  console.log('======================');
  
  try {
    // Auth durumu kontrol et
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('⚠️ Auth sistemi:', error.message);
    } else {
      console.log('✅ Auth sistemi çalışıyor');
      console.log('👤 Mevcut kullanıcı:', user ? 'Giriş yapılmış' : 'Giriş yapılmamış');
    }
  } catch (error) {
    console.log('⚠️ Auth testi yapılamadı:', error.message);
  }
}

// Test 5: API endpoint testi
async function testAPIEndpoints() {
  console.log('\n🧪 Test 5: API Endpoint Testi');
  console.log('=============================');
  
  const endpoints = [
    '/api/health',
    '/api/auth/me',
    '/api/listings',
    '/api/matching'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:5001${endpoint}`);
      if (response.ok) {
        console.log(`✅ ${endpoint}: ${response.status}`);
      } else {
        console.log(`❌ ${endpoint}: ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠️ ${endpoint}: Bağlantı hatası`);
    }
  }
}

// Ana test fonksiyonu
async function runAllTests() {
  console.log('\n🚀 Tüm Testler Başlatılıyor...');
  console.log('==============================');
  
  // Test 1: Temel bağlantı
  const basicConnection = await testBasicConnection();
  
  // Test 2: Tablo varlığı
  const tableResults = await testTableExistence();
  
  // Test 3: RLS kontrolü
  await testRLS();
  
  // Test 4: Auth testi
  await testAuth();
  
  // Test 5: API endpoint testi
  await testAPIEndpoints();
  
  // Sonuç özeti
  console.log('\n📊 TEST SONUÇLARI');
  console.log('==================');
  console.log('Temel Bağlantı:', basicConnection ? '✅ Başarılı' : '❌ Başarısız');
  
  console.log('\nTablo Durumu:');
  Object.entries(tableResults).forEach(([table, exists]) => {
    console.log(`  ${table}:`, exists ? '✅ Mevcut' : '❌ Eksik');
  });
  
  const allTablesExist = Object.values(tableResults).every(exists => exists);
  console.log('\nGenel Durum:', allTablesExist ? '✅ Tüm tablolar mevcut' : '⚠️ Bazı tablolar eksik');
  
  if (!allTablesExist) {
    console.log('\n💡 Çözüm:');
    console.log('1. Supabase SQL Editor\'a git');
    console.log('2. database/fixed_schema.sql dosyasını çalıştır');
    console.log('3. database/fixed_sample_data.sql dosyasını çalıştır');
  }
  
  console.log('\n🎯 Test Tamamlandı!');
}

// Testleri çalıştır
runAllTests().catch(console.error);
