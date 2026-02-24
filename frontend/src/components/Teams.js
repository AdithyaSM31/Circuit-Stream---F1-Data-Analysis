import React, { useState, useEffect } from 'react';
import { axios } from '../config/api';
import { Car, Users } from 'lucide-react';
import { getTeamCarImage, getDriverImage } from '../utils/imageMapper';
import API_BASE_URL from '../config/api';
import './Teams.css';

const Teams = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/drivers/${year}`);
      
      // Group drivers by team
      const teamMap = {};
      response.data.drivers.forEach(driver => {
        if (!teamMap[driver.team_name]) {
          teamMap[driver.team_name] = {
            teamName: driver.team_name,
            teamColor: driver.team_color,
            drivers: []
          };
        }
        teamMap[driver.team_name].drivers.push(driver);
      });
      
      const teamsArray = Object.values(teamMap);
      setDrivers(teamsArray);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (newYear) => {
    setYear(newYear);
  };

  const handleFetch = () => {
    fetchDrivers();
  };

  return (
    <div className="page-container">
      <h2 className="page-title">
        <Car size={32} />
        F1 Teams & Drivers
      </h2>

      <div className="controls">
        <div className="control-group">
          <label>Year</label>
          <select value={year} onChange={(e) => handleYearChange(parseInt(e.target.value))}>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>&nbsp;</label>
          <button onClick={handleFetch} className="btn-primary">
            Load Teams
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading teams...</div>}
      {error && <div className="error">Error: {error}</div>}

      {drivers.length > 0 && (
        <div className="teams-grid">
          {drivers.map((team, index) => (
            <div key={index} className="team-card">
              <div 
                className="team-header"
                style={{ 
                  borderTopColor: team.teamColor ? `#${team.teamColor}` : '#E10600' 
                }}
              >
                <h3 className="team-name">{team.teamName}</h3>
                {getTeamCarImage(team.teamName, year) && (
                  <div className="team-car-container">
                    <img 
                      src={getTeamCarImage(team.teamName, year)} 
                      alt={`${team.teamName} Car`}
                      className="team-car-image"
                    />
                  </div>
                )}
              </div>
              
              <div className="team-drivers">
                <div className="drivers-header">
                  <Users size={20} />
                  <span>Drivers</span>
                </div>
                {team.drivers.map((driver, driverIndex) => (
                  <div key={driverIndex} className="driver-item">
                    {getDriverImage(driver.abbreviation, team.teamName, year) && (
                      <img 
                        src={getDriverImage(driver.abbreviation, team.teamName, year)} 
                        alt={driver.full_name}
                        className="driver-image"
                      />
                    )}
                    <div className="driver-info">
                      <div className="driver-name">{driver.full_name}</div>
                      <div className="driver-details">
                        <span className="driver-code">{driver.abbreviation}</span>
                        <span className="driver-number">#{driver.number}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
