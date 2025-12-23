# 🚀 ASPERA Platform - Startup Guide

Quick guide to start the ASPERA AI-Powered Due Diligence Platform.

## 📋 Prerequisites

Before running the startup scripts, ensure you have:

- ✅ **Node.js 18.x or higher** ([Download](https://nodejs.org/))
- ✅ **Python 3.8 or higher** ([Download](https://www.python.org/))
- ✅ **Git** (optional, for Git Bash on Windows)

## 🎯 Quick Start

### Windows Users (Recommended)

#### Option 1: PowerShell (Easiest)

```powershell
# Navigate to project directory
cd D:\Downloads\Code_Autonomous\AWS

# Run the startup script
.\start.ps1
```

#### Option 2: Git Bash

```bash
# Navigate to project directory
cd /d/Downloads/Code_Autonomous/AWS

# Make script executable
chmod +x start.sh

# Run the startup script
./start.sh
```

### Linux/Mac Users

```bash
# Navigate to project directory
cd ~/path/to/AWS

# Make script executable
chmod +x start.sh

# Run the startup script
./start.sh
```

## 📁 Available Scripts

### Main Startup Scripts

| Script | Description | Use Case |
|--------|-------------|----------|
| `start.ps1` | PowerShell startup script | Windows (PowerShell) |
| `start.sh` | Bash startup script | Windows (Git Bash), Linux, Mac |

**Features:**
- ✅ Checks all prerequisites (Node.js, Python, npm, pip)
- ✅ Creates/activates Python virtual environment
- ✅ Installs Python dependencies
- ✅ Installs frontend dependencies
- ✅ Interactive menu to start frontend or view backend info

### Quick Frontend Scripts

| Script | Description | Use Case |
|--------|-------------|----------|
| `start-frontend.ps1` | Quick frontend start (PowerShell) | Windows - Frontend only |
| `start-frontend.sh` | Quick frontend start (Bash) | Git Bash/Linux/Mac - Frontend only |

**Features:**
- ⚡ Skips backend setup
- ⚡ Directly starts Next.js dev server
- ⚡ Faster for frontend-only development

## 🎬 What the Scripts Do

### Step 1: Prerequisites Check ✓

The scripts verify:
- Node.js installation
- npm installation
- Python installation
- pip installation

### Step 2: Python Environment Setup 🐍

- Creates Python virtual environment (if not exists)
- Activates virtual environment
- Upgrades pip
- Installs all Python dependencies from `requirements.txt`

### Step 3: Frontend Setup ⚛️

- Checks for `node_modules`
- Installs frontend dependencies if needed
- Prepares Next.js application

### Step 4: Interactive Menu 📋

Choose from:
1. **Frontend only** - Start Next.js dev server (recommended)
2. **Backend info** - View AWS deployment information
3. **Exit** - Close the script

## 🌐 Accessing the Application

### Frontend (Landing Page & Dashboard)

Once started, the frontend is available at:

**URL:** http://localhost:3000

**Pages:**
- Landing Page: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard

### Development Server

The Next.js development server provides:
- 🔥 Hot module replacement (HMR)
- ⚡ Fast refresh
- 🐛 Error overlay
- 📝 TypeScript checking

## 🛠️ Backend Development

The ASPERA backend is designed for **AWS serverless infrastructure**:

- **Lambda Functions** - Agent execution
- **Step Functions** - Workflow orchestration
- **S3** - Document storage
- **OpenSearch** - Vector search
- **Bedrock** - AI models (Claude 3.5 Sonnet)

### Local Backend Development Options

#### Option 1: Frontend with Mock Data (Easiest)

```powershell
# Just run the frontend
.\start-frontend.ps1
```

The frontend is configured with mock data and works independently.

#### Option 2: AWS SAM Local

```bash
# Install AWS SAM CLI
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

# Start local API
cd infrastructure
sam local start-api
```

#### Option 3: LocalStack (Docker)

```bash
# Install Docker Desktop
# Install LocalStack

docker-compose up localstack
```

#### Option 4: Deploy to AWS

```bash
cd infrastructure
sam deploy --guided
```

## 🐛 Troubleshooting

### Script Permission Issues (Windows PowerShell)

If you get "cannot be loaded because running scripts is disabled":

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again
.\start.ps1
```

### Script Permission Issues (Git Bash/Linux)

```bash
# Make scripts executable
chmod +x start.sh
chmod +x start-frontend.sh
```

### Port Already in Use

If port 3000 is already in use:

```powershell
# Kill process on port 3000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use a different port
cd frontend
npm run dev -- -p 3001
```

### Python Virtual Environment Issues

```powershell
# Delete and recreate venv
Remove-Item -Recurse -Force venv
python -m venv venv

# Run startup script again
.\start.ps1
```

### Node Modules Issues

```powershell
# Delete and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Python Package Installation Errors

If you encounter package installation errors:

```powershell
# Activate venv
.\venv\Scripts\Activate.ps1

# Update pip
python -m pip install --upgrade pip

# Install packages one by one to identify issues
python -m pip install boto3
python -m pip install langchain
# ... etc
```

## 📊 Startup Script Output

### Successful Startup

```
================================
   ASPERA Platform Startup
================================

Checking prerequisites...

✓ Node.js v18.17.0
✓ npm 9.6.7
✓ Python 3.11.4
✓ pip installed

Setting up Python virtual environment...

ℹ Activating virtual environment...
✓ Virtual environment activated
ℹ Installing Python dependencies...
✓ Python dependencies installed

Setting up frontend...

✓ Frontend dependencies already installed

================================
   Setup Complete!
================================

Choose how to start:

1. Frontend only (recommended for development)
2. View backend information
3. Exit

Enter your choice (1-3):
```

## 🎯 Common Workflows

### Daily Development (Frontend Only)

```powershell
# Quick start
.\start-frontend.ps1

# Opens http://localhost:3000 automatically
```

### Full Stack Development

```powershell
# Terminal 1: Frontend
.\start-frontend.ps1

# Terminal 2: Backend (if using SAM local)
cd infrastructure
sam local start-api
```

### Testing Changes

```powershell
# Frontend
cd frontend
npm run build
npm start

# Run tests
npm test
```

## 📝 Environment Variables

For backend integration, create `.env.local` in the frontend directory:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://your-api-gateway.amazonaws.com/prod
NEXT_PUBLIC_S3_BUCKET=aspera-documents
NEXT_PUBLIC_REGION=us-east-1
```

## 🔄 Updating Dependencies

### Frontend

```powershell
cd frontend
npm update
```

### Backend

```powershell
# Activate venv first
.\venv\Scripts\Activate.ps1

# Update packages
python -m pip install --upgrade -r requirements.txt
```

## 📚 Additional Resources

- **Frontend Docs:** `frontend/README.md`
- **Setup Guide:** `frontend/SETUP.md`
- **Quick Start:** `frontend/QUICKSTART.md`
- **Backend Docs:** `docs/ARCHITECTURE.md`
- **Deployment:** `docs/DEPLOYMENT.md`

## 🆘 Getting Help

If the startup scripts don't work:

1. **Check Prerequisites:** Ensure Node.js and Python are in PATH
2. **Review Errors:** Read error messages carefully
3. **Check Logs:** Look in terminal output for specific errors
4. **Manual Setup:** Follow `frontend/SETUP.md` for manual installation
5. **Clean Install:** Delete `venv`, `node_modules`, and try again

## ✨ What's Next?

After successful startup:

1. ✅ Browse http://localhost:3000 - Landing page
2. ✅ Check http://localhost:3000/dashboard - Dashboard
3. ✅ Review the UI components
4. ✅ Start customizing for your needs
5. ✅ Connect to AWS backend when ready

---

**Happy developing! 🚀**

For questions or issues, refer to the documentation in the `docs/` folder.
