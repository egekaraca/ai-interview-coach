#!/bin/bash

echo "🚀 AI Interview Coach - Setup Script"
echo "===================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | grep -oP '3\.\d+')
if [[ $(echo "$python_version >= 3.11" | bc) -eq 1 ]]; then
    echo "✅ Python $python_version installed"
else
    echo "❌ Python 3.11+ required"
    exit 1
fi

# Check Node version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo "✅ Node.js $node_version installed"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo ""
echo "Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please add your ANTHROPIC_API_KEY to backend/.env"
fi

echo ""
echo "Setting up frontend..."
cd ../frontend

# Install Node dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Anthropic API key to backend/.env"
echo "2. Start backend: cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload"
echo "3. Start frontend: cd frontend && npm run dev"
echo ""
echo "Backend will run on: http://localhost:8000"
echo "Frontend will run on: http://localhost:5173"
