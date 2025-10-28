import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar } from 'lucide-react';
import { getCircuitImageByCountry } from '../utils/imageMapper';
import API_BASE_URL from '../config/api';

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

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
    const daysDiff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
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
        <div style={{ 
          marginBottom: '1rem',
          height: '150px',
          overflow: 'hidden',
          borderRadius: '10px',
          background: 'rgba(225, 6, 0, 0.05)'
        }}>
          <img 
            src={getCircuitImageByCountry(event.country)} 
            alt={`${event.location} Circuit`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '1rem'
            }}
          />
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h3 style={{ color: '#E10600', marginBottom: '0.5rem' }}>
            Round {event.round_number}: {event.event_name}
          </h3>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            📍 {event.location}, {event.country}
          </p>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            📅 {event.event_date}
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Format: <strong>{event.event_format}</strong>
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '1rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#333' }}>Sessions:</h4>
        <div style={{ display: 'grid', gap: '0.3rem', fontSize: '0.85rem' }}>
          {event.session1 && (
            <div>🏁 {event.session1} - {formatDateWithTimezone(event.session1_date)}</div>
          )}
          {event.session2 && (
            <div>🏁 {event.session2} - {formatDateWithTimezone(event.session2_date)}</div>
          )}
          {event.session3 && (
            <div>🏁 {event.session3} - {formatDateWithTimezone(event.session3_date)}</div>
          )}
          {event.session4 && (
            <div>🏁 {event.session4} - {formatDateWithTimezone(event.session4_date)}</div>
          )}
          {event.session5 && (
            <div>🏁 {event.session5} - {formatDateWithTimezone(event.session5_date)}</div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="page-container">
      <h2 className="page-title">
        <Calendar size={32} />
        Event Schedule
      </h2>

      <div className="controls">
        <div className="control-group">
          <label>Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="2018"
            max={new Date().getFullYear() + 1}
          />
        </div>
        <div className="control-group">
          <label>&nbsp;</label>
          <button onClick={fetchSchedule} className="btn-primary">
            Load Schedule
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading schedule...</div>}
      {error && <div className="error">Error: {error}</div>}

      {schedule && (
        <div>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Total Events: {schedule.total_events}
          </p>
          
          {(() => {
            const organizedEvents = organizeEvents(schedule.events);
            
            return (
              <>
                {/* Current/Upcoming Race */}
                {organizedEvents.current.length > 0 && (
                  <>
                    <h3 style={{ 
                      color: '#E10600', 
                      marginTop: '2rem', 
                      marginBottom: '1rem',
                      fontSize: '1.3rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔴 Current Race Week
                    </h3>
                    <div className="data-grid">
                      {organizedEvents.current.map((event, index) => (
                        <div 
                          key={`current-${index}`} 
                          className="data-card" 
                          style={{ 
                            overflow: 'hidden',
                            border: '3px solid #E10600',
                            boxShadow: '0 8px 30px rgba(225, 6, 0, 0.3)',
                            animation: 'pulse 2s infinite',
                            background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%)'
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#E10600',
                            color: 'white',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            RACE WEEK!
                          </div>
                          {renderEventCard(event)}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Upcoming Races */}
                {organizedEvents.upcoming.length > 0 && (
                  <>
                    <h3 style={{ 
                      color: '#4CAF50', 
                      marginTop: '2rem', 
                      marginBottom: '1rem',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🟢 Upcoming Races
                    </h3>
                    <div className="data-grid">
                      {organizedEvents.upcoming.map((event, index) => (
                        <div 
                          key={`upcoming-${index}`} 
                          className="data-card" 
                          style={{ 
                            overflow: 'hidden',
                            border: '2px solid rgba(76, 175, 80, 0.3)'
                          }}
                        >
                          {renderEventCard(event)}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Past Races */}
                {organizedEvents.past.length > 0 && (
                  <>
                    <h3 style={{ 
                      color: '#999', 
                      marginTop: '2rem', 
                      marginBottom: '1rem',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      ⚫ Past Races
                    </h3>
                    <div className="data-grid">
                      {organizedEvents.past.map((event, index) => (
                        <div 
                          key={`past-${index}`} 
                          className="data-card" 
                          style={{ 
                            overflow: 'hidden',
                            opacity: 0.6,
                            filter: 'grayscale(30%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          {renderEventCard(event)}
                        </div>
                      ))}
                    </div>
                  </>
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
