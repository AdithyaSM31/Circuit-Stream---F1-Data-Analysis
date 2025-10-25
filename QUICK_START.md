# 🏎️ F1 Data Analysis - Quick Start Guide

## Step-by-Step Setup Instructions

### Option 1: Automated Setup (Recommended for Windows)

1. **Run the setup script:**
   ```bash
   setup.bat
   ```
   This will automatically:
   - Create a Python virtual environment
   - Install all Python dependencies
   - Install all Node.js dependencies

2. **Start the application:**
   ```bash
   start.bat
   ```
   This will open two terminal windows:
   - Backend server (Flask)
   - Frontend server (React)

3. **Access the application:**
   - Open your browser to: http://localhost:3000

---

### Option 2: Manual Setup

#### Step 1: Setup Backend

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask server:**
   ```bash
   python app.py
   ```
   ✅ Backend running at: http://localhost:5000

#### Step 2: Setup Frontend

1. **Open a new terminal and navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```
   ✅ Frontend running at: http://localhost:3000

---

## 🎯 Using the Application

### 1. Event Schedule
- Select a year (2018-2025)
- Click "Load Schedule"
- View all races, locations, and session times

### 2. Session Results
- Enter Year (e.g., 2024)
- Enter Round (1-24)
- Select Session Type (Race, Qualifying, etc.)
- Click "Load Results"
- View driver standings, points, and team colors

### 3. Lap Timing
- Set Year, Round, and Session Type
- Optionally filter by Driver Number (e.g., 1, 44)
- Click "Load Laps"
- View lap times, sector times, tire data

### 4. Telemetry
- Set Year, Round, Session Type
- Enter Driver Number (e.g., 1 for Max Verstappen)
- Enter Lap Number
- Click "Load Telemetry"
- View interactive charts and detailed telemetry data

### 5. Race Control
- Set Year, Round, and Session Type
- Click "Load Messages"
- View flags, penalties, and race control communications

### 6. Circuit Info
- Enter Year and Round
- Click "Load Circuit Info"
- View track rotation and corner details

---

## 📊 Example Queries

### Recent Race
```
Year: 2024
Round: 1
Session: R (Race)
```

### Driver Telemetry
```
Year: 2024
Round: 1
Session: Q (Qualifying)
Driver: 1
Lap: 10
```

### Lap Times for Specific Driver
```
Year: 2024
Round: 1
Session: R
Driver Number: 44
```

---

## 🔧 Troubleshooting

### Backend won't start
- ✅ Check Python is installed: `python --version`
- ✅ Ensure virtual environment is activated
- ✅ Verify all packages installed: `pip list`
- ✅ Check port 5000 is not in use

### Frontend won't start
- ✅ Check Node.js is installed: `node --version`
- ✅ Clear npm cache: `npm cache clean --force`
- ✅ Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- ✅ Check port 3000 is not in use

### No data loading
- ✅ Ensure backend is running (http://localhost:5000/api/health)
- ✅ Check internet connection (first load downloads data)
- ✅ Verify year and round numbers are valid
- ✅ Wait for cache to build (first request is slower)

### API Connection Error
- ✅ Verify backend is running on port 5000
- ✅ Check browser console for CORS errors
- ✅ Ensure Flask-CORS is installed

---

## 🎨 Features at a Glance

| Feature | Description | Data Points |
|---------|-------------|-------------|
| Schedule | Complete F1 calendar | Events, dates, sessions |
| Results | Session classifications | Positions, points, status |
| Lap Times | Detailed timing data | Sectors, tires, pit stops |
| Telemetry | Car performance data | Speed, RPM, throttle, brake |
| Race Control | Official messages | Flags, penalties, safety car |
| Circuit Info | Track details | Corners, layout, markers |

---

## 📱 Keyboard Shortcuts

- `Ctrl + Click` on nav links: Open in new tab
- Scroll on charts: Zoom in/out
- Hover on data points: View details

---

## 💡 Pro Tips

1. **Cache Directory**: First data load takes time. Subsequent loads are instant!
2. **Historical Data**: Works for seasons 2018-present
3. **Live Sessions**: Best during actual F1 weekends
4. **Driver Numbers**: Common ones - VER: 1, HAM: 44, LEC: 16
5. **Session Types**: R=Race, Q=Qualifying, S=Sprint, FP1/2/3=Practice

---

## 🆘 Getting Help

### Check API Status
Visit: http://localhost:5000/api/health

Should return:
```json
{
  "status": "healthy",
  "message": "F1 Data API is running"
}
```

### FastF1 Documentation
For data-related questions: https://docs.fastf1.dev/

### Common Issues
1. **Slow initial load**: Normal! FastF1 downloads and caches data
2. **Missing data**: Some older sessions may have incomplete data
3. **Year range**: Only 2018-present fully supported

---

## 🚀 Ready to Go!

1. Run `setup.bat` (first time only)
2. Run `start.bat`
3. Open http://localhost:3000
4. Start exploring F1 data! 🏁

**Enjoy your F1 data analysis!**
