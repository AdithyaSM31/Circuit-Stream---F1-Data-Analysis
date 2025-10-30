import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  }, []);

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
      setError(err.message);
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
          <input
            type="number"
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            min="2018"
            max={new Date().getFullYear()}
          />
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
                {getTeamCarImage(team.teamName) && (
                  <div className="team-car-container">
                    <img 
                      src={getTeamCarImage(team.teamName)} 
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
                    {getDriverImage(driver.abbreviation, team.teamName) && (
                      <img 
                        src={getDriverImage(driver.abbreviation, team.teamName)} 
                        alt={driver.full_name}
                        className="driver-image"
                      />
                    )}
                    <div className="driver-info">
                      <div className="driver-name">{driver.full_name}</div>
                      <div className="driver-details">
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
