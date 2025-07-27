# Isaac Mineo - Personal Portfolio

A modern, professional portfolio website showcasing my full-stack development skills, AI integration expertise, and featured projects.

## 🚀 Project Structure

```
isaac-mineo/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets (resume, transcript)
│   ├── package.json   # Frontend dependencies
│   └── vite.config.js # Vite configuration
├── backend/           # Future backend API (if needed)
└── README.md          # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Custom animations** - Smooth, professional interactions

### Deployment
- **Frontend**: Vercel (static hosting)
- **Backend**: Render (when needed)

## 🏃‍♂️ Quick Start

### Smart Start (Recommended)
```bash
./start.sh
```
This intelligent script will:
- ✅ Start the frontend on `http://localhost:5174`
- ✅ Start the backend on `http://localhost:8000` (if configured)
- ✅ Handle dependencies automatically
- ✅ Gracefully skip backend if not ready
- ✅ Clean shutdown with Ctrl+C

### Manual Development
```bash
# Frontend only
./dev.sh
# OR
cd frontend && npm run dev

# Backend setup (when ready)
cd backend && ./setup.sh
```

### Backend Setup (Optional)
```bash
cd backend
./setup.sh        # Set up FastAPI backend structure
../start.sh       # Start both frontend and backend
```

## 📱 Features

- **Password Protection** - Secure access to portfolio content
- **Interactive Resume Viewer** - Built-in PDF viewer for documents
- **Responsive Design** - Optimized for all devices
- **Smooth Animations** - Professional micro-interactions
- **SEO Optimized** - Proper meta tags and structured data

## 🎯 Key Sections

1. **About Me** - Personal story and technical expertise
2. **Featured Projects** - Detailed project showcases including Nutrivize
3. **Resume & Credentials** - Interactive document viewer
4. **Contact** - Professional contact information

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Environment Variables
Create `.env.local` in the frontend directory:
```
VITE_SITE_PASSWORD=your_access_password
```

## 📄 Documents

- Resume: `frontend/public/IsaacMineo_Resume.pdf`
- Transcript: `frontend/public/Mineo, Isaac, Transcript.pdf`

## 🔮 Future Enhancements

- [ ] Backend API for contact form
- [ ] Analytics integration
- [ ] Blog section
- [ ] Project case studies
- [ ] AI-powered chat widget

## 📧 Contact

**Isaac Mineo**
- Email: isaac@isaacmineo.com
- GitHub: [@GoldenRodger5](https://github.com/GoldenRodger5)
- LinkedIn: [/in/isaacmineo](https://linkedin.com/in/isaacmineo)

---

*Built with ❤️ and modern web technologies*
Personal Website
