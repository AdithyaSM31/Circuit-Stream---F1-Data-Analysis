export function feedSeconds(value) {
  if (typeof value !== "string") return NaN;
  const match = value.match(/^(?:(\d+) days?\s+)?(\d+):(\d+):(\d+(?:\.\d+)?)$/);
  return match
    ? Number(match[1] || 0) * 86400 +
        Number(match[2]) * 3600 +
        Number(match[3]) * 60 +
        Number(match[4])
    : NaN;
}
export function prepareTelemetry(points) {
  const times = points.map((p) => feedSeconds(p.session_time));
  const timed = times.length > 0 && times.every(Number.isFinite);
  return {
    timed,
    points: points.map((p, i) => ({
      ...p,
      axis: timed ? Number((times[i] - times[0]).toFixed(3)) : i + 1,
      brake_input: p.brake ? 100 : 0,
    })),
  };
}
export function telemetrySummary(points) {
  const values = (key) =>
    points
      .map((p) => p[key])
      .filter((v) => typeof v === "number" && Number.isFinite(v));
  const maximum = (key) => {
    const v = values(key);
    return v.length ? Math.max(...v) : null;
  };
  const throttle = values("throttle");
  return {
    maxSpeed: maximum("speed"),
    maxRpm: maximum("rpm"),
    maxGear: maximum("gear"),
    averageThrottle: throttle.length
      ? Math.round(throttle.reduce((sum, v) => sum + v, 0) / throttle.length)
      : null,
  };
}
