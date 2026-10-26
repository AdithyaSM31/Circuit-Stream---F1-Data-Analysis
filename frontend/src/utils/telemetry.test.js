import { feedSeconds, prepareTelemetry, telemetrySummary } from "./telemetry";
it("parses timing-feed durations across day boundaries", () => {
  expect(feedSeconds("0 days 01:02:03.250000")).toBe(3723.25);
  expect(feedSeconds("1 days 00:00:01")).toBe(86401);
  expect(Number.isNaN(feedSeconds(null))).toBe(true);
});
it("uses relative seconds when timestamps exist and sample index otherwise", () => {
  const timed = prepareTelemetry([
    { session_time: "0 days 01:00:00.100", brake: false },
    { session_time: "0 days 01:00:00.350", brake: true },
  ]);
  expect(timed.timed).toBe(true);
  expect(timed.points.map((p) => p.axis)).toEqual([0, 0.25]);
  expect(timed.points.map((p) => p.brake_input)).toEqual([0, 100]);
  const untimed = prepareTelemetry([
    { session_time: null },
    { session_time: "invalid" },
  ]);
  expect(untimed.timed).toBe(false);
  expect(untimed.points.map((p) => p.axis)).toEqual([1, 2]);
});
it("summarizes actual samples without treating missing values as zero", () => {
  expect(
    telemetrySummary([
      { speed: 100, rpm: 8000, gear: 3, throttle: 50 },
      { speed: 300, rpm: 12000, gear: 8, throttle: 100 },
      { speed: null, throttle: null },
    ])
  ).toEqual({ maxSpeed: 300, maxRpm: 12000, maxGear: 8, averageThrottle: 75 });
  expect(telemetrySummary([])).toEqual({
    maxSpeed: null,
    maxRpm: null,
    maxGear: null,
    averageThrottle: null,
  });
});
