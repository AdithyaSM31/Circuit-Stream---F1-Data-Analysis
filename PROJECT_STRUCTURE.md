# F1 Data Analysis - Project Structure

```
f1_project/
│
├── app.py                      # Flask backend server with FastF1 integration
├── requirements.txt            # Python dependencies
├── README.md                   # Complete documentation
├── .gitignore                 # Git ignore rules
├── setup.bat                   # Windows setup script
├── start.bat                   # Windows start script
│
├── cache/                      # FastF1 data cache (auto-generated)
│
└── frontend/                   # React frontend application
    ├── package.json           # Node.js dependencies
    ├── public/
    │   └── index.html        # HTML template
    │
    └── src/
        ├── index.js          # React entry point
        ├── index.css         # Global styles
        ├── App.js            # Main app component with routing
        ├── App.css           # App styles
        │
        └── components/       # React components
            ├── EventSchedule.js    # F1 calendar and events
            ├── SessionResults.js   # Race/Qualifying results
            ├── LapTiming.js        # Lap times and sectors
            ├── Telemetry.js        # Car telemetry data
            ├── RaceControl.js      # Race control messages
            └── CircuitInfo.js      # Circuit information
```

## Component Overview

### Backend (app.py)

**API Endpoints:**
- `/api/health` - Health check
- `/api/schedule/<year>` - Event schedule
- `/api/event/<year>/<round>` - Event details
- `/api/session/<year>/<round>/<session>` - Session results
- `/api/laps/<year>/<round>/<session>` - Lap timing
- `/api/telemetry/<year>/<round>/<session>/<driver>/<lap>` - Telemetry data
- `/api/race-control/<year>/<round>/<session>` - Race control messages
- `/api/circuit/<year>/<round>` - Circuit information
- `/api/drivers/<year>/<round>/<session>` - Driver list

### Frontend Components

1. **EventSchedule**
   - Displays full season calendar
   - Shows all sessions with dates/times
   - Event locations and formats

2. **SessionResults**
   - Race/Qualifying/Sprint results
   - Driver standings with team colors
   - Grid positions and points

3. **LapTiming**
   - Lap times and sector times
   - Tire compound visualization
   - Pit stop data
   - Personal best indicators

4. **Telemetry**
   - Speed, RPM, gear charts
   - Throttle and brake data
   - Interactive visualizations
   - DRS usage

5. **RaceControl**
   - Flag status
   - Penalties and investigations
   - Safety car notifications
   - Track limit warnings

6. **CircuitInfo**
   - Track layout details
   - Corner numbers
   - Marshall sectors

## Data Flow

```
User Request → React Component → Axios → Flask API → FastF1 → F1 Data
     ↓                                                            ↓
Frontend Display ← JSON Response ← Python Processing ← Pandas DataFrame
```

## Technologies Used

**Backend:**
- Flask 3.0+ (Web framework)
- FastF1 3.0+ (F1 data library)
- Pandas 2.0+ (Data processing)
- Flask-CORS (Cross-origin support)

**Frontend:**
- React 18 (UI library)
- React Router 6 (Navigation)
- Axios (HTTP client)
- Recharts 2 (Data visualization)
- Lucide React (Icons)

## Quick Start Commands

```bash
# Setup (first time only)
setup.bat

# Or manual setup:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd frontend
npm install

# Start application
start.bat

# Or manual start:
# Terminal 1: Backend
python app.py

# Terminal 2: Frontend
cd frontend
npm start
```

## URLs

- Backend API: http://localhost:5000
- Frontend UI: http://localhost:3000

## Notes

- Cache directory stores FastF1 data for faster loading
- First data request per session takes longer (downloads data)
- Historical data available from 2018 onwards
- Live data available during active F1 sessions
