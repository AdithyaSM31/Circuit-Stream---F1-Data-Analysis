import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flag } from 'lucide-react';
import API_BASE_URL from '../config/api';

const RaceControl = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [round, setRound] = useState(1);
  const [schedule, setSchedule] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [sessionType, setSessionType] = useState('R');
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/race-control/${year}/${round}/${sessionType}`
      );
      setMessages(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Flag': '#ffc107',
      'SafetyCar': '#ff5722',
      'CarEvent': '#2196f3',
      'Drs': '#4caf50',
      'Other': '#9e9e9e'
    };
    return colors[category] || colors['Other'];
  };

  const getFlagEmoji = (flag) => {
    const flags = {
      'GREEN': '🟢',
      'YELLOW': '🟡',
      'RED': '🔴',
      'BLUE': '🔵',
      'WHITE': '⚪',
      'CHEQUERED': '🏁'
    };
    return flags[flag] || '';
  };

  return (
    <div className="page-container">
      <h2 className="page-title">
        <Flag size={32} />
        Race Control Messages
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
          <label>&nbsp;</label>
          <button onClick={fetchMessages} className="btn-primary">
            Load Messages
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading race control messages...</div>}
      {error && <div className="error">Error: {error}</div>}

      {messages && (
        <div>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Total Messages: {messages.total_messages}
          </p>

          <div className="data-grid">
            {messages.messages.map((msg, index) => (
              <div key={index} className="data-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {msg.flag && (
                      <span style={{ fontSize: '1.5rem' }}>
                        {getFlagEmoji(msg.flag)}
                      </span>
                    )}
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        background: getCategoryColor(msg.category),
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      {msg.category || 'N/A'}
                    </span>
                  </div>
                  <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: '500' }}>
                    {msg.time}
                  </span>
                </div>
                <p style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                  {msg.message}
                </p>
                {msg.scope && (
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>
                    Scope: <strong>{msg.scope}</strong>
                    {msg.sector && ` | Sector: ${msg.sector}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RaceControl;
