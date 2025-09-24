# 🔄 Tradagora - Her Şeyin Takas Pazarı

AI destekli zincirleme takas sistemi ile çalışan yenilikçi pazar yeri platformu.

## 🚀 Proje Özeti

Tradagora, kullanıcıların "X veririm, Y isterim" diye ilan açtığı, AI'ın birebir ve zincirleme eşleşmeler kurduğu, hem ürün hem de hizmet takasını destekleyen kapsamlı bir takas platformudur.

## ✨ Özellikler

### 🎯 Ana Özellikler
- **AI Destekli Eşleşme**: Birebir ve zincirleme takas önerileri
- **Kapsamlı Kategori Sistemi**: Ürün ve hizmet takası
- **Trendyol Benzeri UX**: Klasik e-ticaret deneyimi
- **"Benim İçin Bul" Modu**: Pasif eşleşme önerileri
- **Güvenli Takas**: Escrow ve kullanıcı değerlendirme sistemi

### 🔧 Teknik Özellikler
- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **AI Matching**: Semantik benzerlik + Graph algoritması

## 🏗️ Proje Yapısı

```
tradagora/
├── backend/                 # Node.js API
│   ├── config/             # Supabase konfigürasyonu
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   │   ├── auth.js         # Kullanıcı işlemleri
│   │   ├── listings.js    # İlan yönetimi
│   │   ├── matching.js     # AI eşleşme algoritması
│   │   └── users.js        # Kullanıcı profili
│   └── server.js           # Ana server dosyası
├── frontend/               # React uygulaması
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── contexts/      # Auth context
│   │   ├── pages/          # Sayfa bileşenleri
│   │   └── App.tsx         # Ana uygulama
├── database/
│   └── schema.sql          # Veritabanı şeması
└── README.md
```

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16+)
- npm veya yarn
- Supabase hesabı

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd tradagora
```

### 2. Backend Kurulumu
```bash
# Backend bağımlılıklarını yükleyin
npm install

# Environment dosyasını oluşturun
cp backend/env.example backend/.env

# .env dosyasını düzenleyin
# SUPABASE_URL=your-supabase-url
# SUPABASE_ANON_KEY=your-supabase-anon-key
# JWT_SECRET=your-jwt-secret

# Backend'i başlatın
npm run dev
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install

# Frontend'i başlatın
npm start
```

### 4. Veritabanı Kurulumu
1. Supabase projesi oluşturun
2. `database/schema.sql` dosyasını Supabase SQL Editor'da çalıştırın
3. Environment değişkenlerini güncelleyin

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

### Listings
- `GET /api/listings` - İlanları listele
- `GET /api/listings/:id` - İlan detayı
- `POST /api/listings` - Yeni ilan oluştur
- `PUT /api/listings/:id` - İlan güncelle
- `DELETE /api/listings/:id` - İlan sil

### Matching
- `GET /api/matching/:listingId` - İlan için eşleşmeler
- `GET /api/matching/recommendations/for-me` - Kişisel öneriler

### Users
- `GET /api/users/profile` - Kullanıcı profili
- `PUT /api/users/profile` - Profil güncelle
- `GET /api/users/listings` - Kullanıcının ilanları
- `GET /api/users/favorites` - Favoriler
- `POST /api/users/favorites/:listingId` - Favoriye ekle
- `DELETE /api/users/favorites/:listingId` - Favoriden çıkar

## 🤖 AI Eşleşme Algoritması

### 1. Birebir Eşleşme
- A'nın istediği = B'nin verdiği
- Semantik benzerlik skoru
- Kategori ve konum uyumu

### 2. Zincirleme Eşleşme
- A→B→C→A döngüsü
- Graph algoritması ile zincir bulma
- Uyumluluk skoru hesaplama

### 3. Benzer Eşleşme
- Aynı kategoride benzer ürünler
- Kullanıcı tercihlerine göre öneriler

## 🎨 UI/UX Özellikleri

- **Material-UI**: Modern ve responsive tasarım
- **Trendyol Benzeri**: Katalog görünümü ve filtreleme
- **Mobil Uyumlu**: Responsive tasarım
- **Kategori Renkleri**: Görsel kategorizasyon
- **Favori Sistemi**: Kullanıcı tercihleri

## 🔒 Güvenlik

- **JWT Authentication**: Güvenli token sistemi
- **Row Level Security**: Supabase RLS politikaları
- **Input Validation**: Tüm girişler doğrulanır
- **CORS Protection**: Cross-origin güvenlik

## 📊 Veritabanı Şeması

### Ana Tablolar
- `users`: Kullanıcı bilgileri
- `listings`: İlanlar
- `listing_images`: İlan görselleri
- `user_favorites`: Kullanıcı favorileri
- `messages`: Mesajlaşma sistemi
- `trades`: Takas işlemleri
- `user_ratings`: Kullanıcı değerlendirmeleri

### İndeksler
- Full-text search (Türkçe)
- Performans optimizasyonu
- Kategori ve konum filtreleme

## 🚀 Geliştirme Roadmap

### Aşama 1 - MVP ✅
- [x] Kullanıcı kayıt/giriş
- [x] İlan oluşturma/yönetme
- [x] Temel arama ve filtreleme
- [x] Birebir eşleşme

### Aşama 2 - AI Eşleşme (6. ay)
- [ ] Gelişmiş AI algoritması
- [ ] Zincirleme takas
- [ ] Benzer eşleşme önerileri
- [ ] "Benim İçin Bul" modu

### Aşama 3 - Marketplace (9. ay)
- [ ] Premium üyelik
- [ ] İlan öne çıkarma
- [ ] Reklam sistemi
- [ ] Kargo entegrasyonu

### Aşama 4 - Hizmet Takası (12. ay)
- [ ] Hizmet kategorisi
- [ ] Sepet mantığı
- [ ] Çoklu takas
- [ ] Mobil uygulama

## 💰 Gelir Modeli

1. **Öne Çıkan İlanlar**: 20₺/hafta
2. **Premium Üyelik**: 50-100₺/ay
3. **Kurumsal İlanlar**: Kurumsal paket
4. **Mikro İşlemler**: Hızlı takas (5-10₺)
5. **Kargo & Escrow**: Gelir payı
6. **Reklam Alanları**: Kategori sponsorluğu

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Proje**: Tradagora
- **Ekip**: Tradagora Team
- **Email**: info@tradagora.com

---

**Tradagora** - Her Şeyin Takas Pazarı 🚀
