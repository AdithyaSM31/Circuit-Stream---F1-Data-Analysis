import React, { useState } from 'react';
import { axios } from '../config/api';
import { Clock } from 'lucide-react';
import API_BASE_URL from '../config/api';
import LabStandby from './LabStandby';

const LapTiming = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [round, setRound] = useState(1);
  const [sessionType, setSessionType] = useState('R');
  const [driverNumber, setDriverNumber] = useState('');
  const [laps, setLaps] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');

  React.useEffect(() => {
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

  const fetchLaps = async () => {
    setLaps(null);
    setLoading(true);
    setError(null);
    try {
      const url = driverNumber
        ? `${API_BASE_URL}/api/laps/${year}/${round}/${sessionType}?driver=${driverNumber}`
        : `${API_BASE_URL}/api/laps/${year}/${round}/${sessionType}`;
      
      const response = await axios.get(url);
      setLaps(response.data);
      setPage(0);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-container">
      <div className="premium-header">
        <div className="header-title">
          <Clock size={32} color="#E10600" />
          <h1>Lap Timing Data</h1>
        </div>
        <div className="year-selector" style={{ display: 'flex', gap: '1rem' }}>
          <select aria-label="Season" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select aria-label="Grand Prix"
            value={selectedEvent} 
            onChange={(e) => handleEventChange(e.target.value)}
          >
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
          <select aria-label="Session" value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
            <option value="R">Race</option>
            <option value="Q">Qualifying</option>
            <option value="S">Sprint</option>
            <option value="FP1">Practice 1</option>
            <option value="FP2">Practice 2</option>
            <option value="FP3">Practice 3</option>
          </select>
          <input
            type="text"
            aria-label="Driver number (optional)"
            value={driverNumber}
            onChange={(e) => setDriverNumber(e.target.value)}
            placeholder="Driver # (e.g. 1)"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontFamily: 'inherit',
              width: '180px'
            }}
          />
          <button onClick={fetchLaps} className="premium-btn">
            Load Laps
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading lap data...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!laps && !loading && !error && <LabStandby mode="laps" />}

      {laps && (
        <div>
          <p style={{ marginBottom: '1rem', color: '#829b86' }}>
            Recorded laps: {laps.total_laps} · {laps.source || 'FastF1'}
            {laps.driver_filter && ` (Driver #${laps.driver_filter})`}
          </p>
          
          {laps.total_laps > 100 && <div className="year-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button className="premium-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page + 1} of {Math.ceil(laps.total_laps / 100)}</span>
            <button className="premium-btn" disabled={(page + 1) * 100 >= laps.total_laps} onClick={() => setPage(page + 1)}>Next</button>
          </div>}
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
                  {laps.source !== 'OpenF1' && <th>PB</th>}
                </tr>
              </thead>
              <tbody>
                {laps.laps.slice(page * 100, (page + 1) * 100).map((lap, index) => (
                  <tr key={index} className={lap.is_personal_best ? 'personal-best-row' : ''}>
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
                    <td>{lap.tyre_life ?? '-'}</td>
                    <td>{lap.stint}</td>
                    {laps.source !== 'OpenF1' && <td>{lap.is_personal_best ? '✓' : ''}</td>}
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
