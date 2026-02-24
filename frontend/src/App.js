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
import { Flag, Calendar, Trophy, Clock, Activity, MapPin, Home, Car, Menu, X } from 'lucide-react';
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
            
            <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <button className="mobile-menu-close" onClick={closeMobileMenu}>
                <span>CIRCUIT STREAM</span>
                <X size={18} />
              </button>
              <NavLink to="/" className="nav-link" end onClick={closeMobileMenu}>
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/schedule" className="nav-link" onClick={closeMobileMenu}>
                <span>Schedule</span>
              </NavLink>
              <NavLink to="/teams" className="nav-link" onClick={closeMobileMenu}>
                <span>Teams</span>
              </NavLink>
              <NavLink to="/results" className="nav-link" onClick={closeMobileMenu}>
                <span>Results</span>
              </NavLink>
              <NavLink to="/laps" className="nav-link" onClick={closeMobileMenu}>
                <span>Lap Times</span>
              </NavLink>
              <NavLink to="/telemetry" className="nav-link" onClick={closeMobileMenu}>
                <span>Telemetry</span>
              </NavLink>
              <NavLink to="/race-control" className="nav-link" onClick={closeMobileMenu}>
                <span>Race Control</span>
              </NavLink>
              <NavLink to="/circuit" className="nav-link" onClick={closeMobileMenu}>
                <span>Circuit Info</span>
              </NavLink>
            </nav>

            <div className="header-right">
              <div className={`api-status-badge ${apiStatus}`}>
                <div className="badge-inner">
                  <div className="badge-red-line top"></div>
                  <div className="badge-content">
                    <div className="badge-top-row">
                      <span className="badge-title">API</span>
                      <div className="badge-icons">
                        <div className="checkered-flag">
                          <div className="row"><div className="b"></div><div className="w"></div><div className="b"></div><div className="w"></div></div>
                          <div className="row"><div className="w"></div><div className="b"></div><div className="w"></div><div className="b"></div></div>
                          <div className="row"><div className="b"></div><div className="w"></div><div className="b"></div><div className="w"></div></div>
                        </div>
                        <div className="telemetry-graph">
                          <span className="graph-label">Digital telemetry</span>
                          <svg viewBox="0 0 100 50" className="graph-line">
                            <path d="M0,40 L10,30 L20,35 L30,20 L40,25 L50,10 L60,15 L70,5 L80,20 L90,10 L100,15" fill="none" stroke="#ffffff" strokeWidth="2" />
                            <path d="M0,40 L10,30 L20,35 L30,20 L40,25 L50,10 L60,15 L70,5 L80,20 L90,10 L100,15 L100,50 L0,50 Z" fill="rgba(255, 255, 255, 0.1)" stroke="none" />
                            <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="10" y1="0" x2="10" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="30" y1="0" x2="30" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="50" y1="0" x2="50" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="70" y1="0" x2="70" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="90" y1="0" x2="90" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="badge-bottom-row">
                      <span className="badge-subtitle">{apiStatus === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}</span>
                    </div>
                  </div>
                  <div className="badge-red-line bottom"></div>
                </div>
              </div>
              <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={24} />
              </button>
            </div>
          </div>
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
