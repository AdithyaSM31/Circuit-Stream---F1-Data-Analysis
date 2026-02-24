import React, { useState, useEffect } from 'react';
import { axios } from '../config/api';
import { MapPin } from 'lucide-react';
import { getCircuitImageByCountry } from '../utils/imageMapper';
import API_BASE_URL from '../config/api';

const CircuitInfo = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [round, setRound] = useState(1);
  const [schedule, setSchedule] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [circuitInfo, setCircuitInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/schedule/${year}`);
      setSchedule(response.data.events);
      if (response.data.events.length > 0) {
        setSelectedEvent(response.data.events[0].event_name);
        setRound(response.data.events[0].round_number);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
    }
  };

  const handleEventChange = (eventName) => {
    setSelectedEvent(eventName);
    const event = schedule.find(e => e.event_name === eventName);
    if (event) {
      setRound(event.round_number);
    }
  };

  const fetchCircuitInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/circuit/${year}/${round}`
      );
      setCircuitInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">
        <MapPin size={32} />
        Circuit Information
      </h2>

      <div className="controls">
        <div className="control-group">
          <label>Year</label>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>Grand Prix</label>
          <select value={selectedEvent} onChange={(e) => handleEventChange(e.target.value)}>
            {schedule && schedule.length > 0 ? (
              schedule.map((event, index) => (
                <option key={`${event.round_number}-${event.event_name}-${index}`} value={event.event_name}>
                  {event.event_name}
                </option>
              ))
            ) : (
              <option value="">Loading events...</option>
            )}
          </select>
        </div>
        <div className="control-group">
          <label>&nbsp;</label>
          <button onClick={fetchCircuitInfo} className="btn-primary">
            Load Circuit Info
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading circuit information...</div>}
      {error && <div className="error">Error: {error}</div>}

      {circuitInfo && (
        <div>
          {/* Circuit Header with Key Stats */}
          {circuitInfo.event_info && (
            <div className="data-card" style={{ 
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.1) 0%, rgba(21, 21, 30, 0.9) 100%)',
              border: '2px solid #E10600'
            }}>
              <h2 style={{ color: '#E10600', marginBottom: '1.5rem', fontSize: '2rem' }}>
                {circuitInfo.event_info.event_name}
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '0.5rem' }}>Location</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#E10600' }}>
                    {circuitInfo.event_info.location}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#ccc' }}>
                    {circuitInfo.event_info.country}
                  </div>
                </div>
                
                {circuitInfo.lap_length_km && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '0.5rem' }}>Lap Length</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#E10600' }}>
                      {circuitInfo.lap_length_km}
                    </div>
                    <div style={{ fontSize: '1rem', color: '#ccc' }}>kilometers</div>
                  </div>
                )}
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '0.5rem' }}>Round</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#E10600' }}>
                    {circuitInfo.round}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#ccc' }}>of {year}</div>
                </div>
                
                {circuitInfo.circuit_info.corners && circuitInfo.circuit_info.corners.length > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '0.5rem' }}>Total Corners</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#E10600' }}>
                      {circuitInfo.circuit_info.corners.length}
                    </div>
                    <div style={{ fontSize: '1rem', color: '#ccc' }}>turns</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Circuit Image */}
          {circuitInfo.event_info && getCircuitImageByCountry(circuitInfo.event_info.country) && (
            <div className="data-card" style={{ 
              marginBottom: '2rem', 
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '2rem'
            }}>
              <h3 style={{ color: '#E10600', marginBottom: '1.5rem', textAlign: 'center' }}>
                Circuit Layout
              </h3>
              <img 
                src={getCircuitImageByCountry(circuitInfo.event_info.country)} 
                alt={`${circuitInfo.event_info.location} Circuit`}
                style={{
                  width: '100%',
                  maxHeight: '600px',
                  objectFit: 'contain',
                  borderRadius: '10px'
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CircuitInfo;
