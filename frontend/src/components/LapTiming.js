import React, { useState } from 'react';
import axios from 'axios';
import { Clock } from 'lucide-react';
import API_BASE_URL from '../config/api';

const LapTiming = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [round, setRound] = useState(1);
  const [sessionType, setSessionType] = useState('R');
  const [driverNumber, setDriverNumber] = useState('');
  const [laps, setLaps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');

  React.useEffect(() => {
    fetchSchedule();
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

  const fetchLaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = driverNumber
        ? `${API_BASE_URL}/api/laps/${year}/${round}/${sessionType}?driver=${driverNumber}`
        : `${API_BASE_URL}/api/laps/${year}/${round}/${sessionType}`;
      
      const response = await axios.get(url);
      setLaps(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">
        <Clock size={32} />
        Lap Timing Data
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
          <select 
            value={selectedEvent} 
            onChange={(e) => handleEventChange(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            {schedule && schedule.length > 0 ? (
              schedule.map((event, index) => (
                <option key={index} value={event.event_name}>
                  {event.event_name}
                </option>
              ))
            ) : (
              <option value="">Loading events...</option>
            )}
          </select>
        </div>
        <div className="control-group">
          <label>Session Type</label>
          <select value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
            <option value="R">Race</option>
            <option value="Q">Qualifying</option>
            <option value="S">Sprint</option>
            <option value="FP1">Practice 1</option>
            <option value="FP2">Practice 2</option>
            <option value="FP3">Practice 3</option>
          </select>
        </div>
        <div className="control-group">
          <label>Driver Number (Optional)</label>
          <input
            type="text"
            value={driverNumber}
            onChange={(e) => setDriverNumber(e.target.value)}
            placeholder="e.g., 1, 44"
          />
        </div>
        <div className="control-group">
          <label>&nbsp;</label>
          <button onClick={fetchLaps} className="btn-primary">
            Load Laps
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading lap data...</div>}
      {error && <div className="error">Error: {error}</div>}

      {laps && (
        <div>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Total Laps: {laps.total_laps}
            {laps.driver_filter && ` (Driver #${laps.driver_filter})`}
          </p>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Lap</th>
                  <th>Driver</th>
                  <th>Lap Time</th>
                  <th>S1</th>
                  <th>S2</th>
                  <th>S3</th>
                  <th>Compound</th>
                  <th>Tyre Life</th>
                  <th>Stint</th>
                  <th>PB</th>
                </tr>
              </thead>
              <tbody>
                {laps.laps.map((lap, index) => (
                  <tr key={index} style={lap.is_personal_best ? { background: '#d4edda' } : {}}>
                    <td><strong>{lap.lap_number}</strong></td>
                    <td>{lap.driver}</td>
                    <td><strong>{lap.lap_time || '-'}</strong></td>
                    <td>{lap.sector1_time || '-'}</td>
                    <td>{lap.sector2_time || '-'}</td>
                    <td>{lap.sector3_time || '-'}</td>
                    <td>
                      {lap.compound && (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          background: lap.compound === 'SOFT' ? '#ff0000' :
                                     lap.compound === 'MEDIUM' ? '#ffd700' :
                                     lap.compound === 'HARD' ? '#ffffff' :
                                     lap.compound === 'INTERMEDIATE' ? '#00ff00' :
                                     lap.compound === 'WET' ? '#0000ff' : '#ccc',
                          color: lap.compound === 'HARD' ? '#000' : '#fff',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {lap.compound}
                        </span>
                      )}
                    </td>
                    <td>{lap.tyre_life || '-'}</td>
                    <td>{lap.stint}</td>
                    <td>{lap.is_personal_best ? '✓' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LapTiming;
