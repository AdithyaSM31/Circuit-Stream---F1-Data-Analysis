import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Clock, Trophy, Flag, ChevronRight, TrendingUp } from 'lucide-react';
import { getCircuitImageByCountry } from '../utils/imageMapper';
import API_BASE_URL from '../config/api';
import './Dashboard.css';

const Dashboard = () => {
  const [schedule, setSchedule] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [lastRaceResults, setLastRaceResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentYear = new Date().getFullYear();
      const response = await axios.get(`${API_BASE_URL}/api/schedule/${currentYear}`);
      const events = response.data.events;
      
      const now = new Date();
      
      // Find current or next event
      let current = null;
      let upcoming = [];
      
      for (let event of events) {
        // Use the race date (session5 is usually the race) for more accurate countdown
        const raceDate = event.session5_date || event.session4_date || event.event_date;
        if (raceDate) {
          const eventDate = new Date(raceDate);
          const daysDiff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
          
          if (daysDiff >= -3 && daysDiff <= 3) {
            // Event is happening now or very soon
            current = { ...event, daysDiff };
          } else if (daysDiff > 3 && upcoming.length < 3) {
            // Future events
            upcoming.push({ ...event, daysDiff });
          }
        }
      }
      
      // If no current event, get the next one
      if (!current && events.length > 0) {
        const futureEvents = events.filter(e => {
          const raceDate = e.session5_date || e.session4_date || e.event_date;
          if (!raceDate) return false;
          const eventDate = new Date(raceDate);
          return eventDate > now;
        });
        
        if (futureEvents.length > 0) {
          const nextEvent = futureEvents[0];
          const raceDate = nextEvent.session5_date || nextEvent.session4_date || nextEvent.event_date;
          const eventDate = new Date(raceDate);
          const daysDiff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
          current = { ...nextEvent, daysDiff };
          upcoming = futureEvents.slice(1, 4).map(e => {
            const raceDate = e.session5_date || e.session4_date || e.event_date;
            const eventDate = new Date(raceDate);
            const daysDiff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
            return { ...e, daysDiff };
          });
        }
      }
      
      setSchedule(response.data);
      setCurrentEvent(current);
      setUpcomingEvents(upcoming);
      
      // Load last race results if available
      if (current && current.round_number > 1) {
        try {
          const resultsResponse = await axios.get(
            `${API_BASE_URL}/api/session/${currentYear}/${current.round_number - 1}/R`
          );
          setLastRaceResults(resultsResponse.data);
        } catch (err) {
          console.log('Could not load last race results');
        }
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format date in IST timezone to ensure correct date
    return date.toLocaleDateString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Format date for hero section - uses the race/main session date
  const formatEventDate = (event) => {
    // Try to get the main race date (session5 is usually the race)
    const raceDate = event.session5_date || event.session4_date || event.session3_date || event.event_date;
    if (!raceDate) return formatDate(event.event_date);
    
    const date = new Date(raceDate);
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatSessionTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // Format directly in IST timezone
    const time = date.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${time} IST`;
  };

  const getCountdownText = (daysDiff) => {
    if (daysDiff < 0) {
      return 'RACE WEEK!';
    } else if (daysDiff === 0) {
      return 'TODAY!';
    } else if (daysDiff === 1) {
      return 'TOMORROW';
    } else if (daysDiff <= 7) {
      return `IN ${daysDiff} DAYS`;
    } else {
      return `IN ${Math.floor(daysDiff / 7)} WEEKS`;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-dashboard">
          <div className="loading-spinner"></div>
          <p>Loading F1 Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-dashboard">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Hero Section - Current/Next Race */}
      {currentEvent && (
        <div className="hero-section">
          <div className="hero-background">
            {getCircuitImageByCountry(currentEvent.country) && (
              <img 
                src={getCircuitImageByCountry(currentEvent.country)} 
                alt={`${currentEvent.event_name} Circuit`}
                className="hero-circuit-image"
              />
            )}
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <div className="hero-badge">{getCountdownText(currentEvent.daysDiff)}</div>
            <h1 className="hero-title">{currentEvent.event_name}</h1>
            <div className="hero-location">
              <MapPin size={24} />
              <span>{currentEvent.location}, {currentEvent.country}</span>
            </div>
            <div className="hero-date">
              <Calendar size={24} />
              <span>{formatEventDate(currentEvent)}</span>
            </div>
            <div className="hero-round">ROUND {currentEvent.round_number}</div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Sessions Schedule */}
        {currentEvent && (
          <div className="dashboard-card featured-card">
            <div className="card-header">
              <Clock size={24} />
              <h2>Race Weekend Schedule</h2>
            </div>
            <div className="sessions-list">
              {currentEvent.session1 && (
                <div className="session-item">
                  <div className="session-name">{currentEvent.session1}</div>
                  <div className="session-time">{formatSessionTime(currentEvent.session1_date)}</div>
                  <div className="session-date">{formatDate(currentEvent.session1_date)}</div>
                </div>
              )}
              {currentEvent.session2 && (
                <div className="session-item">
                  <div className="session-name">{currentEvent.session2}</div>
                  <div className="session-time">{formatSessionTime(currentEvent.session2_date)}</div>
                  <div className="session-date">{formatDate(currentEvent.session2_date)}</div>
                </div>
              )}
              {currentEvent.session3 && (
                <div className="session-item">
                  <div className="session-name">{currentEvent.session3}</div>
                  <div className="session-time">{formatSessionTime(currentEvent.session3_date)}</div>
                  <div className="session-date">{formatDate(currentEvent.session3_date)}</div>
                </div>
              )}
              {currentEvent.session4 && (
                <div className="session-item">
                  <div className="session-name">{currentEvent.session4}</div>
                  <div className="session-time">{formatSessionTime(currentEvent.session4_date)}</div>
                  <div className="session-date">{formatDate(currentEvent.session4_date)}</div>
                </div>
              )}
              {currentEvent.session5 && (
                <div className="session-item highlight-session">
                  <div className="session-name">{currentEvent.session5}</div>
                  <div className="session-time">{formatSessionTime(currentEvent.session5_date)}</div>
                  <div className="session-date">{formatDate(currentEvent.session5_date)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Race Results */}
        {lastRaceResults && (
          <div className="dashboard-card">
            <div className="card-header">
              <Trophy size={24} />
              <h2>Last Race Results</h2>
            </div>
            <div className="podium-container">
              {lastRaceResults.results.slice(0, 3).map((driver, index) => (
                <div key={index} className={`podium-item position-${index + 1}`}>
                  <div className="podium-position">{index + 1}</div>
                  <div className="podium-driver">{driver.full_name}</div>
                  <div className="podium-team">{driver.team_name}</div>
                  <div className="podium-points">{driver.points} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Races */}
        <div className="dashboard-card upcoming-card">
          <div className="card-header">
            <Flag size={24} />
            <h2>Upcoming Races</h2>
          </div>
          <div className="upcoming-list">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="upcoming-item">
                <div className="upcoming-round">R{event.round_number}</div>
                <div className="upcoming-details">
                  <div className="upcoming-name">{event.event_name}</div>
                  <div className="upcoming-location">{event.country}</div>
                  <div className="upcoming-date">{formatDate(event.event_date)}</div>
                </div>
                <ChevronRight size={20} className="upcoming-arrow" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-card stats-card">
          <div className="card-header">
            <TrendingUp size={24} />
            <h2>Season Stats</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{schedule?.total_events || 0}</div>
              <div className="stat-label">Total Races</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{currentEvent?.round_number || 0}</div>
              <div className="stat-label">Current Round</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{schedule?.total_events - (currentEvent?.round_number || 0)}</div>
              <div className="stat-label">Races Left</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
