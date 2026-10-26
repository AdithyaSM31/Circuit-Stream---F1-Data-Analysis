import unittest
from unittest.mock import patch, Mock

import archive_service as archive
from app import app


class ArchiveTests(unittest.TestCase):
    def query(self, resource, params, deadline):
        return self.data.get(resource, [])

    def setUp(self):
        self.data = {'drivers': [{'driver_number': 3, 'name_acronym': 'VER',
                                 'full_name': 'Max Verstappen'}]}
        self.context = patch.object(archive, 'context', return_value=(999, {'session_key': 11280}))
        self.query_patch = patch.object(archive, '_query', side_effect=self.query)
        self.context.start()
        self.query_patch.start()
        self.addCleanup(self.context.stop)
        self.addCleanup(self.query_patch.stop)

    def test_laps_are_not_truncated_and_driver_code_resolves(self):
        self.data['laps'] = [{'driver_number': 3, 'lap_number': i, 'lap_duration': 94.09,
                              'duration_sector_1': 30.1} for i in range(1, 111)]
        self.data['stints'] = [{'driver_number': 3, 'lap_start': 1, 'lap_end': 110,
                                'stint_number': 1, 'compound': 'MEDIUM', 'tyre_age_at_start': 0}]
        response = app.test_client().get('/api/laps/2026/4/R?driver=VER')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['total_laps'], 110)
        self.assertEqual(data['laps'][0]['lap_time'], '1:34.090')
        self.assertEqual(data['laps'][0]['tyre_life'], 1)
        self.assertEqual(data['laps'][0]['driver'], 'VER')
        self.assertIsNone(data['laps'][0]['pit_out_time'])
        self.assertEqual(app.test_client().get('/api/laps/2026/4/R?driver=999').status_code, 404)

    def test_qualifying_and_missing_points_are_not_fabricated(self):
        self.data['session_result'] = [{'driver_number': 3, 'position': 1,
                                        'duration': [91.2, None, 90.5]}]
        result = archive.results(2026, 4, 'Q')['results'][0]
        self.assertEqual(result['time'], 'Q1 1:31.200 / Q2 — / Q3 1:30.500')
        self.assertIsNone(result['points'])
        self.data['session_result'][0]['dsq'] = True
        self.assertEqual(archive.results(2026, 4, 'Q')['results'][0]['time'], 'Disqualified')

    def test_race_control_preserves_messages_and_empty_archive(self):
        self.assertEqual(archive.race_control(2026, 4, 'R')['total_messages'], 0)
        self.data['race_control'] = [{'date': '2026-05-03T17:00:00Z', 'message': 'YELLOW IN SECTOR 1',
                                      'flag': 'YELLOW', 'sector': 1}]
        result = app.test_client().get('/api/race-control/2026/4/R').get_json()
        self.assertEqual(result['messages'][0]['flag'], 'YELLOW')
        self.assertEqual(result['total_messages'], 1)

    @patch.object(archive.requests, 'get')
    @patch.object(archive, '_session', return_value={'circuit_key': 151})
    @patch.object(archive.fastf1, 'get_event', return_value={
        'Location': 'Miami Gardens', 'Country': 'United States',
        'EventName': 'Miami Grand Prix', 'EventFormat': 'sprint_qualifying'})
    def test_circuit_never_loads_timing_feed(self, event, session, get):
        get.return_value = Mock(json=lambda: {'rotation': 2, 'corners': [{'number': 1}, {'number': 2}]})
        result = app.test_client().get('/api/circuit/2026/4').get_json()
        self.assertEqual(result['event_info']['location'], 'Miami Gardens')
        self.assertEqual(len(result['circuit_info']['corners']), 2)
        self.assertTrue(get.call_args.kwargs['headers']['User-Agent'].startswith('FastF1/'))
        get.side_effect = archive.requests.Timeout()
        self.assertEqual(archive.circuit(2026, 4)['event_info']['event_name'], 'Miami Grand Prix')


if __name__ == '__main__':
    unittest.main()
