# ⚡ Quick Start - PharmaGuard

## 🚀 Fastest Way to Run Locally

### Option 1: Using Batch Scripts (Windows)

1. **Start Backend:**
   - Double-click `START_BACKEND.bat`
   - Wait for: `Uvicorn running on http://127.0.0.1:8000`

2. **Start Frontend** (in a new window):
   - Double-click `START_FRONTEND.bat`
   - Wait for: `Local: http://localhost:5173/`

3. **Open Browser:**
   - Go to: `http://localhost:5173`

### Option 2: Manual Commands

**Terminal 1 - Backend:**
```bash
cd pharmaguard_backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd pharmaguard_frontend
npm install
npm run dev
```

**Then open:** `http://localhost:5173`

---

## ✅ Verify It's Working

1. **Backend Health Check:**
   - Open: `http://127.0.0.1:8000/health`
   - Should see: `{"status":"ok","env":"development"}`

2. **Frontend:**
   - Open: `http://localhost:5173`
   - Should see PharmaGuard dashboard

3. **Test Analysis:**
   - Upload: `pharmaguard_backend/sample_data/sample.vcf`
   - Enter drug: `clopidogrel`
   - Click "Analyze Pharmacogenomic Risk"
   - Should see results appear!

---

## 🐛 Quick Troubleshooting

**Backend won't start?**
- Check Python 3.11+ is installed: `python --version`
- Activate venv: `.venv\Scripts\activate`
- Install deps: `pip install -r requirements.txt`

**Frontend won't start?**
- Check Node.js: `node --version` (need 18+)
- Install deps: `npm install`
- Check `.env` exists with: `VITE_API_BASE_URL=http://localhost:8000`

**CORS errors?**
- Make sure backend is running first
- Check `.env` has correct backend URL
- Restart frontend after changing `.env`

---

For detailed instructions, see `LOCAL_DEVELOPMENT.md`
