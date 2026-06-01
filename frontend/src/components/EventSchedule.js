import React, { useState, useEffect } from 'react';
import { axios } from '../config/api';
import { Calendar } from 'lucide-react';
import { Calendar } from 'lucide-react';
import { getCircuitImageByCountry } from '../utils/imageMapper';
import API_BASE_URL from '../config/api';
import './EventSchedule.css';

const EventSchedule = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/schedule/${year}`);
      setSchedule(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const formatDateWithTimezone = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      
      // Format directly in IST timezone (this handles date changes automatically)
      const formattedDate = date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      
      return `${formattedDate} IST`;
    } catch {
      return dateString;
    }
  };

  const getRaceStatus = (event) => {
    const now = new Date();
    const raceDate = event.session5_date || event.session4_date || event.event_date;
    if (!raceDate) return 'upcoming';
    
    const eventDate = new Date(raceDate);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysDiff = Math.round((eventDay - todayDay) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'past';
    if (daysDiff <= 7) return 'current';
    return 'upcoming';
  };

  const organizeEvents = (events) => {
    if (!events) return { past: [], current: [], upcoming: [] };
    
    const organized = {
      past: [],
      current: [],
      upcoming: []
    };
    
    events.forEach(event => {
      const status = getRaceStatus(event);
      organized[status].push(event);
    });
    
    return organized;
  };

  const renderEventCard = (event) => (
    <>
      {/* Circuit Image */}
      {getCircuitImageByCountry(event.country) && (
        <div className="circuit-image-container">
          <img 
            src={getCircuitImageByCountry(event.country)} 
            alt={`${event.location} Circuit`}
            className="circuit-image"
          />
        </div>
      )}
      
      <div className="event-info-main">
        <h3 className="event-name">
          Round {event.round_number}: {event.event_name}
        </h3>
        <p className="event-location">
          📍 {event.location}, {event.country}
        </p>
        <p className="event-date">
          📅 {event.event_date}
        </p>
        <p className="event-format">
          Format: <strong>{event.event_format}</strong>
        </p>
      </div>
      
      <div className="event-sessions">
        <h4>Sessions:</h4>
        <div className="sessions-list">
          {event.session1 && (
            <div className="session-item">🏁 {event.session1} - {formatDateWithTimezone(event.session1_date)}</div>
          )}
          {event.session2 && (
            <div className="session-item">🏁 {event.session2} - {formatDateWithTimezone(event.session2_date)}</div>
          )}
          {event.session3 && (
            <div className="session-item">🏁 {event.session3} - {formatDateWithTimezone(event.session3_date)}</div>
          )}
          {event.session4 && (
            <div className="session-item">🏁 {event.session4} - {formatDateWithTimezone(event.session4_date)}</div>
          )}
          {event.session5 && (
            <div className="session-item">🏁 {event.session5} - {formatDateWithTimezone(event.session5_date)}</div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="premium-container">
      <div className="premium-header">
        <div className="header-title">
          <Calendar size={32} color="#E10600" />
          <h1>Event Schedule</h1>
        </div>
        <div className="year-selector">
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="loading">Loading schedule...</div>}
      {error && <div className="error">Error: {error}</div>}

      {schedule && (
        <div className="schedule-content">
          <p className="total-events">
            Total Events: {schedule.total_events}
          </p>
          
          {(() => {
            const organizedEvents = organizeEvents(schedule.events);
            
            return (
              <>
                {/* Current/Upcoming Race */}
                {organizedEvents.current.length > 0 && (
                  <div className="schedule-section">
                    <h3 className="section-title current">
                      🔴 Current Race Week
                    </h3>
                    <div className="schedule-grid">
                      {organizedEvents.current.map((event, index) => (
                        <div key={`current-${index}`} className="schedule-card current-race">
                          <div className="race-badge">RACE WEEK!</div>
                          {renderEventCard(event)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Races */}
                {organizedEvents.upcoming.length > 0 && (
                  <div className="schedule-section">
                    <h3 className="section-title upcoming">
                      🟢 Upcoming Races
                    </h3>
                    <div className="schedule-grid">
                      {organizedEvents.upcoming.map((event, index) => (
                        <div key={`upcoming-${index}`} className="schedule-card">
                          {renderEventCard(event)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Races */}
                {organizedEvents.past.length > 0 && (
                  <div className="schedule-section">
                    <h3 className="section-title past">
                      ⚫ Past Races
                    </h3>
                    <div className="schedule-grid">
                      {organizedEvents.past.map((event, index) => (
                        <div key={`past-${index}`} className="schedule-card past-race">
                          {renderEventCard(event)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default EventSchedule;
