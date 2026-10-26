"""Session archive views that do not depend on the authenticated timing feed."""
import time
import fastf1
import requests
from telemetry_service import _query, _session, _normalise_driver, TelemetryUnavailable


def duration(value):
    if value is None:
        return None
    if isinstance(value, list):
        return ' / '.join(f'Q{i + 1} {duration(v) or "—"}' for i, v in enumerate(value))
    if isinstance(value, str):
        return value
    minutes, seconds = divmod(float(value), 60)
    hours, minutes = divmod(int(minutes), 60)
    return f'{hours}:{minutes:02d}:{seconds:06.3f}' if hours else f'{minutes}:{seconds:06.3f}'


def context(year, round_number, session_type):
    deadline = time.monotonic() + 22
    session = _session(year, round_number, session_type, deadline)
    params = {'session_key': session['session_key']}
    return deadline, params


def results(year, round_number, session_type):
    deadline, params = context(year, round_number, session_type)
    rows = _query('session_result', params, deadline)
    if not rows:
        raise TelemetryUnavailable('Results have not been published for this session yet.')
    roster = {str(d['driver_number']): _normalise_driver(d)
              for d in _query('drivers', params, deadline)}
    grid = {}
    if session_type in ('R', 'S'):
        try:
            grid = {str(d['driver_number']): d['position']
                    for d in _query('starting_grid', params, deadline)}
        except TelemetryUnavailable:
            pass  # Grid data is optional; the classification remains useful.
    data = []
    for row in rows:
        number = str(row['driver_number'])
        driver = roster.get(number, {'driver_number': number, 'full_name': number})
        status = next((label for flag, label in [('dsq', 'Disqualified'), ('dns', 'Did not start'),
                      ('dnf', 'Did not finish')] if row.get(flag)), 'Classified')
        data.append({**driver, 'position': row.get('position'), 'grid_position': grid.get(number),
                     'points': row.get('points'), 'status': status,
                     'time': status if status != 'Classified' else duration(row.get('duration'))})
    return {'year': year, 'round': round_number, 'session_type': session_type,
            'results': sorted(data, key=lambda d: d.get('position') or 999), 'source': 'OpenF1'}


def laps(year, round_number, session_type, identifier=None):
    deadline, params = context(year, round_number, session_type)
    roster = {str(d['driver_number']): _normalise_driver(d)
              for d in _query('drivers', params, deadline)}
    if identifier:
        match = next((d for n, d in roster.items()
                      if identifier.strip().upper() in (n, d['abbreviation'].upper())), None)
        if not match:
            raise TelemetryUnavailable('This driver is not in the selected session.', 404, 'driver_not_found')
        params = {**params, 'driver_number': match['driver_number']}
    rows = _query('laps', params, deadline)
    if not rows:
        raise TelemetryUnavailable('Lap timing has not been published for this session yet.')
    try:
        stints = _query('stints', params, deadline)
    except TelemetryUnavailable:
        stints = []
    data = []
    for row in rows:
        number = str(row['driver_number'])
        lap = row['lap_number']
        stint = next((s for s in stints if str(s['driver_number']) == number
                      and s.get('lap_start') is not None and s['lap_start'] <= lap <= (s.get('lap_end') or lap)), {})
        age = stint.get('tyre_age_at_start')
        data.append({'driver_number': number, 'driver': roster.get(number, {}).get('abbreviation', number),
                     'lap_number': lap, 'time': row.get('date_start'),
                     'lap_time': duration(row.get('lap_duration')),
                     'sector1_time': duration(row.get('duration_sector_1')),
                     'sector2_time': duration(row.get('duration_sector_2')),
                     'sector3_time': duration(row.get('duration_sector_3')),
                     'stint': stint.get('stint_number'), 'compound': stint.get('compound'),
                     'tyre_life': age + lap - stint['lap_start'] + 1 if age is not None else None,
                     'pit_out_time': None, 'pit_in_time': None, 'track_status': None,
                     'is_personal_best': False})
    return {'year': year, 'round': round_number, 'session_type': session_type,
            'driver_filter': identifier, 'laps': sorted(data, key=lambda d: (d['lap_number'], int(d['driver_number']))),
            'total_laps': len(data), 'source': 'OpenF1'}


def race_control(year, round_number, session_type):
    deadline, params = context(year, round_number, session_type)
    rows = _query('race_control', params, deadline)
    messages = [{'time': r.get('date'), **{k: r.get(k) for k in
                ('category', 'message', 'flag', 'scope', 'sector')}} for r in rows]
    return {'year': year, 'round': round_number, 'session_type': session_type,
            'messages': messages, 'total_messages': len(messages), 'source': 'OpenF1'}


def circuit(year, round_number):
    event = fastf1.get_event(year, round_number)
    info = {'location': event['Location'], 'country': event['Country'],
            'event_name': event['EventName'], 'event_format': event['EventFormat'],
            'official_name': event.get('OfficialEventName')}
    geometry = {'rotation': None, 'corners': []}
    try:
        session = _session(year, round_number, 'R', time.monotonic() + 12)
        response = requests.get(f'https://api.multiviewer.app/api/v1/circuits/{int(session["circuit_key"])}/{year}',
                                headers={'User-Agent': f'FastF1/{fastf1.__version__}'}, timeout=(3, 6))
        response.raise_for_status()
        raw = response.json()
        geometry = {'rotation': raw.get('rotation'), 'corners': raw.get('corners') or []}
    except (TelemetryUnavailable, requests.RequestException, ValueError, KeyError):
        pass  # Scheduled circuit identity/layout remains available before archive publication.
    return {'year': year, 'round': round_number, 'event_info': info,
            'circuit_info': geometry, 'lap_length_km': None, 'source': 'FastF1 schedule / MultiViewer'}
