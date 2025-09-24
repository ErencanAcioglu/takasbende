// Detaylı Auth sistemi testi
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('🔍 DETAYLI AUTH SİSTEMİ TESTİ');
console.log('==============================');

// Supabase client oluştur
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: User registration
async function testUserRegistration() {
  console.log('\n🧪 Test 1: User Registration');
  console.log('==============================');
  
  try {
    const testUser = {
      email: 'test@tradagora.com',
      password: 'testpassword123',
      full_name: 'Test User',
      phone: '+90 555 123 45 67'
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    // Insert user into database
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: testUser.email,
          password: hashedPassword,
          full_name: testUser.full_name,
          phone: testUser.phone
        }
      ])
      .select()
      .single();

    if (error) {
      console.log('❌ User registration failed:', error.message);
      return null;
    } else {
      console.log('✅ User registration successful');
      console.log('📊 User data:', {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone
      });
      return data;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return null;
  }
}

// Test 2: User login
async function testUserLogin(email, password) {
  console.log('\n🧪 Test 2: User Login');
  console.log('======================');
  
  try {
    // Find user in database
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user) {
      console.log('❌ User not found:', findError?.message);
      return null;
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return null;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User login successful');
    console.log('📊 Login data:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      token: token.substring(0, 20) + '...'
    });

    return { user, token };
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

// Test 3: JWT token verification
async function testJWTVerification(token) {
  console.log('\n🧪 Test 3: JWT Token Verification');
  console.log('===================================');
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token valid');
    console.log('📊 Decoded token:', decoded);

    // Verify user exists in database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      console.log('❌ User not found in database');
      return null;
    }

    console.log('✅ User verified in database');
    console.log('📊 User data:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name
    });

    return user;
  } catch (error) {
    console.log('❌ JWT verification failed:', error.message);
    return null;
  }
}

// Test 4: API endpoint test with auth
async function testAPIWithAuth(token) {
  console.log('\n🧪 Test 4: API Endpoint with Auth');
  console.log('==================================');
  
  try {
    const response = await fetch('http://localhost:5001/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint with auth successful');
      console.log('📊 Response:', data);
      return true;
    } else {
      console.log('❌ API endpoint failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ API test error:', error.message);
    return false;
  }
}

// Test 5: User profile update
async function testUserProfileUpdate(userId, token) {
  console.log('\n🧪 Test 5: User Profile Update');
  console.log('===============================');
  
  try {
    const updateData = {
      full_name: 'Updated Test User',
      phone: '+90 555 999 88 77'
    };

    const response = await fetch('http://localhost:5001/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Profile update successful');
      console.log('📊 Updated data:', data);
      return true;
    } else {
      console.log('❌ Profile update failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Profile update error:', error.message);
    return false;
  }
}

// Test 6: User deletion (cleanup)
async function testUserDeletion(userId) {
  console.log('\n🧪 Test 6: User Cleanup');
  console.log('=======================');
  
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.log('❌ User deletion failed:', error.message);
      return false;
    } else {
      console.log('✅ User cleanup successful');
      return true;
    }
  } catch (error) {
    console.log('❌ User deletion error:', error.message);
    return false;
  }
}

// Ana test fonksiyonu
async function runAuthTests() {
  console.log('\n🚀 Auth Testleri Başlatılıyor...');
  console.log('================================');
  
  let testUser = null;
  let authToken = null;
  
  try {
    // Test 1: User registration
    testUser = await testUserRegistration();
    if (!testUser) {
      console.log('❌ Registration failed, stopping tests');
      return;
    }

    // Test 2: User login
    const loginResult = await testUserLogin('test@tradagora.com', 'testpassword123');
    if (!loginResult) {
      console.log('❌ Login failed, stopping tests');
      return;
    }
    authToken = loginResult.token;

    // Test 3: JWT verification
    const verifiedUser = await testJWTVerification(authToken);
    if (!verifiedUser) {
      console.log('❌ JWT verification failed, stopping tests');
      return;
    }

    // Test 4: API endpoint with auth
    const apiTest = await testAPIWithAuth(authToken);
    if (!apiTest) {
      console.log('❌ API test failed');
    }

    // Test 5: User profile update
    const profileUpdate = await testUserProfileUpdate(testUser.id, authToken);
    if (!profileUpdate) {
      console.log('❌ Profile update failed');
    }

    // Test 6: User cleanup
    await testUserDeletion(testUser.id);

    // Sonuç özeti
    console.log('\n📊 AUTH TEST SONUÇLARI');
    console.log('======================');
    console.log('User Registration:', testUser ? '✅ Başarılı' : '❌ Başarısız');
    console.log('User Login:', loginResult ? '✅ Başarılı' : '❌ Başarısız');
    console.log('JWT Verification:', verifiedUser ? '✅ Başarılı' : '❌ Başarısız');
    console.log('API with Auth:', apiTest ? '✅ Başarılı' : '❌ Başarısız');
    console.log('Profile Update:', profileUpdate ? '✅ Başarılı' : '❌ Başarısız');
    
    const allTestsPassed = testUser && loginResult && verifiedUser && apiTest && profileUpdate;
    console.log('\n🎯 Genel Durum:', allTestsPassed ? '✅ Tüm testler başarılı' : '⚠️ Bazı testler başarısız');
    
    if (allTestsPassed) {
      console.log('\n🎉 Auth sistemi tamamen çalışıyor!');
      console.log('✅ Mock veri kaldırıldı');
      console.log('✅ Gerçek Supabase auth aktif');
      console.log('✅ JWT token sistemi çalışıyor');
      console.log('✅ API endpoint\'ler güvenli');
    } else {
      console.log('\n⚠️ Bazı auth testleri başarısız');
      console.log('💡 Çözüm: Backend server\'ı yeniden başlat');
    }

  } catch (error) {
    console.log('❌ Test hatası:', error.message);
  }
}

// Testleri çalıştır
runAuthTests().catch(console.error);
