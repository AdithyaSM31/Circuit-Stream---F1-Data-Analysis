// Image mapper utility for F1 assets

// Team name mapping to car image filenames
export const getTeamCarImage = (teamName) => {
  const teamMap = {
    'Alpine F1 Team': 'alpine',
    'Aston Martin': 'astonmartin',
    'Ferrari': 'ferrari',
    'Haas F1 Team': 'haas',
    'Kick Sauber': 'kicksauber',
    'McLaren': 'mclaren',
    'Mercedes': 'mercedes',
    'RB F1 Team': 'racingbulls',
    'Racing Bulls': 'racingbulls',
    'Red Bull Racing': 'redbullracing',
    'Williams': 'williams'
  };

  const teamKey = teamMap[teamName] || teamName.toLowerCase().replace(/\s+/g, '');
  return `/images/cars/2025${teamKey}carright.avif`;
};

// Driver code mapping to driver image filenames
export const getDriverImage = (driverCode, teamName) => {
  const driverMap = {
    // Alpine
    'GAS': { team: 'alpine', code: 'piegas01' },
    'COL': { team: 'alpine', code: 'fracol01' },
    'DOO': { team: 'alpine', code: 'fracol01' }, // Jack Doohan - using placeholder
    
    // Aston Martin
    'ALO': { team: 'astonmartin', code: 'feralo01' },
    'STR': { team: 'astonmartin', code: 'lanstr01' },
    
    // Ferrari
    'LEC': { team: 'ferrari', code: 'chalec01' },
    'HAM': { team: 'ferrari', code: 'lewham01' },
    
    // Haas
    'OCO': { team: 'haas', code: 'estoco01' },
    'BEA': { team: 'haas', code: 'olibea01' },
    
    // Kick Sauber
    'BOT': { team: 'kicksauber', code: 'gabbor01' },
    'BOR': { team: 'kicksauber', code: 'gabbor01' }, // Gabriel Bortoleto
    'HUL': { team: 'kicksauber', code: 'nichul01' },
    
    // McLaren
    'NOR': { team: 'mclaren', code: 'lannor01' },
    'PIA': { team: 'mclaren', code: 'oscpia01' },
    
    // Mercedes
    'ANT': { team: 'mercedes', code: 'andant01' },
    'RUS': { team: 'mercedes', code: 'georus01' },
    
    // Racing Bulls
    'HAD': { team: 'racingbulls', code: 'isahad01' },
    'LAW': { team: 'racingbulls', code: 'lialaw01' },
    
    // Red Bull Racing
    'VER': { team: 'redbullracing', code: 'maxver01' },
    'TSU': { team: 'redbullracing', code: 'yuktsu01' },
    
    // Williams
    'ALB': { team: 'williams', code: 'alealb01' },
    'SAI': { team: 'williams', code: 'carsai01' }
  };

  const driver = driverMap[driverCode];
  if (driver) {
    return `/images/drivers/2025${driver.team}${driver.code}right.avif`;
  }
  return null;
};

// Circuit name mapping to circuit image filenames
export const getCircuitImage = (circuitName) => {
  const circuitMap = {
    'Bahrain International Circuit': 'Bahrain_Circuit.avif',
    'Jeddah Corniche Circuit': 'Saudi_Arabia_Circuit.avif',
    'Albert Park Grand Prix Circuit': 'Australia_Circuit.avif',
    'Shanghai International Circuit': 'China_Circuit.avif',
    'Miami International Autodrome': 'Miami_Circuit.avif',
    'Autodromo Enzo e Dino Ferrari': 'Emilia_Romagna_Circuit.avif',
    'Circuit de Monaco': 'Monaco_Circuit.avif',
    'Circuit de Barcelona-Catalunya': 'Spain_Circuit.avif',
    'Circuit Gilles Villeneuve': 'Canada_Circuit.avif',
    'Red Bull Ring': 'Austria_Circuit.avif',
    'Silverstone Circuit': 'Great_Britain_Circuit.avif',
    'Hungaroring': 'Hungary_Circuit.avif',
    'Circuit de Spa-Francorchamps': 'Belgium_Circuit.avif',
    'Circuit Zandvoort': 'Netherlands_Circuit.avif',
    'Autodromo Nazionale di Monza': 'Italy_Circuit.avif',
    'Baku City Circuit': 'Baku_Circuit.avif',
    'Marina Bay Street Circuit': 'Singapore_Circuit.avif',
    'Circuit of The Americas': 'USA_Circuit.avif',
    'Autódromo Hermanos Rodríguez': 'Mexico_Circuit.avif',
    'Autódromo José Carlos Pace': 'Brazil_Circuit.avif',
    'Las Vegas Street Circuit': 'Las_Vegas_Circuit.avif',
    'Losail International Circuit': 'Qatar_Circuit.avif',
    'Yas Marina Circuit': 'Abu_Dhabi_Circuit.avif',
    'Suzuka Circuit': 'Japan_Circuit.avif'
  };

  const circuitFile = circuitMap[circuitName];
  if (circuitFile) {
    return `/images/circuits/${circuitFile}`;
  }
  return null;
};

// Get country-based circuit image (alternative method)
export const getCircuitImageByCountry = (country) => {
  const countryMap = {
    'Bahrain': 'Bahrain_Circuit.avif',
    'Saudi Arabia': 'Saudi_Arabia_Circuit.avif',
    'Australia': 'Australia_Circuit.avif',
    'China': 'China_Circuit.avif',
    'Miami': 'Miami_Circuit.avif',
    'Emilia Romagna': 'Emilia_Romagna_Circuit.avif',
    'Monaco': 'Monaco_Circuit.avif',
    'Spain': 'Spain_Circuit.avif',
    'Canada': 'Canada_Circuit.avif',
    'Austria': 'Austria_Circuit.avif',
    'Great Britain': 'Great_Britain_Circuit.avif',
    'UK': 'Great_Britain_Circuit.avif',
    'United Kingdom': 'Great_Britain_Circuit.avif',
    'Hungary': 'Hungary_Circuit.avif',
    'Belgium': 'Belgium_Circuit.avif',
    'Netherlands': 'Netherlands_Circuit.avif',
    'Italy': 'Italy_Circuit.avif',
    'Azerbaijan': 'Baku_Circuit.avif',
    'Singapore': 'Singapore_Circuit.avif',
    'United States': 'USA_Circuit.avif',
    'USA': 'USA_Circuit.avif',
    'Mexico': 'Mexico_Circuit.avif',
    'Brazil': 'Brazil_Circuit.avif',
    'Las Vegas': 'Las_Vegas_Circuit.avif',
    'Qatar': 'Qatar_Circuit.avif',
    'Abu Dhabi': 'Abu_Dhabi_Circuit.avif',
    'UAE': 'Abu_Dhabi_Circuit.avif',
    'United Arab Emirates': 'Abu_Dhabi_Circuit.avif',
    'Japan': 'Japan_Circuit.avif'
  };

  const circuitFile = countryMap[country];
  if (circuitFile) {
    return `/images/circuits/${circuitFile}`;
  }
  return null;
};
