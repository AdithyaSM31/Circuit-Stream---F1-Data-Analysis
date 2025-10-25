import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin } from 'lucide-react';
import { getCircuitImageByCountry } from '../utils/imageMapper';

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
  }, [year]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/schedule/${year}`);
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
        `http://localhost:5000/api/circuit/${year}/${round}`
      );
      setCircuitInfo(response.data);
    } catch (err) {
      setError(err.message);
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
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="2018"
            max={new Date().getFullYear()}
          />
        </div>
        <div className="control-group">
          <label>Grand Prix</label>
          <select value={selectedEvent} onChange={(e) => handleEventChange(e.target.value)}>
            {schedule && schedule.length > 0 ? (
              schedule.map((event) => (
                <option key={event.round_number} value={event.event_name}>
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
          
          {/* Technical Details */}
          <div className="data-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#E10600', marginBottom: '1rem' }}>
              Technical Details
            </h3>
            
            {circuitInfo.event_info.official_name && (
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(225, 6, 0, 0.1)', borderRadius: '8px' }}>
                <strong style={{ color: '#E10600' }}>Official Name:</strong>
                <div style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
                  {circuitInfo.event_info.official_name}
                </div>
              </div>
            )}

            {circuitInfo.circuit_info.rotation !== null && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Track Rotation:</strong> {circuitInfo.circuit_info.rotation}°
              </div>
            )}

            {circuitInfo.event_info.event_format && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Event Format:</strong> {circuitInfo.event_info.event_format}
              </div>
            )}

            {circuitInfo.circuit_info.corners && circuitInfo.circuit_info.corners.length > 0 && (
              <div>
                <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#333' }}>
                  Corner Breakdown ({circuitInfo.circuit_info.corners.length} Corners)
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '1rem'
                }}>
                  {circuitInfo.circuit_info.corners.map((corner, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #E10600 0%, #8B0000 100%)',
                        color: 'white',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}
                    >
                      Turn {corner.number || index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!circuitInfo.circuit_info.corners || circuitInfo.circuit_info.corners.length === 0) && (
              <p style={{ color: '#666', fontStyle: 'italic', marginTop: '1rem' }}>
                Detailed corner information not available for this circuit.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitInfo;
