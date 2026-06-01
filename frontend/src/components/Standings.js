import React, { useState, useEffect } from 'react';
import { Trophy, Users, AlertTriangle } from 'lucide-react';
import { axios } from '../config/api';
import API_BASE_URL from '../config/api';
import { getDriverImage, getTeamCarImage } from '../utils/imageMapper';
import './Standings.css';

const Standings = () => {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' or 'constructors'
  const [year, setYear] = useState(2026);
  const [dataCache, setDataCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cacheKey = `${activeTab}_${year}`;
  const standingsData = dataCache[cacheKey] || [];

  useEffect(() => {
    if (dataCache[cacheKey]) {
      setLoading(false);
      return; // Data already cached for this tab and year
    }
    fetchStandings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, year]);

  const fetchStandings = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = activeTab === 'drivers' 
        ? `${API_BASE_URL}/api/standings/drivers/${year}`
        : `${API_BASE_URL}/api/standings/constructors/${year}`;
        
      const response = await axios.get(endpoint);
      setDataCache(prev => ({ ...prev, [cacheKey]: response.data.standings }));
    } catch (err) {
      console.error(`Error fetching ${activeTab} standings:`, err);
      setError(`Failed to load ${activeTab} standings for ${year}.`);
    } finally {
      setLoading(false);
    }
  };

  const renderDriverStandings = () => {
    if (!loading && standingsData.length === 0) return <div className="no-data">No driver standings available.</div>;

    return (
      <div className="standings-list">
        {standingsData.map((standing) => {
          const driver = standing.Driver;
          if (!driver) return null;
          const constructor = standing.Constructors ? standing.Constructors[0] : null;
          const driverCode = driver.code || driver.familyName.substring(0, 3).toUpperCase();
          const teamName = constructor ? constructor.name : 'Unknown';
          const driverImage = getDriverImage(driverCode, teamName, year);

          return (
            <div key={driver.driverId} className={`standing-item position-${standing.position}`}>
              <div className="position-block">
                <span className="position">{standing.position}</span>
              </div>
              
              <div className="driver-info">
                <div className="driver-name">
                  <span className="given-name">{driver.givenName}</span>
                  <span className="family-name">{driver.familyName}</span>
                </div>
                <div className="team-name">{teamName}</div>
              </div>
              
              {driverImage && (
                <div className="driver-image-container">
                  <img src={driverImage} alt={`${driver.givenName} ${driver.familyName}`} className="driver-image" />
                </div>
              )}
              
              <div className="stats-block">
                <div className="stat">
                  <span className="stat-label">PTS</span>
                  <span className="stat-value">{standing.points}</span>
                </div>
                <div className="stat hide-mobile">
                  <span className="stat-label">WINS</span>
                  <span className="stat-value">{standing.wins}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderConstructorStandings = () => {
    if (!loading && standingsData.length === 0) return <div className="no-data">No constructor standings available.</div>;

    return (
      <div className="standings-list">
        {standingsData.map((standing) => {
          const constructor = standing.Constructor;
          if (!constructor) return null;
          const teamName = constructor.name;
          const carImage = getTeamCarImage(teamName, year);

          return (
            <div key={constructor.constructorId} className={`standing-item position-${standing.position}`}>
              <div className="position-block">
                <span className="position">{standing.position}</span>
              </div>
              
              <div className="constructor-info">
                <div className="family-name">{teamName}</div>
                <div className="team-name">{constructor.nationality}</div>
              </div>
              
              {carImage && (
                <div className="car-image-container">
                  <img src={carImage} alt={teamName} className="car-image" />
                </div>
              )}
              
              <div className="stats-block">
                <div className="stat">
                  <span className="stat-label">PTS</span>
                  <span className="stat-value">{standing.points}</span>
                </div>
                <div className="stat hide-mobile">
                  <span className="stat-label">WINS</span>
                  <span className="stat-value">{standing.wins}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="standings-container">
      <div className="standings-header">
        <div className="header-title">
          <Trophy size={32} color="#E10600" />
          <h1>World Championship Standings</h1>
        </div>
        <div className="year-selector">
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            <option value={2026}>2026 Season</option>
            <option value={2025}>2025 Season</option>
            <option value={2024}>2024 Season</option>
          </select>
        </div>
      </div>

      <div className="standings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'drivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('drivers')}
        >
          <Users size={18} />
          Driver Standings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'constructors' ? 'active' : ''}`}
          onClick={() => setActiveTab('constructors')}
        >
          <Trophy size={18} />
          Constructor Standings
        </button>
      </div>

      <div className="standings-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading {activeTab} standings...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertTriangle size={48} />
            <h2>Data Unavailable</h2>
            <p>{error}</p>
          </div>
        ) : (
          activeTab === 'drivers' ? renderDriverStandings() : renderConstructorStandings()
        )}
      </div>
    </div>
  );
};

export default Standings;