# F1 Image Assets Integration

## Overview
Successfully integrated AVIF format images for F1 cars, drivers, and circuits throughout the web application.

## Image Directories

### 1. **Car Images** (`/images/cars/`)
- **Location**: `frontend/public/images/cars/`
- **Format**: AVIF
- **Count**: 10 team cars (2025 season)
- **Files**:
  - 2025alpinecarright.avif
  - 2025astonmartincarright.avif
  - 2025ferraricarright.avif
  - 2025haascarright.avif
  - 2025kicksaubercarright.avif
  - 2025mclarencarright.avif
  - 2025mercedescarright.avif
  - 2025racingbullscarright.avif
  - 2025redbullracingcarright.avif
  - 2025williamscarright.avif

### 2. **Driver Images** (`/images/drivers/`)
- **Location**: `frontend/public/images/drivers/`
- **Format**: AVIF
- **Count**: 20 drivers (2025 season)
- **Teams Covered**: All 10 F1 teams with 2 drivers each
- **Naming Convention**: `2025{team}{drivercode}right.avif`

### 3. **Circuit Images** (`/images/circuits/`)
- **Location**: `frontend/public/images/circuits/`
- **Format**: AVIF
- **Count**: 24 circuits
- **Files**:
  - Abu_Dhabi_Circuit.avif
  - Australia_Circuit.avif
  - Austria_Circuit.avif
  - Bahrain_Circuit.avif
  - Baku_Circuit.avif
  - Belgium_Circuit.avif
  - Brazil_Circuit.avif
  - Canada_Circuit.avif
  - China_Circuit.avif
  - Emilia_Romagna_Circuit.avif
  - Great_Britain_Circuit.avif
  - Hungary_Circuit.avif
  - Italy_Circuit.avif
  - Japan_Circuit.avif
  - Las_Vegas_Circuit.avif
  - Mexico_Circuit.avif
  - Miami_Circuit.avif
  - Monaco_Circuit.avif
  - Netherlands_Circuit.avif
  - Qatar_Circuit.avif
  - Saudi_Arabia_Circuit.avif
  - Singapore_Circuit.avif
  - Spain_Circuit.avif
  - USA_Circuit.avif

## Utility Functions

### Image Mapper (`src/utils/imageMapper.js`)

#### 1. `getTeamCarImage(teamName)`
Maps team names to car images.
```javascript
getTeamCarImage('Ferrari') // Returns: '/images/cars/2025ferraricarright.avif'
```

#### 2. `getDriverImage(driverCode, teamName)`
Maps driver abbreviation codes to driver images.
```javascript
getDriverImage('VER', 'Red Bull Racing') 
// Returns: '/images/drivers/2025redbullracingmaxver01right.avif'
```

#### 3. `getCircuitImage(circuitName)`
Maps official circuit names to circuit images.
```javascript
getCircuitImage('Circuit de Monaco') 
// Returns: '/images/circuits/Monaco_Circuit.avif'
```

#### 4. `getCircuitImageByCountry(country)`
Alternative method using country names.
```javascript
getCircuitImageByCountry('Monaco') 
// Returns: '/images/circuits/Monaco_Circuit.avif'
```

## Component Integrations

### 1. **Dashboard Component** (`src/components/Dashboard.js`)
- **Feature**: Hero section with circuit background
- **Implementation**: Circuit image displayed behind current/upcoming Grand Prix hero section
- **Styling**: 
  - Opacity: 0.3
  - Filter: brightness(0.6) contrast(1.2)
  - Full-width background with overlay

### 2. **Teams Component** (`src/components/Teams.js`) - NEW
- **Feature**: Complete teams showcase
- **Images Used**:
  - Team car images in header section
  - Driver portrait images for each driver
- **Layout**: Grid of team cards with:
  - Team name and color
  - Team car image
  - Driver portraits with names and numbers
- **Styling**: Formula1 font, F1 red theme, hover effects
- **Route**: `/teams`

### 3. **Session Results Component** (`src/components/SessionResults.js`)
- **Feature**: Driver portraits in results table
- **Implementation**: 
  - 50px circular driver images
  - Red border (2px solid #E10600)
  - Displayed alongside driver name and abbreviation
- **Layout**: Flex layout with image + driver info

### 4. **Event Schedule Component** (`src/components/EventSchedule.js`)
- **Feature**: Circuit images in event cards
- **Implementation**: 
  - 150px height circuit preview
  - Contained object-fit
  - Light red background
- **Layout**: Image at top of each event card

### 5. **Circuit Info Component** (`src/components/CircuitInfo.js`)
- **Feature**: Large circuit display
- **Implementation**: 
  - Full-width circuit image (max 500px height)
  - Dark background with gradient
  - Location and country header
- **Styling**: Centered, contained, with padding

## CSS Styling

### Teams Component Styles (`src/components/Teams.css`)
```css
- .teams-grid: Grid layout for team cards
- .team-card: Individual team card with hover effects
- .team-car-image: Car image with drop shadow and scale animation
- .driver-image: Circular driver portraits with red border
- Responsive design for mobile devices
```

### Dashboard Updates (`src/components/Dashboard.css`)
```css
- .hero-circuit-image: Full background circuit image
- Position: absolute, covers entire hero section
- Z-index layering for proper overlay effect
```

## Driver Code Mapping

### Complete 2025 Driver List:
- **Alpine**: GAS (Gasly), COL (Colapinto)
- **Aston Martin**: ALO (Alonso), STR (Stroll)
- **Ferrari**: LEC (Leclerc), HAM (Hamilton)
- **Haas**: OCO (Ocon), BEA (Bearman)
- **Kick Sauber**: BOT (Bottas), HUL (Hülkenberg)
- **McLaren**: NOR (Norris), PIA (Piastri)
- **Mercedes**: ANT (Antonelli), RUS (Russell)
- **Racing Bulls**: HAD (Hadjar), LAW (Lawson)
- **Red Bull Racing**: VER (Verstappen), TSU (Tsunoda)
- **Williams**: ALB (Albon), SAI (Sainz)

## Circuit Mapping

### Country-to-Circuit Mapping:
- Bahrain → Bahrain International Circuit
- Saudi Arabia → Jeddah Corniche Circuit
- Australia → Albert Park Grand Prix Circuit
- China → Shanghai International Circuit
- Miami → Miami International Autodrome
- Monaco → Circuit de Monaco
- Spain → Circuit de Barcelona-Catalunya
- Canada → Circuit Gilles Villeneuve
- Austria → Red Bull Ring
- Great Britain → Silverstone Circuit
- Hungary → Hungaroring
- Belgium → Circuit de Spa-Francorchamps
- Netherlands → Circuit Zandvoort
- Italy → Autodromo Nazionale di Monza
- Azerbaijan → Baku City Circuit
- Singapore → Marina Bay Street Circuit
- USA → Circuit of The Americas
- Mexico → Autódromo Hermanos Rodríguez
- Brazil → Autódromo José Carlos Pace
- Las Vegas → Las Vegas Street Circuit
- Qatar → Losail International Circuit
- Abu Dhabi → Yas Marina Circuit
- Japan → Suzuka Circuit

## AVIF Format Benefits

1. **File Size**: ~50% smaller than JPEG at same quality
2. **Quality**: Better compression and detail preservation
3. **Modern Format**: Supported by all modern browsers
4. **Performance**: Faster loading times for better UX

## Browser Support
- Chrome 85+
- Firefox 93+
- Safari 16+
- Edge 85+

## Performance Considerations

1. **Lazy Loading**: Images load only when needed
2. **Optimized Sizing**: Appropriate dimensions for each use case
3. **Caching**: Public folder ensures browser caching
4. **Fallback**: Graceful degradation if image not found

## Usage Examples

### In Components:
```javascript
import { getTeamCarImage, getDriverImage, getCircuitImageByCountry } from '../utils/imageMapper';

// Use in JSX
<img src={getTeamCarImage('Ferrari')} alt="Ferrari Car" />
<img src={getDriverImage('VER', 'Red Bull Racing')} alt="Max Verstappen" />
<img src={getCircuitImageByCountry('Monaco')} alt="Monaco Circuit" />
```

### Conditional Rendering:
```javascript
{getDriverImage(driver.abbreviation, driver.team_name) && (
  <img 
    src={getDriverImage(driver.abbreviation, driver.team_name)} 
    alt={driver.full_name}
  />
)}
```

## Future Enhancements

1. **Team Logos**: Add team logo images
2. **Helmet Designs**: Driver helmet images
3. **Tire Compounds**: Visual tire compound indicators
4. **Flag Icons**: Country flags for drivers/circuits
5. **Historical Cars**: Add previous season cars
6. **Circuit Variations**: Different circuit layouts

## File Structure
```
frontend/
  public/
    images/
      cars/
        ├── 2025alpinecarright.avif
        ├── 2025astonmartincarright.avif
        └── ... (8 more)
      drivers/
        ├── 2025alpinefracol01right.avif
        ├── 2025alpinepiegas01right.avif
        └── ... (18 more)
      circuits/
        ├── Abu_Dhabi_Circuit.avif
        ├── Australia_Circuit.avif
        └── ... (22 more)
  src/
    utils/
      imageMapper.js
    components/
      Dashboard.js (updated)
      Teams.js (new)
      SessionResults.js (updated)
      EventSchedule.js (updated)
      CircuitInfo.js (updated)
```

## Navigation Update

New **Teams** page added to main navigation:
- Icon: Car (from lucide-react)
- Route: `/teams`
- Position: Between Schedule and Results
- Component: `Teams.js`

---

**Total Images**: 54 AVIF files (10 cars + 20 drivers + 24 circuits)
**Integration Status**: ✅ Complete
**Theme Consistency**: F1 Red (#E10600) maintained throughout
**Responsive**: All images adapt to mobile/tablet/desktop
