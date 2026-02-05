# 🎯 NexLevel Speech - Complete Quick Reference Guide

## 🏃 Quick Start (Choose Your OS)

### Windows Users 🪟
```powershell
# 1. Open PowerShell in project folder
cd "C:\path\to\Voice Clone"

# 2. Run setup
.\setup.ps1

# 3. Wait for completion, then:

# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# 4. Open http://localhost:3000
```

### macOS/Linux Users 🐧
```bash
# 1. Open terminal in project folder
cd /path/to/Voice Clone

# 2. Run setup
chmod +x setup.sh
./setup.sh

# 3. Wait for completion, then:

# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# 4. Open http://localhost:3000
```

---

## 📊 What Runs Where

```
Browser (http://localhost:3000)
    ↓
Frontend (Next.js, Port 3000)
    ↓
Backend API (NestJS, Port 3001)
    ↓
Database (SQLite, file: ./dev.db)
    ↓
ElevenLabs API (Voice Cloning)
```

---

## 🔑 Test Credentials

```
Email:    test@example.com
Password: Test123456
```

---

## 🎯 What to Test

| Feature | How to Test | Expected Result |
|---------|------------|-----------------|
| **Demo Voice** | Click "Try Live Demo" on homepage | Generates audio |
| **Sign Up** | Click "Get Started" | Creates account |
| **Login** | Use test@example.com | Redirects to dashboard |
| **Voice Clone** | Upload 2-5 audio samples | Voice appears in library |
| **Generate Speech** | Type text and click generate | Downloads audio file |
| **Dashboard** | View after login | Shows statistics |

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="file:./dev.db"
ELEVENLABS_API_KEY="sk_xxxxxxxxxxxxx"  ← Get from https://elevenlabs.io
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📱 URLs & Ports

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| API Demo | http://localhost:3001/api/demo/generate |
| Database GUI | `npx prisma studio` |

---

## 🧪 Test Commands

### Test API Endpoints
```bash
# Windows
.\test-api.ps1

# macOS/Linux
bash test-api.sh
```

### Test Demo Endpoint
```bash
curl -X POST http://localhost:3001/api/demo/generate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","voiceId":"sarah","lang":"en"}'
```

### View Database
```bash
cd backend
npx prisma studio
```

---

## 📚 Help Files

| Document | Read When |
|----------|-----------|
| `README.md` | Want overview |
| `SETUP_COMPLETE.md` | Need setup help |
| `DEPLOYMENT_GUIDE.md` | Deploying to production |
| `PROJECT_STATUS.md` | Want status summary |
| `ARCHITECTURE.md` | Understanding system |

---

## 🆘 Quick Troubleshooting

### "Invalid email or password"
```bash
cd backend
npx ts-node prisma/seed.ts
```

### "Server unavailable"
- Check backend is running: `npm run start:dev`
- Try port 3001: http://localhost:3001

### Backend won't start
```bash
cd backend
npm install
npx prisma db push
npm run start:dev
```

### Frontend won't load
```bash
cd frontend
npm install
npm run dev
```

---

## ✨ Features Checklist

- ✅ User Authentication (Signup/Login)
- ✅ Demo Voice Generation (No login needed)
- ✅ Voice Cloning (Upload samples)
- ✅ Speech Generation (With cloned voice)
- ✅ User Dashboard
- ✅ Subscription Plans
- ✅ Credit System
- ✅ Audio Download
- ✅ Mobile Responsive
- ✅ Beautiful UI/UX

---

## 🚀 Deployment Quick Links

- **Vercel** (Frontend): https://vercel.com
- **Render** (Backend): https://render.com
- **Railway** (Backend): https://railway.app
- **Heroku** (Backend): https://www.heroku.com

---

## 🔗 Important Links

- **ElevenLabs API Key**: https://elevenlabs.io/profile
- **Node.js Download**: https://nodejs.org
- **NPM Registry**: https://www.npmjs.com

---

## 💡 Pro Tips

1. **Use Multiple Terminals** - One for backend, one for frontend
2. **Check Logs** - Read terminal output for errors
3. **Clear Cache** - Ctrl+Shift+Del if things look broken
4. **Restart Services** - Kill (Ctrl+C) and restart if stuck
5. **Check Ports** - Make sure 3000 and 3001 are free

---

## 🎓 File Structure at a Glance

```
Voice Clone/
├── backend/              # API Server
├── frontend/             # Web App
├── SETUP_COMPLETE.md     # Setup guide
├── DEPLOYMENT_GUIDE.md   # Deployment guide
├── PROJECT_STATUS.md     # Status summary
├── setup.ps1             # Windows setup script
├── setup.sh              # macOS/Linux setup script
├── test-api.ps1          # Windows API test
└── test-api.sh           # macOS/Linux API test
```

---

## ✅ Success Indicators

You're ready when:

- ✅ `npm run start:dev` runs without errors
- ✅ `npm run dev` runs without errors
- ✅ Homepage loads at http://localhost:3000
- ✅ Demo generates audio
- ✅ Can sign up with new account
- ✅ Can login with test@example.com
- ✅ Dashboard shows statistics

---

## 🎯 30-Second Version

```bash
# 1. Setup (once)
.\setup.ps1  # Windows

# 2. Run Backend (Terminal 1)
cd backend && npm run start:dev

# 3. Run Frontend (Terminal 2)
cd frontend && npm run dev

# 4. Open http://localhost:3000

# 5. Test!
```

---

## 🎉 You're Ready!

Everything is set up and ready to go!

**Just run the setup script and start the servers.**

**Questions? Check DEPLOYMENT_GUIDE.md or PROJECT_STATUS.md**

---

*Last Updated: February 5, 2026*
*Status: ✅ Complete & Production Ready*
