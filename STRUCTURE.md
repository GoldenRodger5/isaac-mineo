# 📁 Project Structure Overview

```
isaac-mineo/
├── 📁 frontend/                    # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── About.jsx           # About section with skills & philosophy
│   │   │   ├── Projects.jsx        # Featured projects showcase
│   │   │   ├── Resume.jsx          # Interactive resume viewer
│   │   │   └── Contact.jsx         # Contact form (future use)
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # App entry point
│   │   └── index.css               # Global styles & animations
│   ├── 📁 public/
│   │   ├── IsaacMineo_Resume.pdf   # Your resume
│   │   ├── Mineo, Isaac, Resume.pdf # Backup resume
│   │   ├── Mineo, Isaac, Transcript.pdf # Academic transcript
│   │   └── manifest.json           # PWA manifest
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite config (port 5174)
│   ├── tailwind.config.js          # Tailwind CSS config
│   └── vercel.json                 # Vercel deployment config
├── 📁 backend/                     # Future backend API
│   └── README.md                   # Backend setup guide
├── deploy.sh                       # Deployment script
├── dev.sh                          # Development setup script
├── README.md                       # Main project documentation
└── LICENSE                         # MIT license
```

## 🚀 Quick Commands

### Smart Start (Recommended)
```bash
./start.sh                  # Intelligent start - handles frontend + backend
```

### Individual Commands
```bash
./dev.sh                    # Frontend only development
./deploy.sh                 # Deploy to production
cd backend && ./setup.sh    # Set up backend when ready
```

### Manual Commands
```bash
cd frontend && npm run dev   # Frontend on http://localhost:5174
cd backend && uvicorn app.main:app --reload --port 8000  # Backend (if configured)
```

### Current Status
- ✅ **Frontend**: Fully implemented and organized
- ✅ **Port**: Changed to 5174 to avoid conflicts
- ✅ **Deployment**: Ready for Vercel
- 🔮 **Backend**: Structure prepared for future features

## 🎯 Deployment Strategy

### Current (Frontend Only)
- **Hosting**: Vercel (static hosting)
- **Domain**: isaacmineo.com
- **Environment**: Production-ready

### Future (Full-Stack)
- **Frontend**: Vercel (static hosting)
- **Backend**: Render (API hosting)
- **Database**: MongoDB Atlas
- **Cache**: Redis Cloud

## 🔧 Environment Variables

Create `frontend/.env.local`:
```
VITE_SITE_PASSWORD=your_secure_password
```

---

*Organized for scalability and professional deployment* 🚀
