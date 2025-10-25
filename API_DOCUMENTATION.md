# 🔌 F1 Data Analysis API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## 📍 Endpoints

### 1. Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "F1 Data API is running"
}
```

---

### 2. Event Schedule
**GET** `/schedule/<year>`

Get the complete event schedule for a season.

**Parameters:**
- `year` (int): Season year (2018-2025)

**Example:**
```
GET /schedule/2024
```

**Response:**
```json
{
  "year": 2024,
  "total_events": 24,
  "events": [
    {
      "round_number": 1,
      "country": "Bahrain",
      "location": "Sakhir",
      "event_name": "Bahrain Grand Prix",
      "event_date": "2024-03-02",
      "event_format": "conventional",
      "session1": "Practice 1",
      "session1_date": "2024-02-29 11:30:00",
      ...
    }
  ]
}
```

---

### 3. Specific Event
**GET** `/event/<year>/<round>`

Get details for a specific event.

**Parameters:**
- `year` (int): Season year
- `round` (int): Round number (1-24)

**Example:**
```
GET /event/2024/1
```

---

### 4. Session Results
**GET** `/session/<year>/<round>/<session_type>`

Get results from a specific session.

**Parameters:**
- `year` (int): Season year
- `round` (int): Round number
- `session_type` (string): Session identifier
  - `R` - Race
  - `Q` - Qualifying
  - `S` - Sprint
  - `FP1` - Free Practice 1
  - `FP2` - Free Practice 2
  - `FP3` - Free Practice 3

**Example:**
```
GET /session/2024/1/R
```

**Response:**
```json
{
  "year": 2024,
  "round": 1,
  "session_type": "R",
  "results": [
    {
      "position": 1,
      "driver_number": "1",
      "abbreviation": "VER",
      "full_name": "Max Verstappen",
      "team_name": "Red Bull Racing",
      "team_color": "3671C6",
      "grid_position": 1,
      "points": 25,
      "status": "Finished",
      "time": "01:32:07.986"
    }
  ]
}
```

---

### 5. Lap Timing Data
**GET** `/laps/<year>/<round>/<session_type>`

Get lap timing data for a session.

**Parameters:**
- `year` (int): Season year
- `round` (int): Round number
- `session_type` (string): Session identifier
- `driver` (string, optional): Driver number for filtering

**Example:**
```
GET /laps/2024/1/R
GET /laps/2024/1/R?driver=1
```

**Response:**
```json
{
  "year": 2024,
  "round": 1,
  "session_type": "R",
  "driver_filter": "1",
  "total_laps": 57,
  "laps": [
    {
      "time": "0 days 00:03:24.123456",
      "driver": "VER",
      "driver_number": "1",
      "lap_time": "0 days 00:01:32.345",
      "lap_number": 1,
      "stint": 1,
      "sector1_time": "0 days 00:00:28.123",
      "sector2_time": "0 days 00:00:35.456",
      "sector3_time": "0 days 00:00:28.766",
      "compound": "SOFT",
      "tyre_life": 1,
      "track_status": "1",
      "is_personal_best": false
    }
  ]
}
```

---

### 6. Telemetry Data
**GET** `/telemetry/<year>/<round>/<session_type>/<driver_number>/<lap_number>`

Get detailed telemetry for a specific lap.

**Parameters:**
- `year` (int): Season year
- `round` (int): Round number
- `session_type` (string): Session identifier
- `driver_number` (string): Driver number (e.g., "1", "44")
- `lap_number` (int): Lap number

**Example:**
```
GET /telemetry/2024/1/Q/1/5
```

**Response:**
```json
{
  "year": 2024,
  "round": 1,
  "session_type": "Q",
  "driver": "1",
  "lap_number": 5,
  "data_points": 250,
  "telemetry": [
    {
      "session_time": "0 days 00:15:23.456",
      "speed": 312,
      "rpm": 11500,
      "gear": 8,
      "throttle": 100,
      "brake": false,
      "drs": 1
    }
  ]
}
```

---

### 7. Race Control Messages
**GET** `/race-control/<year>/<round>/<session_type>`

Get race control messages and flags.

**Parameters:**
- `year` (int): Season year
- `round` (int): Round number
- `session_type` (string): Session identifier

**Example:**
```
GET /race-control/2024/1/R
```

**Response:**
```json
{
  "year": 2024,
  "round": 1,
  "session_type": "R",
  "total_messages": 45,
  "messages": [
    {
      "time": "0 days 00:00:12.345",
      "category": "Flag",
      "message": "GREEN LIGHT - PIT EXIT OPEN",
      "flag": "GREEN",
      "scope": "Track",
      "sector": null
    }
  ]
}
```

---

### 8. Circuit Information
**GET** `/circuit/<year>/<round>`

Get circuit layout and corner information.

**Parameters:**
- `year` (int): Season year
- `round` (int): Round number

**Example:**
```
GET /circuit/2024/1
```

**Response:**
```json
{
  "year": 2024,
  "round": 1,
  "circuit_info": {
    "rotation": 15.5,
    "corners": [
      {"number": "1"},
      {"number": "2"},
      ...
    ]
  }
}
```

---

### 9. Driver List
**GET** `/drivers/<year>/<round>/<session_type>`

Get list of drivers in a session.

**Parameters:**
- `year` (int): Season year
- `round` (int): Round number
- `session_type` (string): Session identifier

**Example:**
```
GET /drivers/2024/1/R
```

**Response:**
```json
{
  "year": 2024,
  "round": 1,
  "session_type": "R",
  "drivers": [
    {
      "driver_number": "1",
      "abbreviation": "VER",
      "full_name": "Max Verstappen",
      "team_name": "Red Bull Racing",
      "team_color": "3671C6"
    }
  ]
}
```

---

## 🚦 Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found (invalid endpoint) |
| 500 | Server Error (FastF1 error, data unavailable) |

---

## ⚙️ Data Types

### Session Types
- `R` - Race
- `Q` - Qualifying
- `S` - Sprint
- `FP1`, `FP2`, `FP3` - Free Practice 1, 2, 3

### Tire Compounds
- `SOFT` - Red tire
- `MEDIUM` - Yellow tire
- `HARD` - White tire
- `INTERMEDIATE` - Green tire (wet)
- `WET` - Blue tire (very wet)

### Track Status Codes
- `1` - Track Clear / Green Flag
- `2` - Yellow Flag
- `4` - Safety Car
- `5` - Red Flag
- `6` - Virtual Safety Car (VSC)
- `7` - VSC Ending

### Flag Types
- `GREEN` - Track clear
- `YELLOW` - Caution
- `RED` - Session stopped
- `BLUE` - Faster car approaching
- `WHITE` - Slow vehicle on track
- `CHEQUERED` - Session/Race end

---

## 📊 Rate Limiting

Currently, no rate limiting is implemented. However, be mindful:
- First request per session downloads data (slower)
- Subsequent requests use cache (faster)
- Don't make rapid successive requests

---

## 🔒 CORS

CORS is enabled for all origins in development mode.

---

## 🐛 Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

Common errors:
- "Session not found" - Invalid year/round/session combination
- "No data available" - Session hasn't occurred or data not loaded
- "Invalid driver number" - Driver didn't participate in session

---

## 💡 Tips

1. **Cache Directory**: Data is cached in `./cache` for faster loading
2. **First Load**: Initial requests take 10-30 seconds to download data
3. **Historical Data**: Works for 2018-present seasons
4. **Live Data**: Best during actual F1 race weekends
5. **Data Availability**: Some older sessions may have incomplete data

---

## 📚 FastF1 Documentation

For more details on the underlying data:
- [FastF1 Docs](https://docs.fastf1.dev/)
- [FastF1 GitHub](https://github.com/theOehrly/Fast-F1)

---

## 🔄 Example Workflow

```bash
# 1. Get schedule for current season
GET /schedule/2024

# 2. Get race results for Round 1
GET /session/2024/1/R

# 3. Get lap times for a specific driver
GET /laps/2024/1/R?driver=1

# 4. Get telemetry for driver's fastest lap
GET /telemetry/2024/1/Q/1/10

# 5. Get race control messages
GET /race-control/2024/1/R
```

---

**Happy F1 Data Analyzing! 🏁**
