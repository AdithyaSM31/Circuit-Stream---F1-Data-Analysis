"""Bounded, public historical telemetry queries (OpenF1, 2023 onwards)."""
from collections import OrderedDict
from datetime import datetime, timedelta, timezone
from functools import lru_cache
import math
import threading
import time

import fastf1
import requests

BASE_URL = 'https://api.openf1.org/v1'
_CACHE = OrderedDict()
_CACHE_LOCK = threading.Lock()
_RATE_LOCK = threading.Lock()
_LAST_REQUEST = 0.0
SESSION_NAMES = {'R': 'Race', 'Q': 'Qualifying', 'S': 'Sprint',
                 'FP1': 'Practice 1', 'FP2': 'Practice 2', 'FP3': 'Practice 3',
                 'SQ': 'Sprint Qualifying', 'SS': 'Sprint Shootout'}


class TelemetryUnavailable(Exception):
    def __init__(self, message, status=404, code='telemetry_unavailable'):
        super().__init__(message)
        self.status = status
        self.code = code


def as_utc(value):
    if isinstance(value, datetime):
        result = value
    else:
        result = datetime.fromisoformat(str(value).replace('Z', '+00:00'))
    if result.tzinfo is None:
        result = result.replace(tzinfo=timezone.utc)
    return result.astimezone(timezone.utc)


def _query(resource, params, deadline):
    global _LAST_REQUEST
    key = (resource, tuple(sorted((k, str(v)) for k, v in params.items())))
    now = time.monotonic()
    with _CACHE_LOCK:
        cached = _CACHE.get(key)
        if cached and now - cached[0] < 1800:
            _CACHE.move_to_end(key)
            return cached[1]
    remaining = deadline - now
    if remaining < 1:
        raise TelemetryUnavailable('The timing archive is taking too long. Please try again.', 503, 'upstream_timeout')
    # Respect the public archive's per-second limit, without retrying rejected calls.
    with _RATE_LOCK:
        pause = max(0, .4 - (time.monotonic() - _LAST_REQUEST))
        if pause:
            time.sleep(pause)
        _LAST_REQUEST = time.monotonic()
    remaining = deadline - time.monotonic()
    if remaining < 1:
        raise TelemetryUnavailable('The timing archive is taking too long. Please try again.', 503, 'upstream_timeout')
    try:
        response = requests.get(f'{BASE_URL}/{resource}', params=params,
                                timeout=(min(3, remaining), min(6, remaining)))
        if response.status_code == 429:
            raise TelemetryUnavailable('The timing archive is busy. Please wait a minute and try again.', 503, 'upstream_rate_limited')
        if response.status_code in (401, 403):
            raise TelemetryUnavailable('Public telemetry is available only after the session has finished.', 503, 'upstream_unavailable')
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as error:
        raise TelemetryUnavailable('The timing archive could not be reached. Please try again shortly.', 502, 'upstream_unavailable') from error
    except ValueError as error:
        raise TelemetryUnavailable('The timing archive returned an invalid response. Please try again.', 502, 'upstream_unavailable') from error
    if not isinstance(data, list):
        raise TelemetryUnavailable('The timing archive returned an invalid response. Please try again.', 502, 'upstream_unavailable')
    # Do not retain empty/live data or failures; completed, successful queries are bounded.
    if data:
        with _CACHE_LOCK:
            _CACHE[key] = (time.monotonic(), data)
            _CACHE.move_to_end(key)
            while len(_CACHE) > 128:
                _CACHE.popitem(last=False)
    return data


@lru_cache(maxsize=64)
def _metadata(year, round_number, session_type):
    if session_type not in SESSION_NAMES:
        raise TelemetryUnavailable('Choose a valid session type.', 400, 'invalid_session')
    try:
        session = fastf1.get_session(year, round_number, session_type)
        return as_utc(session.date), SESSION_NAMES[session_type]
    except (ValueError, KeyError) as error:
        raise TelemetryUnavailable('The selected race or session was not found.', 404, 'session_not_found') from error


def _session(year, round_number, session_type, deadline):
    start, name = _metadata(year, round_number, session_type)
    candidates = _query('sessions', {'year': year, 'session_name': name}, deadline)
    # Match scheduled UTC time, not calendar round order (cancelled races can renumber rounds).
    matches = [item for item in candidates
               if not item.get('is_cancelled') and item.get('date_start')
               and abs((as_utc(item['date_start']) - start).total_seconds()) <= 172800]
    if len(matches) != 1:
        raise TelemetryUnavailable('This session is not available in the public timing archive yet.', 404, 'session_not_found')
    return matches[0]


def _normalise_driver(driver):
    number = str(driver['driver_number'])
    return {'number': number, 'driver_number': number,
            'abbreviation': driver.get('name_acronym') or number,
            'full_name': driver.get('full_name') or number,
            'team_name': driver.get('team_name') or 'Independent',
            'team_color': driver.get('team_colour')}


def session_drivers(year, round_number, session_type):
    deadline = time.monotonic() + 22
    session = _session(year, round_number, session_type, deadline)
    drivers = _query('drivers', {'session_key': session['session_key']}, deadline)
    if not drivers:
        raise TelemetryUnavailable('The driver roster has not been published for this session yet.', 404, 'drivers_unavailable')
    return sorted((_normalise_driver(driver) for driver in drivers),
                  key=lambda driver: (driver['team_name'], int(driver['number'])))


def _number(value):
    if value is None:
        return None
    try:
        return int(value) if math.isfinite(float(value)) else None
    except (TypeError, ValueError):
        return None


def historical_telemetry(year, round_number, session_type, identifier, lap_number, driver_code=None):
    if lap_number < 1:
        raise TelemetryUnavailable('Choose a lap number of 1 or greater.', 400, 'invalid_lap')
    deadline = time.monotonic() + 22
    session = _session(year, round_number, session_type, deadline)
    if not session.get('date_end') or as_utc(session['date_end']) + timedelta(minutes=30) > datetime.now(timezone.utc):
        raise TelemetryUnavailable('Telemetry becomes available after this session has finished.', 404, 'session_not_finished')
    key = session['session_key']
    drivers = _query('drivers', {'session_key': key}, deadline)
    if driver_code:
        selected = [driver for driver in drivers if str(driver.get('name_acronym', '')).upper() == driver_code.upper()]
    else:
        selected = [driver for driver in drivers if str(driver['driver_number']) == str(identifier)
                    or str(driver.get('name_acronym', '')).upper() == str(identifier).upper()]
    if len(selected) != 1:
        raise TelemetryUnavailable('This driver did not participate in the selected session.', 404, 'driver_not_found')
    driver = selected[0]
    number = driver['driver_number']
    laps = _query('laps', {'session_key': key, 'driver_number': number, 'lap_number': lap_number}, deadline)
    if len(laps) != 1 or not laps[0].get('date_start'):
        raise TelemetryUnavailable('This lap was not recorded for the selected driver. Try another lap.', 404, 'lap_not_found')
    lap = laps[0]
    start = as_utc(lap['date_start'])
    duration = lap.get('lap_duration')
    if isinstance(duration, (int, float)) and math.isfinite(duration) and duration > 0:
        end = start + timedelta(seconds=duration)
    else:
        following = _query('laps', {'session_key': key, 'driver_number': number, 'lap_number': lap_number + 1}, deadline)
        if len(following) != 1 or not following[0].get('date_start'):
            raise TelemetryUnavailable('This lap has no complete timing boundary. Try another lap.', 404, 'lap_incomplete')
        end = as_utc(following[0]['date_start'])
    if end <= start:
        raise TelemetryUnavailable('This lap has no complete timing boundary. Try another lap.', 404, 'lap_incomplete')
    # Filter syntax is date>=VALUE, not date>==VALUE. Use strict query bounds,
    # then enforce the precise half-open lap interval locally.
    query_start = (start - timedelta(microseconds=1)).replace(tzinfo=None).isoformat()
    query_end = end.replace(tzinfo=None).isoformat()
    raw = _query('car_data', {'session_key': key, 'driver_number': number,
                             'date>': query_start, 'date<': query_end}, deadline)
    zero = as_utc(session['date_start'])
    samples = []
    for point in sorted(raw, key=lambda row: row.get('date', '')):
        if not point.get('date'):
            continue
        moment = as_utc(point['date'])
        if not start <= moment < end:
            continue
        elapsed = (moment - zero).total_seconds()
        hours, remainder = divmod(elapsed, 3600)
        minutes, seconds = divmod(remainder, 60)
        samples.append({'session_time': f'{int(hours):02d}:{int(minutes):02d}:{seconds:09.6f}',
                        'speed': _number(point.get('speed')), 'rpm': _number(point.get('rpm')),
                        'gear': _number(point.get('n_gear')), 'throttle': _number(point.get('throttle')),
                        'brake': None if point.get('brake') is None else bool(point['brake']), 'drs': _number(point.get('drs'))})
    if not samples:
        raise TelemetryUnavailable('Car telemetry was not recorded for this lap. Try another lap.', 404, 'telemetry_unavailable')
    return {'year': year, 'round': round_number, 'session_type': session_type,
            'driver': str(number), 'driver_code': driver.get('name_acronym'),
            'driver_name': driver.get('full_name'), 'lap_number': lap_number,
            'telemetry': samples, 'data_points': len(samples), 'source': 'OpenF1',
            'source_session_key': key, 'lap_start': start.isoformat(), 'lap_end': end.isoformat()}
