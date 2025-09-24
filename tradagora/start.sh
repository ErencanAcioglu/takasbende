#!/bin/bash

# Tradagora Start Script
echo "🔄 Tradagora - Her Şeyin Takas Pazarı"
echo "======================================"

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env dosyası bulunamadı!"
    echo "📝 Lütfen backend/env.example dosyasını .env olarak kopyalayın ve gerekli değerleri doldurun."
    echo "   cp backend/env.example backend/.env"
    exit 1
fi

# Start backend
echo "🚀 Backend başlatılıyor..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Frontend başlatılıyor..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Tradagora başarıyla başlatıldı!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📊 API Health: http://localhost:5000/api/health"
echo ""
echo "🛑 Durdurmak için Ctrl+C tuşlayın"

# Wait for user to stop
wait

# Cleanup on exit
echo "🛑 Tradagora durduruluyor..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "✅ Tradagora durduruldu."
