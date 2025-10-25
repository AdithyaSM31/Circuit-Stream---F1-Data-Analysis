# Circuit Stream - F1 Data Analysis

A modern, real-time Formula 1 data analysis web application built with FastF1, Flask, and React.

![Circuit Stream Logo](logo.png)

## 🏎️ Features

- **Dashboard**: Hero-style homepage with current/upcoming Grand Prix highlights
- **Event Schedule**: View complete F1 calendar with circuit images and session timings
- **Teams & Drivers**: Complete showcase of all F1 teams with car images and driver portraits
- **Session Results**: Race, Qualifying, Sprint, and Practice session results with driver photos
- **Lap Timing**: Detailed lap times, sector times, tire compounds, and pit stop data
- **Telemetry**: Real-time car telemetry including speed, RPM, gear, throttle, brake, and DRS
- **Race Control**: Live race control messages, flags, penalties, and safety car notifications
- **Circuit Information**: Track layouts with full circuit diagrams

## 📊 Data Sources

This application uses the **FastF1** library which provides:
- Official F1 timing data
- Telemetry from all sessions
- Race control messages
- Track status information
- Historical data from 2018 onwards
- Integration with Ergast API

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup

1. Navigate to the project directory:
```bash
cd f1_project
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

4. Install Python dependencies:
```bash
pip install -r requirements.txt
```

5. Start the Flask backend:
```bash
python app.py
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🔧 API Endpoints

### Event Schedule
- `GET /api/schedule/<year>` - Get full season schedule
- `GET /api/event/<year>/<round>` - Get specific event details

### Session Data
- `GET /api/session/<year>/<round>/<session_type>` - Get session results
- `GET /api/drivers/<year>/<round>/<session_type>` - Get driver list

### Timing & Telemetry
- `GET /api/laps/<year>/<round>/<session_type>` - Get lap timing data
- `GET /api/telemetry/<year>/<round>/<session_type>/<driver>/<lap>` - Get telemetry

### Race Information
- `GET /api/race-control/<year>/<round>/<session_type>` - Get race control messages
- `GET /api/circuit/<year>/<round>` - Get circuit information

## 📝 Session Types

- `R` - Race
- `Q` - Qualifying
- `S` - Sprint
- `FP1` - Free Practice 1
- `FP2` - Free Practice 2
- `FP3` - Free Practice 3

## 🎨 Features Breakdown

### 1. Event Schedule
- View all races for a season
- Session times and dates
- Event formats (Standard, Sprint)
- Location and country information

### 2. Session Results
- Final classification
- Grid positions
- Points scored
- Finishing status
- Team colors

### 3. Lap Timing
- Lap times and sector times
- Tire compound and tire life
- Pit stop information
- Personal best indicators
- Track status per lap

### 4. Telemetry
- Speed traces
- RPM data
- Gear changes
- Throttle and brake inputs
- DRS usage
- Interactive charts

### 5. Race Control
- Flag status
- Safety car deployments
- Investigations and penalties
- Track limit warnings
- Session status updates

### 6. Circuit Information
- Track rotation
- Corner numbers
- Marshall sectors
- Circuit layout data

## 🔄 Data Caching

FastF1 automatically caches downloaded data in the `cache` directory to improve performance and reduce load times. The first request for each session will take longer as it downloads the data.

## 🛠️ Technology Stack

### Backend
- **Flask**: Python web framework
- **FastF1**: F1 data library
- **Pandas**: Data manipulation
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **React**: UI framework
- **React Router**: Navigation
- **Axios**: HTTP client
- **Recharts**: Data visualization
- **Lucide React**: Icons

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## ⚠️ Important Notes

1. **Data Availability**: Live data is only available during active F1 sessions. Historical data is available from 2018 onwards.

2. **Performance**: First-time data loads may take several seconds as FastF1 downloads and caches the data.

3. **API Rate Limits**: Be mindful of making too many requests in quick succession.

4. **Cache Management**: The cache directory can grow large over time. Clear it periodically if needed.

## 🐛 Troubleshooting

### Backend Issues
- Ensure all Python packages are installed: `pip install -r requirements.txt`
- Check that port 5000 is not in use
- Verify Python version is 3.8+

### Frontend Issues
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check that port 3000 is available

### Data Issues
- Clear the cache directory if data seems outdated
- Verify the year and round numbers are valid
- Check your internet connection for live data

## 📄 License

This project is for educational purposes. F1 data is provided by FastF1 and is subject to their terms of use.

## 🙏 Acknowledgments

- **FastF1**: For providing excellent F1 data access
- **Formula 1**: For the amazing sport
- **Ergast API**: For historical F1 data

## 👨‍💻 Development

To contribute or modify:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues with:
- **FastF1**: Visit [FastF1 Documentation](https://docs.fastf1.dev/)
- **This Application**: Check the troubleshooting section above

---

**Enjoy analyzing F1 data! 🏁**
