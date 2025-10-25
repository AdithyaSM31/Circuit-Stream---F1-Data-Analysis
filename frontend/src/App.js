import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import EventSchedule from './components/EventSchedule';
import SessionResults from './components/SessionResults';
import LapTiming from './components/LapTiming';
import Telemetry from './components/Telemetry';
import RaceControl from './components/RaceControl';
import CircuitInfo from './components/CircuitInfo';
import Teams from './components/Teams';
import { Flag, Calendar, Trophy, Clock, Activity, MapPin, Home, Car } from 'lucide-react';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    // Check API health
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setApiStatus('connected'))
      .catch(err => setApiStatus('disconnected'));
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <img src="/logo.png" alt="Circuit Stream Logo" />
              <h1>Circuit Stream</h1>
            </div>
            <div className={`api-status ${apiStatus}`}>
              <span className="status-dot"></span>
              {apiStatus === 'connected' ? 'API Connected' : 'API Disconnected'}
            </div>
          </div>
          
          <nav className="main-nav">
            <NavLink to="/" className="nav-link" end>
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/schedule" className="nav-link">
              <Calendar size={20} />
              <span>Schedule</span>
            </NavLink>
            <NavLink to="/teams" className="nav-link">
              <Car size={20} />
              <span>Teams</span>
            </NavLink>
            <NavLink to="/results" className="nav-link">
              <Trophy size={20} />
              <span>Results</span>
            </NavLink>
            <NavLink to="/laps" className="nav-link">
              <Clock size={20} />
              <span>Lap Times</span>
            </NavLink>
            <NavLink to="/telemetry" className="nav-link">
              <Activity size={20} />
              <span>Telemetry</span>
            </NavLink>
            <NavLink to="/race-control" className="nav-link">
              <Flag size={20} />
              <span>Race Control</span>
            </NavLink>
            <NavLink to="/circuit" className="nav-link">
              <MapPin size={20} />
              <span>Circuit Info</span>
            </NavLink>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<EventSchedule />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/results" element={<SessionResults />} />
            <Route path="/laps" element={<LapTiming />} />
            <Route path="/telemetry" element={<Telemetry />} />
            <Route path="/race-control" element={<RaceControl />} />
            <Route path="/circuit" element={<CircuitInfo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
