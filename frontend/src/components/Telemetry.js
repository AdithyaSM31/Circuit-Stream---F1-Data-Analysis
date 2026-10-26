import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Activity,
  ArrowRight,
  RefreshCw,
  Gauge,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API_BASE_URL, { axios } from "../config/api";
import { prepareTelemetry, telemetrySummary } from "../utils/telemetry";
const sessions = {
  R: "Race",
  Q: "Qualifying",
  S: "Sprint",
  FP1: "Practice 1",
  FP2: "Practice 2",
  FP3: "Practice 3",
};
const channels = [
  ["speed", "Speed trace", "km/h", "#75e3c4"],
  ["inputs", "Driver inputs", "%", "#d5e7ac"],
  ["engine", "Powertrain", "rpm", "#a7baf3"],
];
const number = (value) => (value == null ? "—" : value.toLocaleString());
function TraceTooltip({ active, payload, label, timed }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="trace-tooltip">
      <span>{timed ? `${label}s from first sample` : `Sample ${label}`}</span>
      {payload.map((item) => (
        <div key={item.dataKey}>
          <i style={{ background: item.color }} />
          {item.name}
          <strong>{number(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}
export default function Telemetry() {
  const [selection, setSelection] = useState({
    year: new Date().getFullYear(),
    round: "",
    driver: "",
    session: "R",
    lap: "1",
  });
  const [schedule, setSchedule] = useState([]),
    [drivers, setDrivers] = useState([]);
  const [configLoading, setConfigLoading] = useState(true),
    [configError, setConfigError] = useState(""),
    [retry, setRetry] = useState(0);
  const [telemetry, setTelemetry] = useState(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [channel, setChannel] = useState("speed");
  const request = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setConfigLoading(true);
    setConfigError("");
    setSchedule([]);
    setDrivers([]);
    Promise.allSettled([
      axios.get(`${API_BASE_URL}/api/schedule/${selection.year}`, {
        signal: controller.signal,
        timeout: 45000,
      }),
      axios.get(`${API_BASE_URL}/api/drivers/${selection.year}`, {
        signal: controller.signal,
        timeout: 45000,
      }),
    ]).then(([races, roster]) => {
      if (!active) return;
      const events =
        races.status === "fulfilled"
          ? (races.value.data.events || []).filter((e) => e.round_number > 0)
          : [];
      const grid =
        roster.status === "fulfilled" ? roster.value.data.drivers || [] : [];
      setSchedule(events);
      setDrivers(grid);
      setSelection((s) => ({
        ...s,
        round: String(events[0]?.round_number || ""),
        driver: String(grid[0]?.number || ""),
      }));
      if (!events.length || !grid.length)
        setConfigError(
          "The calendar or driver roster could not be loaded. Try reconnecting to the data service."
        );
      setConfigLoading(false);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [selection.year, retry]);
  useEffect(() => () => request.current?.abort(), []);
  const change = (key, value) => {
    request.current?.abort();
    setLoading(false);
    setTelemetry(null);
    setError("");
    setSelection((s) => ({ ...s, [key]: value }));
  };
  const selectedEvent = schedule.find(
    (e) => String(e.round_number) === selection.round
  );
  const selectedDriver = drivers.find(
    (d) => String(d.number) === selection.driver
  );
  const valid =
    Number.isInteger(Number(selection.lap)) &&
    Number(selection.lap) > 0 &&
    selection.lap.trim() !== "";
  const canLoad =
    !configLoading && !!selection.round && !!selection.driver && valid;
  const load = async (e) => {
    e.preventDefault();
    if (!canLoad || loading) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError("");
    setTelemetry(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/telemetry/${selection.year}/${selection.round}/${selection.session}/${selection.driver}/${selection.lap}`,
        { signal: controller.signal, timeout: 90000 }
      );
      if (controller.signal.aborted) return;
      if (
        !Array.isArray(response.data.telemetry) ||
        !response.data.telemetry.length
      )
        throw new Error(
          "There are no telemetry samples for this lap. Try another lap or session."
        );
      setTelemetry(response.data);
    } catch (err) {
      if (!controller.signal.aborted)
        setError(
          (/not been loaded|Session\.load/i.test(
            err.response?.data?.error || ""
          )
            ? "Telemetry is not available for this session. Try another session or driver."
            : err.response?.data?.error) ||
            (err.code === "ECONNABORTED"
              ? "The data service is taking longer than expected. Try again in a moment."
              : err.message)
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };
  const prepared = useMemo(
    () => prepareTelemetry(telemetry?.telemetry || []),
    [telemetry]
  );
  const stats = useMemo(
    () => telemetrySummary(telemetry?.telemetry || []),
    [telemetry]
  );
  const selectedChannel = channels.find((c) => c[0] === channel);
  return (
    <div className="telemetry-lab">
      <form className="lab-session-form" onSubmit={load}>
        <div className="lab-panel-heading">
          <span>
            <SlidersHorizontal size={15} /> SESSION CONFIGURATION
          </span>
          <small>01 / SELECT YOUR PERSPECTIVE</small>
        </div>
        <div className="lab-fields">
          <label>
            SEASON
            <select
              value={selection.year}
              onChange={(e) => change("year", Number(e.target.value))}
            >
              {Array.from(
                { length: new Date().getFullYear() - 2017 },
                (_, i) => new Date().getFullYear() - i
              ).map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className="field-race">
            GRAND PRIX
            <select
              value={selection.round}
              disabled={configLoading || !schedule.length}
              onChange={(e) => change("round", e.target.value)}
            >
              {!schedule.length && (
                <option value="">
                  {configLoading ? "Loading calendar…" : "No events available"}
                </option>
              )}
              {schedule.map((event) => (
                <option key={event.round_number} value={event.round_number}>
                  {event.event_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            SESSION
            <select
              value={selection.session}
              onChange={(e) => change("session", e.target.value)}
            >
              {Object.entries(sessions).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-driver">
            DRIVER
            <select
              value={selection.driver}
              disabled={configLoading || !drivers.length}
              onChange={(e) => change("driver", e.target.value)}
            >
              {!drivers.length && (
                <option value="">
                  {configLoading ? "Loading drivers…" : "No drivers available"}
                </option>
              )}
              {drivers.map((driver) => (
                <option key={driver.number} value={driver.number}>
                  {driver.full_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            LAP
            <input
              type="number"
              min="1"
              step="1"
              required
              value={selection.lap}
              onChange={(e) => change("lap", e.target.value)}
              aria-invalid={!valid}
            />
          </label>
          <button
            type="submit"
            className="lab-load-button"
            disabled={!canLoad || loading}
          >
            {loading ? (
              <>
                <RefreshCw className="lab-spin" size={16} />
                Loading…
              </>
            ) : (
              <>
                Load telemetry
                <ArrowUpRight size={17} />
              </>
            )}
          </button>
        </div>
        <div className="lab-form-note">
          <span>
            <i />
            {configLoading
              ? "Connecting to the session archive…"
              : "Choose a completed session for available telemetry."}
          </span>
          <span>HISTORICAL SESSION DATA</span>
        </div>
      </form>
      {configError && (
        <div className="lab-notice" role="alert">
          <AlertCircle size={18} />
          <p>{configError}</p>
          <button onClick={() => setRetry((r) => r + 1)}>
            Reconnect <RefreshCw size={14} />
          </button>
        </div>
      )}
      {error && (
        <div className="lab-notice" role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>A brief pit stop.</strong>
            <p>{error}</p>
          </div>
        </div>
      )}
      {loading && (
        <div className="lab-loading" role="status">
          <Activity size={28} />
          <h2>Finding the detail.</h2>
          <p>
            Loading this lap from the timing archive. This can take up to a
            minute.
          </p>
          <span className="loading-track">
            <i />
          </span>
        </div>
      )}
      {!telemetry && !loading && (
        <>
          <section className="lab-empty">
            <div className="lab-empty-grid" />
            <div className="lab-empty-copy">
              <span className="lab-eyebrow">THE MACHINE, UNDERSTOOD.</span>
              <h2>
                EVERY INPUT.
                <br />
                <span>A NEW INSIGHT.</span>
              </h2>
              <p>
                Select a driver, session and lap above.
                <br />
                We’ll turn the timing feed into a closer look at the race.
              </p>
              <div className="lab-empty-steps">
                <span>
                  <b>01</b> Choose a session
                </span>
                <ArrowRight size={13} />
                <span>
                  <b>02</b> Reveal the lap
                </span>
              </div>
            </div>
            <div className="lab-empty-art">
              <span className="lab-ghost-word" aria-hidden="true">
                TELEMETRY
              </span>
              <img
                src="/images/cars/2026mercedescarright.avif"
                alt="Mercedes Formula 1 car in profile"
              />
              <span className="lab-art-caption">SPEED / CONTROL / POWER</span>
            </div>
            <div className="lab-empty-bottom">
              <span>YOUR NEXT INSIGHT STARTS HERE.</span>
              <span>NO LAP LOADED</span>
            </div>
          </section>
          <div className="lab-channel-preview">
            {[
              [
                Gauge,
                "01",
                "Speed & precision",
                "Follow the speed trace through every phase of a lap.",
              ],
              [
                SlidersHorizontal,
                "02",
                "The driver’s decisions",
                "Throttle and brake inputs. Commitment, made visible.",
              ],
              [
                Zap,
                "03",
                "Power, delivered",
                "RPM and gear changes. Inside the rhythm of the machine.",
              ],
            ].map(([Icon, n, title, copy]) => (
              <div key={n}>
                <span>
                  <Icon size={18} />
                  <small>/{n}</small>
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </>
      )}
      {telemetry && (
        <section className="lab-results">
          <div className="lab-result-heading">
            <div>
              <span className="lab-eyebrow">02 / THE LAP, REVEALED</span>
              <h2>
                {selectedDriver?.full_name || `Driver ${telemetry.driver}`}
                <span> / LAP {telemetry.lap_number}</span>
              </h2>
              <p>
                {selectedEvent?.event_name} · {selection.year} ·{" "}
                {sessions[selection.session]}
              </p>
            </div>
            <span className="lab-samples">
              <i />
              {prepared.points.length} SAMPLES
            </span>
          </div>
          <div className="lab-metrics">
            {[
              [stats.maxSpeed, "km/h", "PEAK SPEED"],
              [stats.averageThrottle, "%", "MEAN THROTTLE"],
              [stats.maxRpm, "rpm", "PEAK RPM"],
              [stats.maxGear, "", "HIGHEST GEAR"],
            ].map(([value, unit, label]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>
                  {number(value)}
                  <small>{unit}</small>
                </strong>
              </div>
            ))}
          </div>
          <div className="lab-chart-panel">
            <div className="lab-chart-top">
              <div role="tablist" aria-label="Telemetry channel">
                {channels.map(([key, label]) => (
                  <button
                    id={`channel-${key}`}
                    role="tab"
                    aria-selected={key === channel}
                    aria-controls="telemetry-trace"
                    key={key}
                    className={key === channel ? "active" : ""}
                    onClick={() => setChannel(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span>TRACE / {selectedChannel[2]}</span>
            </div>
            <div
              id="telemetry-trace"
              role="tabpanel"
              aria-labelledby={`channel-${channel}`}
            >
              <div className="lab-chart-legend">
                {(channel === "speed"
                  ? [["Speed", "#75e3c4"]]
                  : channel === "inputs"
                  ? [
                      ["Throttle", "#d5e7ac"],
                      ["Brake", "#ed967e"],
                    ]
                  : [
                      ["RPM", "#a7baf3"],
                      ["Gear", "#e0bd7f"],
                    ]
                ).map(([label, color]) => (
                  <span key={label}>
                    <i style={{ background: color }} />
                    {label}
                  </span>
                ))}
              </div>
              <div className="lab-trace">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepared.points}
                    margin={{
                      top: 10,
                      right: channel === "engine" ? 8 : 20,
                      bottom: 12,
                      left: 0,
                    }}
                  >
                    <CartesianGrid
                      stroke="#273a34"
                      strokeDasharray="3 7"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="axis"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tick={{ fill: "#81968b", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#33443c" }}
                      tickFormatter={(v) => Math.round(v)}
                    />
                    <YAxis
                      yAxisId="left"
                      width={52}
                      domain={
                        channel === "inputs" ? [0, 100] : ["auto", "auto"]
                      }
                      tick={{ fill: "#81968b", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    {channel === "engine" && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        width={30}
                        domain={[0, 8]}
                        tick={{ fill: "#c2ae83", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                    )}
                    <Tooltip
                      content={<TraceTooltip timed={prepared.timed} />}
                    />
                    {channel === "speed" && (
                      <Line
                        yAxisId="left"
                        dataKey="speed"
                        name="Speed (km/h)"
                        stroke="#75e3c4"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    )}{" "}
                    {channel === "inputs" && (
                      <>
                        <Line
                          yAxisId="left"
                          dataKey="throttle"
                          name="Throttle (%)"
                          stroke="#d5e7ac"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <Line
                          yAxisId="left"
                          dataKey="brake_input"
                          name="Brake (on = 100)"
                          type="stepAfter"
                          stroke="#ed967e"
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </>
                    )}
                    {channel === "engine" && (
                      <>
                        <Line
                          yAxisId="left"
                          dataKey="rpm"
                          name="RPM"
                          stroke="#a7baf3"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <Line
                          yAxisId="right"
                          dataKey="gear"
                          name="Gear"
                          type="stepAfter"
                          stroke="#e0bd7f"
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="lab-chart-foot">
                <span>
                  {prepared.timed
                    ? "TIME FROM FIRST SAMPLE (SECONDS)"
                    : "SAMPLE NUMBER"}
                </span>
                <span>
                  {channel === "engine"
                    ? "RPM · LEFT AXIS / GEAR · RIGHT AXIS"
                    : "FASTF1 / SAMPLED CAR DATA"}
                </span>
              </div>
            </div>
          </div>
          <details className="lab-raw-data">
            <summary>
              Behind the trace{" "}
              <span>
                FIRST {Math.min(50, prepared.points.length)} SAMPLES{" "}
                <ChevronDown size={16} />
              </span>
            </summary>
            <div className="table-container">
              <table>
                <caption>
                  Raw timing-feed values. DRS is shown as the source code.
                </caption>
                <thead>
                  <tr>
                    {[
                      "Session time",
                      "Speed · km/h",
                      "RPM",
                      "Gear",
                      "Throttle · %",
                      "Brake",
                      "DRS code",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prepared.points.slice(0, 50).map((point, i) => (
                    <tr key={i}>
                      <td>{point.session_time || "—"}</td>
                      <td>{number(point.speed)}</td>
                      <td>{number(point.rpm)}</td>
                      <td>{number(point.gear)}</td>
                      <td>{number(point.throttle)}</td>
                      <td>{point.brake ? "On" : "Off"}</td>
                      <td>{point.drs ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <p className="lab-data-note">
            Summary values use the returned samples. The timing feed is sampled
            by the data service.
          </p>
        </section>
      )}
      <div className="lab-next">
        <span>KEEP EXPLORING</span>
        <Link to="/laps">
          Chase the thousandth.
          <ArrowUpRight size={18} />
        </Link>
        <Link to="/results">
          See the full story.
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
}
