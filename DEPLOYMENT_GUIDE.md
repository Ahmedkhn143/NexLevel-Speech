# 🔧 NexLevel Speech - Troubleshooting & Deployment Guide

## Quick Checklist

- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed: `cd backend && npm install`
- [ ] Frontend dependencies installed: `cd frontend && npm install`
- [ ] ElevenLabs API key obtained
- [ ] Backend `.env` configured with API key
- [ ] Database seeded: `npx ts-node prisma/seed.ts`
- [ ] Both servers running (backend on 3001, frontend on 3000)

---

## Common Issues & Solutions

### Issue 1: "Invalid email or password" when logging in

**Cause:** Test user doesn't exist in database

**Solution:**
```bash
cd backend
npx ts-node prisma/seed.ts
```

Then login with:
- Email: `test@example.com`
- Password: `Test123456`

---

### Issue 2: "Server unavailable. Demo mode active"

**Cause:** Backend is not running

**Solution:**
```bash
cd backend
npm run start:dev
```

Wait for: `🚀 NexLevel Speech API running on: http://localhost:3001`

Then refresh frontend page at http://localhost:3000

---

### Issue 3: Backend won't start - Database errors

**Cause:** Database not initialized or corrupted

**Solution:**
```bash
cd backend

# Reset database completely
npx prisma migrate reset

# Or if that doesn't work, delete and recreate:
rm dev.db dev.db-journal

# Push schema
npx prisma db push

# Seed with test data
npx ts-node prisma/seed.ts
```

---

### Issue 4: ElevenLabs errors when cloning voice

**Cause:** API key missing, invalid, or out of credits

**Solution:**
1. Verify API key in `backend/.env`:
```bash
echo $ELEVENLABS_API_KEY  # Should show your key
```

2. Test API key directly:
```bash
curl -X GET "https://api.elevenlabs.io/v1/voices" \
  -H "xi-api-key: YOUR_API_KEY_HERE"
```

3. Check ElevenLabs account:
   - Visit https://elevenlabs.io/profile
   - Verify you have credits
   - Check API key is active

---

### Issue 5: CORS errors when frontend calls backend

**Cause:** Backend CORS not configured correctly

**Solution:**
1. Verify `backend/.env` has:
```env
FRONTEND_URL=http://localhost:3000
```

2. Restart backend:
```bash
npm run start:dev
```

---

### Issue 6: Audio files not generating

**Cause:** TTS service failing, API key issue, or backend error

**Solution:**
1. Check backend logs for errors
2. Verify ElevenLabs API key is valid
3. Test with demo endpoint:
```bash
curl -X POST http://localhost:3001/api/demo/generate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","voiceId":"sarah","lang":"en"}' \
  --output test.mp3
```

---

## Testing APIs Manually

### Test Demo (No Auth)
```bash
curl -X POST http://localhost:3001/api/demo/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Experience the next generation of AI voice cloning",
    "voiceId": "sarah",
    "lang": "en"
  }' \
  --output demo.mp3
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Test Get Profile (with token)
```bash
# First get token from login response
TOKEN="your_access_token_here"

curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Run Test Script
```bash
# PowerShell
./test-api.ps1

# Bash
bash test-api.sh
```

---

## Deployment to Production

### Prerequisites
- Production server/hosting
- PostgreSQL database (instead of SQLite)
- SSL certificate
- Domain name

### 1. Prepare Environment

Create `backend/.env.production`:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://user:password@host:5432/nexlevel"

JWT_SECRET="generate-strong-random-secret-key"
JWT_REFRESH_SECRET="generate-strong-random-refresh-key"

ELEVENLABS_API_KEY="your-api-key"
ELEVENLABS_API_URL="https://api.elevenlabs.io/v1"

FRONTEND_URL="https://yourdomain.com"

# Optional
GOOGLE_CLIENT_ID="your-google-oauth-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-secret"
```

### 2. Build Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

### 3. Start Backend
```bash
# Using Node
node dist/main.js

# Or using PM2 (recommended)
npm install -g pm2
pm2 start dist/main.js --name "nexlevel-api"
pm2 save
```

### 4. Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 5. Deploy Frontend
**Option A: Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

**Option B: Self-hosted**
```bash
npm start
```

**Option C: Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Connection "upgrade";
    }
}
```

### 6. SSL Certificate
```bash
# Using Let's Encrypt
certbot certonly --standalone -d yourdomain.com
```

---

## Performance Optimization

### Backend
- Use Redis for caching
- Enable gzip compression
- Use database connection pooling
- Add rate limiting

### Frontend
- Enable Next.js image optimization
- Use CDN for static assets
- Enable service worker (PWA)
- Optimize bundle size

---

## Monitoring & Logging

### Backend Logs
```bash
# View real-time logs
npm run start:dev 2>&1 | tee logs.txt

# With PM2
pm2 logs nexlevel-api
```

### Database
```bash
# Check database
npx prisma studio

# Or use database client
sqlite3 dev.db
```

### Frontend
- Browser DevTools: F12
- Network tab: Check all API calls
- Console tab: Check for errors
- Performance tab: Check load times

---

## Support & Troubleshooting

1. **Check logs first** - Most issues are logged
2. **Test API directly** - Use curl/Postman
3. **Clear cache** - Browser cache, node_modules
4. **Restart services** - Often fixes issues
5. **Check environment variables** - Most common cause of issues

---

## Useful Commands

```bash
# Backend
cd backend
npm install                          # Install dependencies
npm run start:dev                    # Start development server
npm run build                        # Build for production
npm run test                         # Run tests
npx prisma studio                    # Open database GUI
npx prisma db push                   # Sync database schema
npx ts-node prisma/seed.ts          # Seed database

# Frontend
cd frontend
npm install                          # Install dependencies
npm run dev                          # Start development server
npm run build                        # Build for production
npm start                            # Start production server
npm run lint                         # Run linter

# Database
npx prisma migrate reset             # Reset database
npx prisma generate                  # Generate Prisma client
npx prisma db push                   # Sync schema
```

---

**Still having issues? Check the SETUP_COMPLETE.md guide or enable debug logging:**

```bash
DEBUG=* npm run start:dev
```
