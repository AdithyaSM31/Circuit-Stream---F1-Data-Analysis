import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, Mock
import telemetry_service as service
from app import app

UTC = timezone.utc
SESSION = {'session_key': 11280, 'session_name': 'Race',
           'date_start': '2026-05-03T22:30:00+05:30',
           'date_end': '2026-05-04T00:30:00+05:30'}
DRIVERS = [
    {'driver_number': 1, 'name_acronym': 'NOR', 'full_name': 'Lando NORRIS', 'team_name': 'McLaren', 'team_colour': 'F47600'},
    {'driver_number': 3, 'name_acronym': 'VER', 'full_name': 'Max VERSTAPPEN', 'team_name': 'Red Bull Racing', 'team_colour': '4781D7'},
]
LAP = {'date_start': '2026-05-03T22:40:28.251+05:30', 'lap_duration': 94.09}


class TelemetryServiceTests(unittest.TestCase):
    def setUp(self):
        self.metadata = patch.object(service, '_metadata', return_value=(datetime(2026, 5, 3, 17, tzinfo=UTC), 'Race'))
        self.metadata.start()
        self.queries = []
        self.samples = [
            {'date': '2026-05-03T17:10:28.250Z', 'speed': 999},  # before this lap
            {'date': '2026-05-03T17:10:28.251Z', 'speed': 267, 'rpm': 10710, 'n_gear': 7, 'throttle': 100, 'brake': 0, 'drs': None},
            {'date': '2026-05-03T17:12:02.340Z', 'speed': 280, 'rpm': 11000, 'n_gear': 8, 'throttle': 80, 'brake': 100, 'drs': 12},
            {'date': '2026-05-03T17:12:02.341Z', 'speed': 999},  # next lap boundary
        ]
        self.lap = dict(LAP)
        self.following = [{'date_start': '2026-05-03T17:12:02.341Z'}]
        self.query_patch = patch.object(service, '_query', side_effect=self.query)
        self.query_patch.start()

    def tearDown(self):
        self.metadata.stop()
        self.query_patch.stop()

    def query(self, resource, params, deadline):
        self.queries.append((resource, params))
        if resource == 'sessions':
            return [dict(SESSION)]
        if resource == 'drivers':
            return DRIVERS
        if resource == 'laps':
            return [self.lap] if params['lap_number'] == 5 else self.following
        return self.samples

    def load(self, identifier='1', driver_code='VER'):
        return service.historical_telemetry(2026, 4, 'R', identifier, 5, driver_code=driver_code)

    def test_driver_code_resolves_actual_race_number_instead_of_stale_number(self):
        data = self.load()
        self.assertEqual((data['driver'], data['driver_code']), ('3', 'VER'))
        for resource, params in self.queries:
            if resource in ('laps', 'car_data'):
                self.assertEqual(params['driver_number'], 3)

    def test_utc_lap_window_is_half_open_and_preserves_real_channels(self):
        data = self.load()
        self.assertEqual(data['data_points'], 2)
        self.assertEqual([p['speed'] for p in data['telemetry']], [267, 280])
        self.assertFalse(data['telemetry'][0]['brake'])
        self.assertTrue(data['telemetry'][1]['brake'])
        self.assertIsNone(data['telemetry'][0]['drs'])
        self.assertEqual(data['telemetry'][0]['gear'], 7)
        self.assertEqual(data['telemetry'][0]['session_time'], '00:10:28.251000')
        params = [params for resource, params in self.queries if resource == 'car_data'][0]
        self.assertIn('date>', params)
        self.assertNotIn('date>=', params)
        self.assertEqual(data['source'], 'OpenF1')

    def test_missing_duration_uses_next_lap_start_without_inventing_a_duration(self):
        self.lap['lap_duration'] = None
        self.assertEqual(self.load()['data_points'], 2)
        self.following = []
        with self.assertRaises(service.TelemetryUnavailable) as caught:
            self.load()
        self.assertEqual(caught.exception.code, 'lap_incomplete')

    def test_unknown_driver_and_empty_car_data_are_distinct_404s(self):
        with self.assertRaises(service.TelemetryUnavailable) as caught:
            self.load(driver_code='XYZ')
        self.assertEqual(caught.exception.code, 'driver_not_found')
        self.samples = []
        with self.assertRaises(service.TelemetryUnavailable) as caught:
            self.load()
        self.assertEqual(caught.exception.status, 404)

    def test_session_roster_exposes_current_driver_numbers(self):
        drivers = service.session_drivers(2026, 4, 'R')
        self.assertEqual({d['abbreviation']: d['number'] for d in drivers}, {'NOR': '1', 'VER': '3'})

    def test_route_returns_retriable_provider_error_separately_from_missing_lap(self):
        with patch('app.historical_telemetry', side_effect=service.TelemetryUnavailable('Archive busy', 503, 'upstream_rate_limited')):
            response = app.test_client().get('/api/telemetry/2026/4/R/3/5')
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.headers['Retry-After'], '60')
        self.assertEqual(response.get_json()['code'], 'upstream_rate_limited')


class ProviderQueryTests(unittest.TestCase):
    def test_rate_limit_is_not_retried_or_cached(self):
        with service._CACHE_LOCK:
            service._CACHE.clear()
        response = Mock(status_code=429)
        with patch.object(service.requests, 'get', return_value=response) as get:
            with self.assertRaises(service.TelemetryUnavailable) as caught:
                service._query('car_data', {'session_key': 1}, service.time.monotonic() + 22)
        self.assertEqual(caught.exception.code, 'upstream_rate_limited')
        self.assertEqual(get.call_count, 1)
        self.assertEqual(len(service._CACHE), 0)


if __name__ == '__main__':
    unittest.main()
