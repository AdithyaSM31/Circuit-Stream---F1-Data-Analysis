import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, User, Car } from 'lucide-react';
import './Standings.css';
import API_BASE_URL from '../config/api';

const Standings = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' or 'constructors'

  const fetchStandings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all race results for the year and calculate standings
      const response = await axios.get(`${API_BASE_URL}/api/schedule/${year}`);
      const events = response.data.events;
      
      const driverPoints = {};
      const constructorPoints = {};
      
      // Process each completed race
      for (const event of events) {
        try {
          // Try to get race results (session5 is usually the race)
          const raceResponse = await axios.get(
            `${API_BASE_URL}/api/session/${year}/${event.round_number}/R`
          );
          
          if (raceResponse.data && raceResponse.data.results) {
            raceResponse.data.results.forEach(driver => {
              // Add driver points
              const driverName = driver.full_name;
              const teamName = driver.team_name;
              const points = parseFloat(driver.points) || 0;
              
              if (!driverPoints[driverName]) {
                driverPoints[driverName] = {
                  name: driverName,
                  team: teamName,
                  points: 0,
                  abbreviation: driver.abbreviation,
                  number: driver.driver_number
                };
              }
              driverPoints[driverName].points += points;
              
              // Add constructor points
              if (!constructorPoints[teamName]) {
                constructorPoints[teamName] = {
                  name: teamName,
                  points: 0,
                  color: driver.team_color
                };
              }
              constructorPoints[teamName].points += points;
            });
          }
        } catch (err) {
          // Race not completed yet or data not available
          console.log(`No results for round ${event.round_number}`);
        }
      }
      
      // Convert to arrays and sort by points
      const driversArray = Object.values(driverPoints).sort((a, b) => b.points - a.points);
      const constructorsArray = Object.values(constructorPoints).sort((a, b) => b.points - a.points);
      
      setDriverStandings(driversArray);
      setConstructorStandings(constructorsArray);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPositionColor = (position) => {
    if (position === 1) return '#FFD700'; // Gold
    if (position === 2) return '#C0C0C0'; // Silver
    if (position === 3) return '#CD7F32'; // Bronze
    return '#E10600'; // F1 Red
  };

  const getPositionIcon = (position) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '';
  };

  return (
    <div className="page-container">
      <h2 className="page-title">
        <Trophy size={32} />
        Championship Standings
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
          <label>&nbsp;</label>
          <button onClick={fetchStandings} className="btn-primary">
            Load Standings
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="standings-tabs">
        <button
          className={`tab-button ${activeTab === 'drivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('drivers')}
        >
          <User size={20} />
          <span>Driver Standings</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'constructors' ? 'active' : ''}`}
          onClick={() => setActiveTab('constructors')}
        >
          <Car size={20} />
          <span>Constructor Standings</span>
        </button>
      </div>

      {loading && <div className="loading">Loading standings...</div>}
      {error && <div className="error">Error: {error}</div>}

      {/* Driver Standings */}
      {activeTab === 'drivers' && driverStandings.length > 0 && (
        <div className="standings-container">
          <div className="standings-header">
            <div className="pos-col">Pos</div>
            <div className="driver-col">Driver</div>
            <div className="team-col">Team</div>
            <div className="points-col">Points</div>
          </div>
          
          {driverStandings.map((driver, index) => {
            const position = index + 1;
            return (
              <div
                key={index}
                className={`standings-row ${position <= 3 ? 'podium-position' : ''}`}
              >
                <div className="pos-col">
                  <span
                    className="position-badge"
                    style={{ backgroundColor: getPositionColor(position) }}
                  >
                    {getPositionIcon(position)} {position}
                  </span>
                </div>
                <div className="driver-col">
                  <div className="driver-info">
                    <span className="driver-number">#{driver.number}</span>
                    <span className="driver-name">{driver.name}</span>
                  </div>
                </div>
                <div className="team-col">
                  <span className="team-name">{driver.team}</span>
                </div>
                <div className="points-col">
                  <span className="points-value">{driver.points}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Constructor Standings */}
      {activeTab === 'constructors' && constructorStandings.length > 0 && (
        <div className="standings-container">
          <div className="standings-header">
            <div className="pos-col">Pos</div>
            <div className="constructor-col">Constructor</div>
            <div className="points-col">Points</div>
          </div>
          
          {constructorStandings.map((constructor, index) => {
            const position = index + 1;
            return (
              <div
                key={index}
                className={`standings-row ${position <= 3 ? 'podium-position' : ''}`}
              >
                <div className="pos-col">
                  <span
                    className="position-badge"
                    style={{ backgroundColor: getPositionColor(position) }}
                  >
                    {getPositionIcon(position)} {position}
                  </span>
                </div>
                <div className="constructor-col">
                  <div className="constructor-info">
                    {constructor.color && (
                      <span
                        className="team-color-indicator"
                        style={{ backgroundColor: `#${constructor.color}` }}
                      />
                    )}
                    <span className="constructor-name">{constructor.name}</span>
                  </div>
                </div>
                <div className="points-col">
                  <span className="points-value">{constructor.points}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && driverStandings.length === 0 && (
        <div className="no-data">No standings data available for {year}</div>
      )}
    </div>
  );
};

export default Standings;
