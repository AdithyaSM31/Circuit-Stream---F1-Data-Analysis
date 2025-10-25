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
          
          <div className="data-grid">
            {schedule.events.map((event, index) => (
              <div key={index} className="data-card" style={{ overflow: 'hidden' }}>
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
                      <div>🏁 {event.session1} - {event.session1_date}</div>
                    )}
                    {event.session2 && (
                      <div>🏁 {event.session2} - {event.session2_date}</div>
                    )}
                    {event.session3 && (
                      <div>🏁 {event.session3} - {event.session3_date}</div>
                    )}
                    {event.session4 && (
                      <div>🏁 {event.session4} - {event.session4_date}</div>
                    )}
                    {event.session5 && (
                      <div>🏁 {event.session5} - {event.session5_date}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventSchedule;
