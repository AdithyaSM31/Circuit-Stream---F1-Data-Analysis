import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import EventSchedule from './components/EventSchedule';
import Standings from './components/Standings';
import SessionResults from './components/SessionResults';
import LapTiming from './components/LapTiming';
import Telemetry from './components/Telemetry';
import RaceControl from './components/RaceControl';
import CircuitInfo from './components/CircuitInfo';
import Teams from './components/Teams';
import { Flag, Calendar, Trophy, Clock, Activity, MapPin, Home, Car, Menu, X, Award } from 'lucide-react';
import API_BASE_URL from './config/api';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Configure status bar for native apps
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#15151E' });
      StatusBar.setOverlaysWebView({ overlay: false });
    }

    // Check API health
    fetch(`${API_BASE_URL}/api/health`)
      .then(res => res.json())
      .then(data => setApiStatus('connected'))
      .catch(err => setApiStatus('disconnected'));
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Router>
      <div className="App">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={closeMobileMenu}></div>
        )}
        
        <header className={`app-header ${mobileMenuOpen ? 'menu-open' : ''}`}>
          <div className="header-content">
            <div className="logo">
              <img src="/logo.png" alt="Circuit Stream Logo" />
              <h1>Circuit Stream</h1>
            </div>
            <div className="header-right">
              <div className={`api-status ${apiStatus}`}>
                <span className="status-dot"></span>
                {apiStatus === 'connected' ? 'API Connected' : 'API Disconnected'}
              </div>
              <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <button className="mobile-menu-close" onClick={closeMobileMenu}>
              <X size={24} />
            </button>
            <NavLink to="/" className="nav-link" end onClick={closeMobileMenu}>
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/standings" className="nav-link" onClick={closeMobileMenu}>
              <Award size={20} />
              <span>Standings</span>
            </NavLink>
            <NavLink to="/schedule" className="nav-link" onClick={closeMobileMenu}>
              <Calendar size={20} />
              <span>Schedule</span>
            </NavLink>
            <NavLink to="/teams" className="nav-link" onClick={closeMobileMenu}>
              <Car size={20} />
              <span>Teams</span>
            </NavLink>
            <NavLink to="/results" className="nav-link" onClick={closeMobileMenu}>
              <Trophy size={20} />
              <span>Results</span>
            </NavLink>
            <NavLink to="/laps" className="nav-link" onClick={closeMobileMenu}>
              <Clock size={20} />
              <span>Lap Times</span>
            </NavLink>
            <NavLink to="/telemetry" className="nav-link" onClick={closeMobileMenu}>
              <Activity size={20} />
              <span>Telemetry</span>
            </NavLink>
            <NavLink to="/race-control" className="nav-link" onClick={closeMobileMenu}>
              <Flag size={20} />
              <span>Race Control</span>
            </NavLink>
            <NavLink to="/circuit" className="nav-link" onClick={closeMobileMenu}>
              <MapPin size={20} />
              <span>Circuit Info</span>
            </NavLink>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/standings" element={<Standings />} />
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
