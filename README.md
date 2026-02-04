# NexLevel Speech - AI Voice Cloning & Text-to-Speech

A full-stack SaaS application for AI-powered voice cloning and text-to-speech generation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Running

1. **Clone the repository**

2. **Backend Setup**
```bash
cd backend
npm install

# Generate Prisma client and create database
npx prisma generate
npx prisma db push

# Seed the database with plans
npx ts-node prisma/seed.ts

# Start the backend server
npm run start:dev
```

Backend will be running at: **http://localhost:3001**

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend will be running at: **http://localhost:3000**

## 🔗 Links

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |

## 📱 Features

- ✅ **User Authentication** - Signup, Login, JWT-based auth
- ✅ **Dashboard** - Protected route with user stats
- ✅ **Demo TTS** - Interactive text-to-speech demo on landing page
- ✅ **Voice Cloning** - Upload samples to create AI voice clones
- ✅ **Speech Generation** - Generate speech from text using cloned voices
- ✅ **Subscription Plans** - Free trial with paid tiers
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop

## 🔐 Test Credentials

Create a new account via signup, or use:
- Email: test@example.com
- Password: Test123456

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Zustand (state management)

**Backend:**
- NestJS 11
- TypeScript
- Prisma ORM
- SQLite (development) / PostgreSQL (production)
- JWT Authentication
- ElevenLabs API (for TTS)

## 📁 Project Structure

```
├── frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   ├── lib/       # API utilities
│   │   └── stores/    # Zustand stores
│   └── public/        # Static assets
│
├── backend/           # NestJS backend
│   ├── src/
│   │   ├── modules/   # Feature modules (auth, tts, etc.)
│   │   ├── prisma/    # Prisma service
│   │   └── common/    # Guards, decorators, filters
│   └── prisma/        # Schema and migrations
│
└── deploy/            # Kubernetes configs
```

## ⚙️ Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
ELEVENLABS_API_KEY="your-elevenlabs-api-key"  # Optional for demo
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📝 API Endpoints

### Auth
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Demo
- `POST /api/demo/generate` - Generate demo TTS (no auth required)

### Voice
- `POST /api/voice/clone` - Clone a voice
- `GET /api/voice/list` - List user's voices
- `DELETE /api/voice/:id` - Delete a voice

### TTS
- `POST /api/tts/generate` - Generate speech
- `GET /api/tts/history` - Get generation history

### Payments
- `GET /api/payments/plans` - Get subscription plans
- `POST /api/payments/create` - Create payment

## 🎨 UI Pages

- `/` - Landing page with demo
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - User dashboard
- `/dashboard/generate` - Generate speech
- `/dashboard/voices` - Manage voices
- `/dashboard/billing` - Subscription & billing

## 📜 License

MIT
