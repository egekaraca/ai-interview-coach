# 🚀 Quick Start Guide

## What's Fixed in This Version
- ✅ Fixed `app` naming conflict (now uses `backend_app`)
- ✅ All imports corrected
- ✅ Should work without issues!

## Prerequisites
- Python 3.11 (NOT 3.13!)
- Node.js 18+
- Terminal/Command Line

---

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment with Python 3.11
python3.11 -m venv .venv

# Activate it
# On Mac/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# (Optional) Add your Anthropic API key to .env later
```

### 2. Start Backend

```bash
# Make sure you're in backend directory and venv is activated
python -m uvicorn backend_app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

✅ **Test it:** Open http://localhost:8000/api/health in your browser

---

### 3. Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
```

### 4. Start Frontend

```bash
# Make sure you're in frontend directory
npm run dev
```

You should see:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

✅ **Test it:** Open http://localhost:5173 in your browser

---

## 🎉 Success!

If both servers are running, you should see:
- **Backend:** http://localhost:8000/docs (API documentation)
- **Frontend:** http://localhost:5173 (React app)

Try clicking "Start Interview" on the home page!

---

## Common Issues

### Issue 1: "ModuleNotFoundError: No module named 'backend_app'"
**Solution:** Make sure you're running from the `backend` directory:
```bash
cd backend
python -m uvicorn backend_app.main:app --reload
```

### Issue 2: "Command not found: python3.11"
**Solution:** Install Python 3.11:
```bash
# Mac (with Homebrew)
brew install python@3.11

# Check version
python3.11 --version
```

### Issue 3: Frontend won't connect to backend
**Solution:** Make sure both servers are running in separate terminals!

---

## Next Steps

Once everything is running:
1. ✅ Browse the code in your editor
2. ✅ Read the API docs at http://localhost:8000/docs
3. ✅ Try creating an interview session
4. ✅ Get ready for Day 2: Video recording!

---

## File Structure

```
ai-interview-coach/
├── backend/
│   ├── backend_app/        ← Changed from 'app' to avoid conflicts!
│   │   ├── api/routes/
│   │   ├── database/
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── package.json
└── data/
```

---

**Ready for Day 2?** 🎯

Tomorrow we'll add webcam recording and face detection!
