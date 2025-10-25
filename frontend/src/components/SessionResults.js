import React, { useState } from 'react';
import axios from 'axios';
import { Trophy } from 'lucide-react';
import { getDriverImage } from '../utils/imageMapper';
import API_BASE_URL from '../config/api';

const SessionResults = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [round, setRound] = useState(1);
  const [sessionType, setSessionType] = useState('R');
  const [results, setResults] = useState(null);
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

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/session/${year}/${round}/${sessionType}`
      );
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPositionClass = (position) => {
    if (position === 1) return 'p1';
    if (position === 2) return 'p2';
    if (position === 3) return 'p3';
    return 'other';
  };

  return (
    <div className="page-container">
      <h2 className="page-title">
        <Trophy size={32} />
        Session Results
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
          <label>&nbsp;</label>
          <button onClick={fetchResults} className="btn-primary">
            Load Results
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading results...</div>}
      {error && <div className="error">Error: {error}</div>}

      {results && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Driver</th>
                <th>Team</th>
                <th>Grid</th>
                <th>Time/Status</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {results.results.map((driver, index) => (
                <tr key={index}>
                  <td>
                    <span className={`position-badge ${getPositionClass(driver.position)}`}>
                      {driver.position || '-'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {getDriverImage(driver.abbreviation, driver.team_name) && (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          border: '2px solid #E10600',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          background: '#1A1A24'
                        }}>
                          <img 
                            src={getDriverImage(driver.abbreviation, driver.team_name)} 
                            alt={driver.full_name}
                            style={{
                              width: '120%',
                              height: 'auto',
                              objectFit: 'cover',
                              objectPosition: 'center 15%',
                              marginTop: '-5px'
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <strong>{driver.abbreviation}</strong>
                        <br />
                        <small style={{ color: '#666' }}>{driver.full_name}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {driver.team_color && (
                        <div
                          style={{
                            width: '4px',
                            height: '30px',
                            background: `#${driver.team_color}`,
                            borderRadius: '2px'
                          }}
                        />
                      )}
                      {driver.team_name}
                    </div>
                  </td>
                  <td>{driver.grid_position || '-'}</td>
                  <td>{driver.time || driver.status}</td>
                  <td><strong>{driver.points}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionResults;
