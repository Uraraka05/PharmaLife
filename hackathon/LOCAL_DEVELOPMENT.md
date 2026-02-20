# 🚀 Local Development Guide - PharmaGuard Full Stack

This guide will help you run both the backend and frontend locally to see the fully functional website before deployment.

## 📋 Prerequisites

- **Python 3.11+** installed
- **Node.js 18+** and **npm** installed
- Two terminal windows/tabs (one for backend, one for frontend)

## 🔧 Step 1: Backend Setup

### 1.1 Navigate to Backend Directory

```bash
cd pharmaguard_backend
```

### 1.2 Create Virtual Environment (if not already created)

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 1.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 1.4 (Optional) Configure Environment Variables

Copy `.env.example` to `.env` if you want to use LLM features:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

**Note:** The backend works without LLM API keys - it will use static explanations.

### 1.5 Start Backend Server

```bash
uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **Backend is now running at:** `http://127.0.0.1:8000`

**Test backend health:**
- Open browser: `http://127.0.0.1:8000/health`
- Should see: `{"status":"ok","env":"development"}`

---

## 🎨 Step 2: Frontend Setup

### 2.1 Open a NEW Terminal Window/Tab

Keep the backend running in the first terminal.

### 2.2 Navigate to Frontend Directory

```bash
cd pharmaguard_frontend
```

### 2.3 Install Dependencies

```bash
npm install
```

**Expected output:** Packages will be installed (may take 1-2 minutes)

### 2.4 Verify Environment Configuration

Check that `.env` file exists with:

```bash
# .env should contain:
VITE_API_BASE_URL=http://localhost:8000
```

If `.env` doesn't exist, create it:

```bash
# Windows
echo VITE_API_BASE_URL=http://localhost:8000 > .env

# macOS/Linux
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

### 2.5 Start Frontend Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ **Frontend is now running at:** `http://localhost:5173`

---

## 🌐 Step 3: Access the Website

1. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

2. You should see the **PharmaGuard** dashboard with:
   - Hero header
   - File upload section
   - Drug input section
   - Analyze button

---

## 🧪 Step 4: Test the Full Flow

### 4.1 Upload Sample VCF File

1. Navigate to: `pharmaguard_backend/sample_data/sample.vcf`
2. In the browser, drag and drop this file into the upload area, OR click "browse from device"
3. You should see: ✅ File validated

### 4.2 Enter Drug Name

1. In the drug input field, type: `clopidogrel`
   - OR click one of the drug chips (CODEINE, CLOPIDOGREL, WARFARIN, etc.)
2. The drug should appear selected

### 4.3 Click "Analyze Pharmacogenomic Risk"

1. The button should be enabled (not grayed out)
2. Click it
3. You should see:
   - Loading spinner
   - Button text changes to show loading state
   - Skeleton loaders appear

### 4.4 View Results

After a few seconds, you should see:

✅ **Risk Overview Card** (color-coded by risk level)
- Risk Label (e.g., "Adjust Dosage")
- Severity
- Confidence Score
- Timestamp

✅ **Pharmacogenomic Profile Card**
- Primary Gene (e.g., CYP2C19)
- Diplotype (e.g., *1/*2)
- Phenotype (e.g., IM)
- Detected Variants list

✅ **Visualization Panel**
- Confidence Score Gauge Chart
- Risk Severity Bar
- Variant Count Pie Chart

✅ **AI Explanation Panel**
- Summary
- Biological Mechanism
- Clinical Guideline Reference

✅ **JSON Output Panel**
- Formatted JSON response
- Copy/Download buttons

---

## 🔍 Step 5: Verify Everything Works

### Check Browser Console

1. Open **Developer Tools** (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Should see **NO CORS errors**
4. Should see **NO red errors**

### Check Network Tab

1. In Developer Tools, go to **Network** tab
2. Click "Analyze" button
3. Look for request to: `http://localhost:8000/analyze`
4. Status should be: **200 OK**
5. Response should contain full JSON with risk assessment

### Test Different Drugs

Try different supported drugs:
- `codeine`
- `warfarin`
- `simvastatin`
- `azathioprine`
- `fluorouracil`

Each should map to its respective gene and show appropriate risk assessment.

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError` or import errors
```bash
# Solution: Ensure virtual environment is activated
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
# Then: pip install -r requirements.txt
```

**Problem:** Port 8000 already in use
```bash
# Solution: Kill process on port 8000 or use different port
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Or run on different port:
uvicorn app.main:app --reload --port 8001
# Then update frontend .env: VITE_API_BASE_URL=http://localhost:8001
```

**Problem:** Backend starts but `/analyze` returns 500 error
- Check backend terminal for error messages
- Verify VCF file format matches expected structure
- Check that sample.vcf exists in `sample_data/` folder

### Frontend Issues

**Problem:** `npm install` fails
```bash
# Solution: Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Frontend can't connect to backend (CORS errors)
- Verify backend is running on port 8000
- Check `.env` file has correct `VITE_API_BASE_URL`
- Restart frontend dev server after changing `.env`
- Check backend CORS configuration in `app/main.py`

**Problem:** Port 5173 already in use
```bash
# Vite will automatically use next available port (5174, 5175, etc.)
# Or specify port:
npm run dev -- --port 3000
```

**Problem:** Changes not reflecting
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Restart dev server

### Integration Issues

**Problem:** "No response from analysis service"
- Verify backend is running: `http://127.0.0.1:8000/health`
- Check `.env` file has correct backend URL
- Check browser console for network errors

**Problem:** File upload fails
- Verify file is `.vcf` format
- Check file size < 5MB
- Check backend terminal for error messages

**Problem:** Results don't display
- Check browser console for JavaScript errors
- Verify API response in Network tab
- Check that response matches expected schema

---

## 📊 Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access `http://localhost:5173` in browser
- [ ] Can upload VCF file (shows "File validated")
- [ ] Can enter drug name
- [ ] Analyze button is enabled
- [ ] Clicking Analyze shows loading state
- [ ] Results appear after analysis
- [ ] No CORS errors in browser console
- [ ] No JavaScript errors in console
- [ ] All visualizations render correctly
- [ ] JSON panel shows formatted response
- [ ] Copy/Download JSON buttons work

---

## 🎯 Next Steps After Local Testing

Once everything works locally:

1. **Test with different VCF files** (if you have them)
2. **Test all supported drugs**
3. **Test error cases** (invalid file, unsupported drug, etc.)
4. **Check mobile responsiveness** (resize browser window)
5. **Test dark mode toggle** (if implemented)
6. **Verify all UI components render correctly**

---

## 📝 Notes

- **Backend runs on:** `http://127.0.0.1:8000` (or `http://localhost:8000`)
- **Frontend runs on:** `http://localhost:5173`
- **Backend API docs:** `http://127.0.0.1:8000/docs` (FastAPI Swagger UI)
- **Backend health check:** `http://127.0.0.1:8000/health`

Both servers support **hot reload** - changes to code will automatically refresh!

---

## 🆘 Still Having Issues?

1. Check both terminal windows for error messages
2. Check browser console (F12) for errors
3. Verify Python and Node.js versions meet requirements
4. Ensure all dependencies are installed correctly
5. Try restarting both servers

**Happy coding! 🧬💊**
