import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Telemetry = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [round, setRound] = useState(1);
  const [schedule, setSchedule] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [sessionType, setSessionType] = useState('R');
  const [driverNumber, setDriverNumber] = useState('1');
  const [lapNumber, setLapNumber] = useState('1');
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchedule();
    fetchDrivers();
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

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/drivers/${year}`);
      setDrivers(response.data.drivers);
      if (response.data.drivers.length > 0) {
        setSelectedDriver(response.data.drivers[0].number);
        setDriverNumber(response.data.drivers[0].number);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  const handleEventChange = (eventName) => {
    setSelectedEvent(eventName);
    const event = schedule.find(e => e.event_name === eventName);
    if (event) {
      setRound(event.round_number);
    }
  };

  const handleDriverChange = (driverNum) => {
    setSelectedDriver(driverNum);
    setDriverNumber(driverNum);
  };

  const fetchTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/telemetry/${year}/${round}/${sessionType}/${driverNumber}/${lapNumber}`
      );
      setTelemetry(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">
        <Activity size={32} />
        Telemetry Data
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
          <label>Driver</label>
          <select value={selectedDriver} onChange={(e) => handleDriverChange(e.target.value)}>
            {drivers && drivers.length > 0 ? (
              drivers.map((driver) => (
                <option key={driver.number} value={driver.number}>
                  {driver.full_name} (#{driver.number})
                </option>
              ))
            ) : (
              <option value="">Loading drivers...</option>
            )}
          </select>
        </div>
        <div className="control-group">
          <label>Lap Number</label>
          <input
            type="number"
            value={lapNumber}
            onChange={(e) => setLapNumber(e.target.value)}
            min="1"
          />
        </div>
        <div className="control-group">
          <label>&nbsp;</label>
          <button onClick={fetchTelemetry} className="btn-primary">
            Load Telemetry
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading telemetry data...</div>}
      {error && <div className="error">Error: {error}</div>}

      {telemetry && (
        <div>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Driver #{telemetry.driver} - Lap {telemetry.lap_number} - {telemetry.data_points} data points
          </p>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Speed (km/h)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={telemetry.telemetry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session_time" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="speed" stroke="#667eea" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>RPM</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={telemetry.telemetry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session_time" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'RPM', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rpm" stroke="#764ba2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Throttle & Gear</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={telemetry.telemetry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session_time" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="left" label={{ value: 'Throttle %', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Gear', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="throttle" stroke="#28a745" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="stepAfter" dataKey="gear" stroke="#ffc107" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="table-container" style={{ marginTop: '2rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Speed</th>
                  <th>RPM</th>
                  <th>Gear</th>
                  <th>Throttle</th>
                  <th>Brake</th>
                  <th>DRS</th>
                </tr>
              </thead>
              <tbody>
                {telemetry.telemetry.slice(0, 50).map((point, index) => (
                  <tr key={index}>
                    <td>{point.session_time}</td>
                    <td>{point.speed} km/h</td>
                    <td>{point.rpm}</td>
                    <td><strong>{point.gear}</strong></td>
                    <td>{point.throttle}%</td>
                    <td>{point.brake ? '🔴' : '⚪'}</td>
                    <td>{point.drs === 1 ? '✓' : '-'}</td>
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

export default Telemetry;
