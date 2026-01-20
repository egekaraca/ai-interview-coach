# AI Interview Coach

An AI-powered interview practice platform that provides real-time feedback on body language, speech, and answer quality using computer vision and AI.

## 🎯 Features

- **Real-Time Body Language Analysis**
  - Eye contact tracking
  - Posture detection
  - Fidgeting and gesture analysis

- **Speech Analysis**
  - Automatic transcription using OpenAI Whisper
  - Filler word detection ("um", "uh", "like")
  - Speaking pace analysis

- **AI-Powered Feedback**
  - Answer quality evaluation using Claude AI
  - STAR format detection
  - Personalized improvement suggestions

- **Progress Tracking**
  - Dashboard with performance metrics
  - Improvement trends over time
  - Session history and reports

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **MediaPipe** - Face and pose detection
- **OpenAI Whisper** - Speech-to-text
- **Anthropic Claude** - AI evaluation
- **SQLite** - Database (PostgreSQL for production)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Data fetching
- **React Router** - Navigation
- **MediaPipe (Browser)** - Client-side face detection

## 📁 Project Structure

```
ai-interview-coach/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # API endpoints
│   │   ├── analyzers/           # Analysis logic
│   │   ├── database/            # Models and DB config
│   │   └── utils/               # Helper functions
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   └── services/            # API services
│   └── package.json
└── data/
    ├── videos/                  # Interview recordings
    └── reports/                 # Generated reports
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create .env file:
```bash
cp .env.example .env
```

5. Add your Anthropic API key to .env:
```
ANTHROPIC_API_KEY=your_api_key_here
```

6. Run the server:
```bash
cd app
python -m uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📅 Development Roadmap

### Sprint 1: Foundation (Days 1-5) ✅ DONE
- [x] Project structure
- [x] Backend API setup
- [x] Frontend React setup
- [x] Database models
- [ ] Video recording
- [ ] Face detection integration

### Sprint 2: Analysis (Days 6-10)
- [ ] Eye contact tracking
- [ ] Posture analysis
- [ ] Speech-to-text integration
- [ ] Filler word detection
- [ ] Claude AI integration

### Sprint 3: Reports (Days 11-15)
- [ ] Report generation
- [ ] Dashboard with charts
- [ ] PDF export
- [ ] Progress tracking

### Sprint 4: Deployment (Days 16-20)
- [ ] Docker setup
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Documentation
- [ ] Demo video

## 🔑 Getting Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up (get $5 free credit)
3. Navigate to "API Keys"
4. Create new key
5. Add to `.env` file

## 📊 Database Schema

### InterviewSession
- Stores overall interview data
- Tracks scores and metrics
- Links to video recordings

### Question
- Interview question bank
- Categorized by type and difficulty

### InterviewAnswer
- Individual answers within sessions
- Detailed metrics per answer

### UserProgress
- Long-term progress tracking
- Improvement metrics

## 🧪 Testing the API

Once backend is running, visit:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

## 📝 API Endpoints

### Interviews
- `POST /api/interviews/start` - Start new session
- `GET /api/interviews/{id}` - Get session details
- `GET /api/interviews/` - List all sessions
- `POST /api/interviews/{id}/upload-video` - Upload video
- `POST /api/interviews/{id}/complete` - Complete session

### Analysis
- `POST /api/analysis/analyze` - Analyze session
- `GET /api/analysis/real-time/{id}` - Real-time metrics

### Reports
- `GET /api/reports/{id}` - Get detailed report
- `GET /api/reports/{id}/pdf` - Download PDF
- `GET /api/reports/progress/summary` - Progress summary

## 🎨 UI Screenshots

(Will be added as development progresses)

## 🤝 Contributing

This is a personal portfolio project, but suggestions are welcome!

## 📄 License

MIT License - feel free to use for your own learning

## 👤 Author

Your Name
- Portfolio: (link)
- LinkedIn: (link)
- GitHub: (link)

## 🙏 Acknowledgments

- MediaPipe by Google
- Anthropic Claude API
- OpenAI Whisper
- FastAPI community

---

**Status**: 🚧 In Development (Day 1/20 Complete)
**Next**: Implement video recording and face detection
