# 🚀 NexLevel Speech - Complete Setup Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- ElevenLabs API Key (for voice cloning)
- SQLite (built-in, no setup needed)

---

## Step 1: Get ElevenLabs API Key

1. Go to https://elevenlabs.io
2. Create an account
3. Go to Settings → API Keys
4. Copy your API key
5. Keep it safe (you'll use it in `.env`)

---

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
cd backend
npm install
```

### 2.2 Configure Environment
Edit `backend/.env`:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# ElevenLabs (IMPORTANT - Get from https://elevenlabs.io/api)
ELEVENLABS_API_KEY="sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
ELEVENLABS_API_URL="https://api.elevenlabs.io/v1"

# Frontend URL for CORS
FRONTEND_URL="http://localhost:3000"

# Server
PORT=3001
NODE_ENV="development"
```

### 2.3 Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Create database and tables
npx prisma db push

# Seed with test user and plans
npx ts-node prisma/seed.ts
```

You should see:
```
🌱 Seeding database...
✅ Created 4 plans
✅ Created test user: test@example.com
🎉 Database seeding completed!
```

### 2.4 Start Backend
```bash
npm run start:dev
```

Wait for:
```
🚀 NexLevel Speech API running on: http://localhost:3001
```

---

## Step 3: Frontend Setup

### 3.1 Install Dependencies
```bash
cd frontend
npm install
```

### 3.2 Configure Environment
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3.3 Start Frontend
```bash
npm run dev
```

Wait for:
```
▲ Next.js 16.1.6
Local:        http://localhost:3000
```

---

## Step 4: Test Everything

### 4.1 Test Demo (No Login Required)
1. Go to http://localhost:3000
2. Scroll to "Experience Real-Time Generation"
3. Type text and click "Generate Speech"
4. Should hear audio 🎉

### 4.2 Test Signup
1. Click "Get Started"
2. Create an account with any email/password
3. Should redirect to dashboard

### 4.3 Test Login
1. Click "Sign In"
2. Use test credentials:
   - Email: `test@example.com`
   - Password: `Test123456`
3. Should redirect to dashboard ✅

### 4.4 Test Voice Cloning
1. Log in (or use test account)
2. Go to "Clone Voice"
3. Upload 2-5 audio samples (MP3/WAV, 30+ seconds total)
4. Click "Clone Voice"
5. Wait for processing
6. Voice should appear in your voice library 🎤

### 4.5 Test Text-to-Speech
1. Log in
2. Go to "Generate"
3. Select a voice (cloned or demo)
4. Type text
5. Click "Generate Speech"
6. Listen to output ✅

---

## API Endpoints

### Public Endpoints (No Auth Required)
```
POST /api/demo/generate           - Generate demo TTS (500 chars max, no signup)
```

### Authentication
```
POST /api/auth/signup              - Create new account
POST /api/auth/login               - Login
POST /api/auth/refresh             - Refresh token
GET  /api/auth/me                  - Get current user (JWT required)
```

### Voice Management
```
POST /api/voice/clone              - Clone a voice (upload samples)
GET  /api/voice/list               - List user's voices
GET  /api/voice/:id                - Get voice details
DELETE /api/voice/:id              - Delete a voice
```

### Text-to-Speech
```
POST /api/tts/generate             - Generate speech from text
GET  /api/tts/history              - Get generation history
GET  /api/tts/download/:id         - Download audio file
```

### User
```
GET  /api/user/profile             - Get user profile
PATCH /api/user/profile            - Update profile
GET  /api/user/credits             - Get credit usage
```

---

## Troubleshooting

### Backend won't start
```bash
# Clear cache and reinstall
cd backend
rm -rf node_modules dist
npm install
npm run start:dev
```

### Database errors
```bash
# Reset database
npx prisma migrate reset
npx ts-node prisma/seed.ts
```

### ElevenLabs errors
- Verify API key in `.env` is correct
- Check API key has sufficient credits
- Ensure internet connection is active

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local` is correct
- Check CORS is enabled in backend
- Clear browser cache: `Ctrl+Shift+Del`

### Test user can't login
- Verify database was seeded: `npx ts-node prisma/seed.ts`
- Check `.env` has correct DATABASE_URL
- Restart backend after seeding

---

## Production Deployment

### Build Backend
```bash
cd backend
npm run build
npm start  # Or use PM2
```

### Build Frontend
```bash
cd frontend
npm run build
npm start  # Or use Vercel, Netlify
```

### Environment Variables (Production)
- Change `JWT_SECRET` to a strong random string
- Set real `ELEVENLABS_API_KEY`
- Update `FRONTEND_URL` to production domain
- Use production database (PostgreSQL recommended)
- Enable HTTPS

---

## Support

For issues:
1. Check this guide's Troubleshooting section
2. Check backend logs: `npm run start:dev`
3. Check browser console: `F12 → Console`
4. Check network requests: `F12 → Network`

---

**You're all set! 🎉 Start building amazing voice content!**
