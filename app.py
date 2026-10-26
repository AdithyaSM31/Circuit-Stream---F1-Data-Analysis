"""
F1 Data Analysis Web Application - Main Backend
Real-time Formula 1 data using FastF1 library
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import fastf1
import fastf1.core
import pandas as pd
from datetime import datetime, timezone
import logging
import os
import requests
from telemetry_service import historical_telemetry, session_drivers, TelemetryUnavailable
import archive_service
# Create cache directory if it doesn't exist
cache_dir = 'cache'
if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)
    print(f"Created cache directory: {cache_dir}")

# Enable FastF1 cache for better performance
fastf1.Cache.enable_cache(cache_dir)

# Configure Flask to serve the React frontend build directory
app = Flask(__name__, static_folder='frontend/build', static_url_path='/')

# Configure CORS for production - Allow all origins with credentials
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     allow_headers="*",
     methods=["GET", "POST", "OPTIONS"],
     supports_credentials=False)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.errorhandler(TelemetryUnavailable)
def handle_telemetry_unavailable(error):
    logger.warning('Timing archive unavailable: %s (%s)', error, error.code)
    response = jsonify({'error': str(error), 'code': error.code})
    if error.status == 503:
        response.headers['Retry-After'] = '60'
    return response, error.status


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'F1 Data API is running'})


@app.route('/api/schedule/<int:year>', methods=['GET'])
def get_schedule(year):
    """
    Get event schedule for a specific year
    Returns: event names, countries, locations, dates, scheduled times
    """
    try:
        schedule = fastf1.get_event_schedule(year)
        
        # Convert to dictionary format
        events = []
        for idx, event in schedule.iterrows():
            # Skip pre-season testing (RoundNumber 0)
            if pd.notna(event['RoundNumber']) and int(event['RoundNumber']) == 0:
                continue
                
            # Helper function to convert datetime to UTC ISO format
            def format_utc_datetime(dt):
                if pd.notna(dt):
                    # If datetime is timezone-aware, convert to UTC
                    if hasattr(dt, 'tzinfo') and dt.tzinfo is not None:
                        dt_utc = dt.astimezone(timezone.utc)
                    else:
                        # Assume it's already UTC if no timezone info
                        dt_utc = dt.replace(tzinfo=timezone.utc)
                    return dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
                return None
            
            event_data = {
                'round_number': int(event['RoundNumber']) if pd.notna(event['RoundNumber']) else None,
                'country': event['Country'],
                'location': event['Location'],
                'event_name': event['EventName'],
                'event_date': event['EventDate'].strftime('%Y-%m-%d') if pd.notna(event['EventDate']) else None,
                'event_format': event['EventFormat'],
                'session1': event['Session1'] if pd.notna(event['Session1']) else None,
                'session1_date': format_utc_datetime(event['Session1Date']),
                'session2': event['Session2'] if pd.notna(event['Session2']) else None,
                'session2_date': format_utc_datetime(event['Session2Date']),
                'session3': event['Session3'] if pd.notna(event['Session3']) else None,
                'session3_date': format_utc_datetime(event['Session3Date']),
                'session4': event['Session4'] if pd.notna(event['Session4']) else None,
                'session4_date': format_utc_datetime(event['Session4Date']),
                'session5': event['Session5'] if pd.notna(event['Session5']) else None,
                'session5_date': format_utc_datetime(event['Session5Date']),
            }
            events.append(event_data)
        
        return jsonify({
            'year': year,
            'events': events,
            'total_events': len(events)
        })
    except Exception as e:
        logger.error(f"Error fetching schedule: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/event/<int:year>/<int:round_number>', methods=['GET'])
def get_event(year, round_number):
    """Get specific event details"""
    try:
        event = fastf1.get_event(year, round_number)
        
        event_data = {
            'event_name': event['EventName'],
            'country': event['Country'],
            'location': event['Location'],
            'event_date': event['EventDate'].strftime('%Y-%m-%d') if pd.notna(event['EventDate']) else None,
            'event_format': event['EventFormat'],
        }
        
        return jsonify(event_data)
    except Exception as e:
        logger.error(f"Error fetching event: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/session/<int:year>/<int:round_number>/<session_type>', methods=['GET'])
def get_session_results(year, round_number, session_type):
    """
    Get session results (Race, Qualifying, Practice, Sprint)
    Returns: driver names, team names, positions, points, status
    """
    if year >= 2023:
        return jsonify(archive_service.results(year, round_number, session_type))
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load(laps=False, telemetry=False, weather=False, messages=False)
        
        results = session.results
        if len(results) == 0:
            return jsonify({'error': 'Session results are not available yet.'}), 404
        
        drivers = []
        for idx, driver in results.iterrows():
            driver_data = {
                'position': int(driver['Position']) if pd.notna(driver['Position']) else None,
                'driver_number': str(driver['DriverNumber']),
                'abbreviation': driver['Abbreviation'],
                'full_name': driver['FullName'],
                'team_name': driver['TeamName'],
                'team_color': driver['TeamColor'] if pd.notna(driver['TeamColor']) else None,
                'grid_position': int(driver['GridPosition']) if pd.notna(driver['GridPosition']) else None,
                'points': float(driver['Points']) if pd.notna(driver['Points']) else 0,
                'status': driver['Status'] if pd.notna(driver['Status']) else None,
                'time': str(driver['Time']) if pd.notna(driver['Time']) else None,
            }
            drivers.append(driver_data)
        
        return jsonify({
            'year': year,
            'round': round_number,
            'session_type': session_type,
            'results': drivers
        })
    except Exception as e:
        logger.error(f"Error fetching session results: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/laps/<int:year>/<int:round_number>/<session_type>', methods=['GET'])
def get_laps(year, round_number, session_type):
    """
    Get lap timing data
    Returns: sector times, lap times, pit stops, tyre data
    """
    if year >= 2023:
        return jsonify(archive_service.laps(year, round_number, session_type, request.args.get('driver')))
    try:
        driver_number = request.args.get('driver', None)
        
        session = fastf1.get_session(year, round_number, session_type)
        session.load()
        
        if len(session.laps) == 0:
            return jsonify({'error': 'Lap data is not available for this session yet.'}), 404
            
        if driver_number:
            try:
                laps = session.laps.pick_driver(driver_number)
            except ValueError:
                return jsonify({'error': f'Driver {driver_number} not found in this session.'}), 404
        else:
            laps = session.laps
        
        # Limit to first 100 laps for performance
        laps = laps.head(100)
        
        def format_timedelta(td):
            if pd.isna(td):
                return None
            total_seconds = td.total_seconds()
            minutes = int(total_seconds // 60)
            seconds = total_seconds % 60
            if minutes > 0:
                return f"{minutes}:{seconds:06.3f}"
            else:
                return f"{seconds:06.3f}"
        
        lap_data = []
        for idx, lap in laps.iterrows():
            lap_info = {
                'time': str(lap['Time']) if pd.notna(lap['Time']) else None,
                'driver': lap['Driver'],
                'driver_number': str(lap['DriverNumber']),
                'lap_time': format_timedelta(lap['LapTime']),
                'lap_number': int(lap['LapNumber']) if pd.notna(lap['LapNumber']) else None,
                'stint': int(lap['Stint']) if pd.notna(lap['Stint']) else None,
                'pit_out_time': str(lap['PitOutTime']) if pd.notna(lap['PitOutTime']) else None,
                'pit_in_time': str(lap['PitInTime']) if pd.notna(lap['PitInTime']) else None,
                'sector1_time': format_timedelta(lap['Sector1Time']),
                'sector2_time': format_timedelta(lap['Sector2Time']),
                'sector3_time': format_timedelta(lap['Sector3Time']),
                'compound': lap['Compound'] if pd.notna(lap['Compound']) else None,
                'tyre_life': int(lap['TyreLife']) if pd.notna(lap['TyreLife']) else None,
                'track_status': str(lap['TrackStatus']) if pd.notna(lap['TrackStatus']) else None,
                'is_personal_best': bool(lap['IsPersonalBest']) if pd.notna(lap['IsPersonalBest']) else False,
            }
            lap_data.append(lap_info)
        
        return jsonify({
            'year': year,
            'round': round_number,
            'session_type': session_type,
            'driver_filter': driver_number,
            'laps': lap_data,
            'total_laps': len(lap_data)
        })
    except Exception as e:
        logger.error(f"Error fetching laps: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/telemetry/<int:year>/<int:round_number>/<session_type>/<driver_number>/<int:lap_number>', methods=['GET'])
def get_telemetry(year, round_number, session_type, driver_number, lap_number):
    """
    Get telemetry data for a specific lap
    Returns: speed, rpm, gear, throttle, brake, DRS
    """
    if year >= 2023:
        return jsonify(historical_telemetry(year, round_number, session_type,
                                           driver_number, lap_number,
                                           driver_code=request.args.get('driver_code')))
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load(laps=True, telemetry=True, weather=False, messages=False)
        
        if len(session.laps) == 0:
            return jsonify({'error': 'Telemetry data is not available for this session yet.'}), 404
            
        try:
            lap = session.laps.pick_drivers(driver_number).pick_laps(lap_number)
        except ValueError:
            return jsonify({'error': f'Driver {driver_number} or lap {lap_number} not found.'}), 404
            
        if len(lap) == 0:
            return jsonify({'error': 'This lap was not recorded for the selected driver.'}), 404

        telemetry = lap.get_car_data()
        
        if len(telemetry) == 0:
            return jsonify({'error': 'Car data is not available for this lap.'}), 404
        
        # Sample telemetry to reduce data size (every 10th point)
        telemetry = telemetry.iloc[::10]
        
        telemetry_data = []
        for idx, row in telemetry.iterrows():
            data_point = {
                'session_time': str(row['SessionTime']) if pd.notna(row['SessionTime']) else None,
                'speed': int(row['Speed']) if pd.notna(row['Speed']) else None,
                'rpm': int(row['RPM']) if pd.notna(row['RPM']) else None,
                'gear': int(row['nGear']) if pd.notna(row['nGear']) else None,
                'throttle': int(row['Throttle']) if pd.notna(row['Throttle']) else None,
                'brake': bool(row['Brake']) if pd.notna(row['Brake']) else False,
                'drs': int(row['DRS']) if pd.notna(row['DRS']) else None,
            }
            telemetry_data.append(data_point)
        
        return jsonify({
            'year': year,
            'round': round_number,
            'session_type': session_type,
            'driver': driver_number,
            'lap_number': lap_number,
            'telemetry': telemetry_data,
            'data_points': len(telemetry_data),
            'source': 'FastF1'
        })
    except Exception as e:
        logger.error(f"Error fetching telemetry: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/race-control/<int:year>/<int:round_number>/<session_type>', methods=['GET'])
def get_race_control_messages(year, round_number, session_type):
    """
    Get race control messages
    Returns: investigations, penalties, restart announcements
    """
    if year >= 2023:
        return jsonify(archive_service.race_control(year, round_number, session_type))
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load()
        
        race_control = session.race_control_messages
        if len(race_control) == 0:
            return jsonify({'error': 'Race control messages are not available yet.'}), 404
        
        messages = []
        for idx, msg in race_control.iterrows():
            message_data = {
                'time': str(msg['Time']) if pd.notna(msg['Time']) else None,
                'category': msg['Category'] if pd.notna(msg['Category']) else None,
                'message': msg['Message'] if pd.notna(msg['Message']) else None,
                'flag': msg['Flag'] if pd.notna(msg['Flag']) else None,
                'scope': msg['Scope'] if pd.notna(msg['Scope']) else None,
                'sector': str(msg['Sector']) if pd.notna(msg['Sector']) else None,
            }
            messages.append(message_data)
        
        return jsonify({
            'year': year,
            'round': round_number,
            'session_type': session_type,
            'messages': messages,
            'total_messages': len(messages)
        })
    except Exception as e:
        logger.error(f"Error fetching race control messages: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/circuit/<int:year>/<int:round_number>', methods=['GET'])
def get_circuit_info(year, round_number):
    """
    Get circuit information
    Returns: corner numbers, marshall sectors, track markers, lap length, event info
    """
    return jsonify(archive_service.circuit(year, round_number))


@app.route('/api/drivers/<int:year>/<int:round_number>/<session_type>', methods=['GET'])
def get_drivers(year, round_number, session_type):
    """Return the actual roster of the selected session, including seasonal number changes."""
    if year >= 2023:
        drivers = session_drivers(year, round_number, session_type)
        return jsonify({'year': year, 'round': round_number, 'session_type': session_type,
                        'drivers': drivers, 'source': 'OpenF1'})
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load(laps=False, telemetry=False, weather=False, messages=False)
        drivers = []
        for _, driver in session.results.iterrows():
            number = str(driver['DriverNumber'])
            drivers.append({'number': number, 'driver_number': number,
                            'abbreviation': driver['Abbreviation'],
                            'full_name': driver['FullName'], 'team_name': driver['TeamName'],
                            'team_color': driver['TeamColor'] if pd.notna(driver['TeamColor']) else None})
        return jsonify({'year': year, 'round': round_number, 'session_type': session_type,
                        'drivers': drivers, 'source': 'FastF1'})
    except Exception:
        logger.exception('Could not load the session roster')
        return jsonify({'error': 'The driver roster could not be loaded. Try again shortly.'}), 502


@app.route('/api/current-event', methods=['GET'])
def get_current_event():
    """Get the current or next upcoming event"""
    try:
        current_year = datetime.now().year
        schedule = fastf1.get_event_schedule(current_year)
        
        now = datetime.now()
        
        # Find current or next event
        for idx, event in schedule.iterrows():
            if pd.notna(event['EventDate']):
                event_date = event['EventDate']
                days_diff = (event_date - now).days
                
                # If event is within 7 days (past or future), consider it current
                if -3 <= days_diff <= 7:
                    event_data = {
                        'round_number': int(event['RoundNumber']) if pd.notna(event['RoundNumber']) else None,
                        'country': event['Country'],
                        'location': event['Location'],
                        'event_name': event['EventName'],
                        'event_date': event['EventDate'].strftime('%Y-%m-%d') if pd.notna(event['EventDate']) else None,
                        'event_format': event['EventFormat'],
                        'days_until': days_diff,
                        'session5_date': event['Session5Date'].strftime('%Y-%m-%d %H:%M:%S') if pd.notna(event['Session5Date']) else None,
                    }
                    return jsonify(event_data)
        
        # If no current event found, return next future event
        future_events = schedule[schedule['EventDate'] > now]
        if len(future_events) > 0:
            event = future_events.iloc[0]
            event_date = event['EventDate']
            days_diff = (event_date - now).days
            
            event_data = {
                'round_number': int(event['RoundNumber']) if pd.notna(event['RoundNumber']) else None,
                'country': event['Country'],
                'location': event['Location'],
                'event_name': event['EventName'],
                'event_date': event['EventDate'].strftime('%Y-%m-%d') if pd.notna(event['EventDate']) else None,
                'event_format': event['EventFormat'],
                'days_until': days_diff,
                'session5_date': event['Session5Date'].strftime('%Y-%m-%d %H:%M:%S') if pd.notna(event['Session5Date']) else None,
            }
            return jsonify(event_data)
        
        return jsonify({'error': 'No upcoming events found'}), 404
        
    except Exception as e:
        logger.error(f"Error fetching current event: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/drivers/<int:year>', methods=['GET'])
def get_all_drivers(year):
    """
    Get all drivers for a specific year (for Teams page)
    Returns: driver names, abbreviations, numbers, team names, and team colors
    """
    if year >= 2023:
        drivers = session_drivers(year, 1, 'R')
        return jsonify({'year': year, 'total_drivers': len(drivers),
                        'drivers': drivers, 'source': 'OpenF1'})
    try:
        # Get the first race of the season to extract driver info
        session = fastf1.get_session(year, 1, 'R')
        session.load(laps=False, telemetry=False, weather=False, messages=False)
        
        drivers_list = []
        
        # Get unique drivers from the session
        for driver_abbr in session.drivers:
            driver_info = session.get_driver(driver_abbr)
            
            # Extract driver details
            driver_data = {
                'abbreviation': driver_info.get('Abbreviation', driver_abbr),
                'full_name': driver_info['FullName'] if 'FullName' in driver_info else driver_abbr,
                'number': str(driver_info['DriverNumber']) if 'DriverNumber' in driver_info else 'N/A',
                'team_name': driver_info['TeamName'] if 'TeamName' in driver_info else 'Unknown',
                'team_color': driver_info['TeamColor'] if 'TeamColor' in driver_info else None
            }
            drivers_list.append(driver_data)
        
        # Sort by team name and then by driver number
        drivers_list.sort(key=lambda x: (x['team_name'], x['number']))
        
        return jsonify({
            'year': year,
            'total_drivers': len(drivers_list),
            'drivers': drivers_list
        })
        
    except Exception as e:
        logger.error(f"Error fetching drivers for year {year}: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/standings/drivers/<int:year>', methods=['GET'])
def get_driver_standings(year):
    """
    Get driver standings for a specific year from Jolpi API
    """
    try:
        response = requests.get(f'https://api.jolpi.ca/ergast/f1/{year}/driverStandings.json', timeout=10)
        response.raise_for_status()
        data = response.json()
        standings = data.get('MRData', {}).get('StandingsTable', {}).get('StandingsLists', [])
        
        if not standings:
            return jsonify({'error': 'Driver standings not found for this year'}), 404
            
        driver_standings = standings[0].get('DriverStandings', [])
        return jsonify({
            'year': year,
            'standings': driver_standings
        })
    except requests.RequestException as e:
        logger.error(f"Error fetching driver standings from Jolpi API: {str(e)}")
        return jsonify({'error': 'Failed to fetch driver standings from upstream API'}), 502
    except Exception as e:
        logger.error(f"Unexpected error fetching driver standings: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/standings/constructors/<int:year>', methods=['GET'])
def get_constructor_standings(year):
    """
    Get constructor standings for a specific year from Jolpi API
    """
    try:
        response = requests.get(f'https://api.jolpi.ca/ergast/f1/{year}/constructorStandings.json', timeout=10)
        response.raise_for_status()
        data = response.json()
        standings = data.get('MRData', {}).get('StandingsTable', {}).get('StandingsLists', [])
        
        if not standings:
            return jsonify({'error': 'Constructor standings not found for this year'}), 404
            
        constructor_standings = standings[0].get('ConstructorStandings', [])
        return jsonify({
            'year': year,
            'standings': constructor_standings
        })
    except requests.RequestException as e:
        logger.error(f"Error fetching constructor standings from Jolpi API: {str(e)}")
        return jsonify({'error': 'Failed to fetch constructor standings from upstream API'}), 502
    except Exception as e:
        logger.error(f"Unexpected error fetching constructor standings: {str(e)}")
        return jsonify({'error': str(e)}), 500


# Serve React App
@app.route('/')
def serve():
    return app.send_static_file('index.html')

# Catch-all route to support React Router
@app.errorhandler(404)
def not_found(e):
    # If the request is for an API route, return a JSON error
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Not found'}), 404
    # Otherwise, serve the React app
    return app.send_static_file('index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port)
