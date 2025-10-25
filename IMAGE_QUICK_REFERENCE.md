# Quick Reference: Image Assets

## 🏎️ How to Use Images in Components

### 1. Import the mapper utility
```javascript
import { getTeamCarImage, getDriverImage, getCircuitImageByCountry } from '../utils/imageMapper';
```

### 2. Get image paths

**Team Cars:**
```javascript
const carImage = getTeamCarImage('Ferrari');
// Returns: '/images/cars/2025ferraricarright.avif'
```

**Drivers:**
```javascript
const driverImage = getDriverImage('VER', 'Red Bull Racing');
// Returns: '/images/drivers/2025redbullracingmaxver01right.avif'
```

**Circuits:**
```javascript
const circuitImage = getCircuitImageByCountry('Monaco');
// Returns: '/images/circuits/Monaco_Circuit.avif'
```

### 3. Use in JSX with conditional rendering
```javascript
{getDriverImage(driver.code, driver.team) && (
  <img 
    src={getDriverImage(driver.code, driver.team)} 
    alt={driver.name}
    style={{ width: '50px', height: '50px', borderRadius: '50%' }}
  />
)}
```

## 📦 Available Images

### Teams (10)
- Alpine
- Aston Martin
- Ferrari
- Haas
- Kick Sauber
- McLaren
- Mercedes
- Racing Bulls (RB F1 Team)
- Red Bull Racing
- Williams

### Drivers (20)
| Code | Name | Team |
|------|------|------|
| ALB | Alexander Albon | Williams |
| ALO | Fernando Alonso | Aston Martin |
| ANT | Andrea Kimi Antonelli | Mercedes |
| BEA | Oliver Bearman | Haas |
| BOT | Valtteri Bottas | Kick Sauber |
| COL | Franco Colapinto | Alpine |
| GAS | Pierre Gasly | Alpine |
| HAD | Isack Hadjar | Racing Bulls |
| HAM | Lewis Hamilton | Ferrari |
| HUL | Nico Hülkenberg | Kick Sauber |
| LAW | Liam Lawson | Racing Bulls |
| LEC | Charles Leclerc | Ferrari |
| NOR | Lando Norris | McLaren |
| OCO | Esteban Ocon | Haas |
| PIA | Oscar Piastri | McLaren |
| RUS | George Russell | Mercedes |
| SAI | Carlos Sainz | Williams |
| STR | Lance Stroll | Aston Martin |
| TSU | Yuki Tsunoda | Red Bull Racing |
| VER | Max Verstappen | Red Bull Racing |

### Circuits (24)
1. Bahrain
2. Saudi Arabia
3. Australia
4. China
5. Miami
6. Emilia Romagna
7. Monaco
8. Spain
9. Canada
10. Austria
11. Great Britain
12. Hungary
13. Belgium
14. Netherlands
15. Italy
16. Azerbaijan (Baku)
17. Singapore
18. USA
19. Mexico
20. Brazil
20. Las Vegas
22. Qatar
23. Abu Dhabi
24. Japan

## 🎨 Styling Tips

### Driver Images (Circular)
```javascript
<img 
  src={getDriverImage(code, team)} 
  style={{
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '50%',
    border: '2px solid #E10600'
  }}
/>
```

### Car Images (Wide)
```javascript
<img 
  src={getTeamCarImage(team)} 
  style={{
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))'
  }}
/>
```

### Circuit Images (Background)
```javascript
<img 
  src={getCircuitImageByCountry(country)} 
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.3,
    filter: 'brightness(0.6) contrast(1.2)'
  }}
/>
```

## ✅ Pages with Images

1. **Dashboard** (`/`) - Circuit background in hero
2. **Teams** (`/teams`) - Team cars + driver portraits
3. **Schedule** (`/schedule`) - Circuit previews in event cards
4. **Results** (`/results`) - Driver portraits in table
5. **Circuit Info** (`/circuit`) - Full circuit display

## 🔍 Troubleshooting

**Image not showing?**
1. Check the file exists in `frontend/public/images/`
2. Verify the mapping in `imageMapper.js`
3. Check browser console for 404 errors
4. Ensure team/driver/country name matches exactly

**AVIF not supported?**
- All modern browsers support AVIF (Chrome 85+, Firefox 93+, Safari 16+)
- For older browsers, consider converting to WebP/JPEG fallbacks

**Wrong image displayed?**
- Check the driver code or team name spelling
- Verify 2025 season data is being used
- Check console for mapping errors
