# 🔧 F1 Data Analysis - Troubleshooting Guide

## Quick Diagnostics

### 1. Check Backend Status
Open in browser: http://localhost:5000/api/health

**Expected:**
```json
{"status": "healthy", "message": "F1 Data API is running"}
```

**If not working:** Backend isn't running → See Backend Issues below

### 2. Check Frontend Status
Open in browser: http://localhost:3000

**Expected:** Application loads with navigation menu

**If not working:** Frontend isn't running → See Frontend Issues below

---

## 🐛 Common Issues

### Issue: "python is not recognized"

**Problem:** Python not installed or not in PATH

**Solution:**
```bash
# 1. Install Python from python.org (version 3.8+)
# 2. During installation, check "Add Python to PATH"
# 3. Verify installation:
python --version
```

---

### Issue: "npm is not recognized"

**Problem:** Node.js not installed

**Solution:**
```bash
# 1. Download Node.js from nodejs.org (LTS version)
# 2. Install with default settings
# 3. Restart terminal
# 4. Verify:
node --version
npm --version
```

---

### Issue: Backend won't start

**Symptoms:**
- `python app.py` throws errors
- ModuleNotFoundError
- Import errors

**Solutions:**

1. **Activate virtual environment:**
```bash
venv\Scripts\activate
```

2. **Reinstall dependencies:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

3. **Check Python version:**
```bash
python --version
# Should be 3.8 or higher
```

4. **Check if port 5000 is in use:**
```bash
netstat -ano | findstr :5000
# If something is using it, kill the process or use different port
```

---

### Issue: Frontend won't start

**Symptoms:**
- `npm start` fails
- Module not found errors
- Build errors

**Solutions:**

1. **Clear npm cache:**
```bash
npm cache clean --force
```

2. **Delete and reinstall:**
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

3. **Check Node version:**
```bash
node --version
# Should be 14 or higher
```

4. **Try alternative:**
```bash
npm install --legacy-peer-deps
npm start
```

---

### Issue: "No data loading" or "Error fetching..."

**Symptoms:**
- Buttons clicked but no data appears
- Error messages in UI
- Console shows 404 or 500 errors

**Solutions:**

1. **Verify backend is running:**
```bash
# Open browser: http://localhost:5000/api/health
```

2. **Check year and round are valid:**
```bash
# Valid years: 2018-2025
# Valid rounds: 1-24 (depending on season)
```

3. **Wait for first load:**
```
First time loading data takes 10-30 seconds.
FastF1 needs to download and cache the data.
Be patient!
```

4. **Check internet connection:**
```
FastF1 needs internet to download F1 data.
Ensure you're connected.
```

5. **Clear FastF1 cache:**
```bash
# Delete the cache folder
rmdir /s /q cache
# Then try loading data again
```

---

### Issue: API CORS errors

**Symptoms:**
- Browser console shows CORS errors
- "Access-Control-Allow-Origin" errors
- Frontend can't connect to backend

**Solutions:**

1. **Ensure Flask-CORS is installed:**
```bash
pip install flask-cors
```

2. **Check app.py has CORS enabled:**
```python
from flask_cors import CORS
CORS(app)
```

3. **Use correct URLs:**
```
Backend: http://localhost:5000
Frontend: http://localhost:3000
```

---

### Issue: Slow performance

**Symptoms:**
- Data takes long to load
- UI is sluggish
- Timeout errors

**Solutions:**

1. **First load is always slow:**
```
This is normal! FastF1 downloads data.
Subsequent loads will be much faster.
```

2. **Check cache directory exists:**
```bash
# Should be created automatically in project root
dir cache
```

3. **Limit data requests:**
```
- Don't request all laps at once
- Filter by specific driver
- Use smaller date ranges
```

4. **Close other applications:**
```
Free up system resources
```

---

### Issue: "Session not found" or "Invalid session"

**Symptoms:**
- Error message about invalid session
- No data for specific race

**Solutions:**

1. **Verify race has occurred:**
```
Can't get data for future races!
Check F1 calendar.
```

2. **Check round number:**
```bash
# Example: 2024 has ~24 rounds
# Don't use round 25!
```

3. **Verify session type:**
```
Not all events have all session types.
Sprint races have different format.
```

4. **Try different session:**
```
Some practice sessions may not have full data.
Try Race (R) or Qualifying (Q) first.
```

---

### Issue: Charts not displaying

**Symptoms:**
- Telemetry page shows no graphs
- Only table visible
- Chart area is blank

**Solutions:**

1. **Check recharts is installed:**
```bash
cd frontend
npm install recharts
```

2. **Browser console errors:**
```
Open Developer Tools (F12)
Check Console tab for errors
```

3. **Data format issues:**
```
Ensure data is loading correctly
Check Network tab in browser dev tools
```

---

### Issue: Virtual environment problems

**Symptoms:**
- Can't activate venv
- Wrong Python version used
- Packages not found

**Solutions:**

1. **Recreate virtual environment:**
```bash
rmdir /s /q venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

2. **Check venv is activated:**
```bash
# Command prompt should show (venv) prefix
# Example: (venv) C:\Users\...\f1_project>
```

3. **Use full path:**
```bash
C:\Users\adith\Downloads\f1_project\venv\Scripts\activate
```

---

## 🔍 Debugging Steps

### Step 1: Check Python Environment
```bash
python --version
pip --version
pip list
```

### Step 2: Check Node Environment
```bash
node --version
npm --version
cd frontend
npm list
```

### Step 3: Check Running Processes
```bash
# Check port 5000 (backend)
netstat -ano | findstr :5000

# Check port 3000 (frontend)
netstat -ano | findstr :3000
```

### Step 4: Test Backend Manually
```bash
# Activate venv
venv\Scripts\activate

# Start Flask
python app.py

# In browser, test:
http://localhost:5000/api/health
http://localhost:5000/api/schedule/2024
```

### Step 5: Check Browser Console
```
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for errors (red messages)
4. Check Network tab for failed requests
```

---

## 📋 Verification Checklist

Before asking for help, verify:

- [ ] Python 3.8+ installed
- [ ] Node.js 14+ installed
- [ ] Virtual environment activated
- [ ] All Python packages installed (`pip list`)
- [ ] All Node packages installed (`npm list`)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Internet connection working
- [ ] Firewall not blocking ports
- [ ] Using valid year/round numbers

---

## 🆘 Still Having Issues?

### Get More Information

1. **Backend errors:**
```bash
python app.py
# Read the error message carefully
# Copy the full error stack trace
```

2. **Frontend errors:**
```bash
cd frontend
npm start
# Read the compilation errors
# Check browser console (F12)
```

3. **Check logs:**
```
Backend prints logs to terminal
Check for red error messages
```

### Useful Commands

```bash
# See all installed Python packages
pip list

# See all installed Node packages
cd frontend
npm list --depth=0

# Check Python path
python -c "import sys; print(sys.executable)"

# Check FastF1 installation
python -c "import fastf1; print(fastf1.__version__)"

# Test Flask
python -c "import flask; print(flask.__version__)"
```

---

## 💡 Pro Tips

1. **Always use virtual environment** for Python
2. **Keep terminal windows open** to see errors
3. **Check browser console** for frontend errors
4. **Wait for first data load** - it's slow initially
5. **Use valid historical data** - not future races
6. **Clear cache if data seems wrong**
7. **Restart both servers** when making changes

---

## 🔄 Complete Reset

If everything is broken, start fresh:

```bash
# 1. Close all terminals

# 2. Delete virtual environment
rmdir /s /q venv

# 3. Delete node_modules
cd frontend
rmdir /s /q node_modules
del package-lock.json
cd ..

# 4. Delete cache
rmdir /s /q cache

# 5. Run setup again
setup.bat

# 6. Start application
start.bat
```

---

## 📞 Quick Reference

| Component | URL | Status Check |
|-----------|-----|--------------|
| Backend | http://localhost:5000 | /api/health |
| Frontend | http://localhost:3000 | Main page loads |
| API Docs | See API_DOCUMENTATION.md | - |

---

**Remember: Most issues are solved by:**
1. ✅ Activating virtual environment
2. ✅ Installing dependencies correctly
3. ✅ Using valid data parameters
4. ✅ Being patient with first data load

**Good luck! 🏁**
