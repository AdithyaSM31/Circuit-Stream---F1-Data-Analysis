import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  MapPin,
  Timer,
  Activity,
  Flag,
  RefreshCw,
  Download,
  Trophy,
  ChevronRight,
} from "lucide-react";
import API_BASE_URL, { axios } from "../config/api";
import { getCircuitImageByCountry } from "../utils/imageMapper";
import "./Dashboard.css";
import { raceDate, splitSeason, buildWeekendCalendar } from "../utils/weekend";

const date = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })
    : "TBC";
const time = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBC";
function exportCalendar(event) {
  const content = buildWeekendCalendar(event);
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/calendar;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "circuit-stream-weekend.ics";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Countdown({ target }) {
  const [now, setNow] = useState(Date.now());
  const clock = useRef(null);
  useEffect(() => {
    let timer = 0,
      visible = false;
    const stop = () => {
      clearInterval(timer);
      timer = 0;
    };
    const sync = () => {
      stop();
      if (visible && !document.hidden) {
        setNow(Date.now());
        timer = setInterval(() => setNow(Date.now()), 1000);
      }
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      sync();
    });
    if (clock.current) observer.observe(clock.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const remaining = Math.max(0, new Date(target).getTime() - now);
  return (
    <div
      ref={clock}
      className="race-countdown"
      aria-label="Time until race start"
    >
      {[
        [Math.floor(remaining / 86400000), "DAYS"],
        [Math.floor(remaining / 3600000) % 24, "HRS"],
        [Math.floor(remaining / 60000) % 60, "MIN"],
        [Math.floor(remaining / 1000) % 60, "SEC"],
      ].map(([n, label]) => (
        <div key={label}>
          <strong>{String(n).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      setResults(null);
      try {
        const year = new Date().getFullYear();
        const response = await axios.get(
          `${API_BASE_URL}/api/schedule/${year}`,
          { signal: controller.signal, timeout: 45000 }
        );
        const { scheduled: list } = splitSeason(response.data.events || []);
        if (!active) return;
        setEvents(list);
        setLoading(false);
        const past = list.filter(
          (e) => new Date(raceDate(e)).getTime() + 10800000 < Date.now()
        );
        const previous = past[past.length - 1];
        if (previous) {
          try {
            const result = await axios.get(
              `${API_BASE_URL}/api/session/${year}/${previous.round_number}/R`,
              { signal: controller.signal, timeout: 45000 }
            );
            if (active)
              setResults({
                event: previous,
                drivers: (result.data.results || [])
                  .filter((d) => d.position > 0)
                  .sort((a, b) => a.position - b.position)
                  .slice(0, 3),
              });
          } catch (_) {
            /* The calendar remains available while results are unavailable. */
          }
        }
      } catch (e) {
        if (active) {
          setError(
            "The race calendar could not be loaded. The data service may be waking up."
          );
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);
  const { upcoming, completed } = splitSeason(events);
  const event = upcoming[0];
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tools = [
    [
      "/telemetry",
      Activity,
      "01",
      "Read between the racing lines.",
      "Speed, throttle, braking and every shift. Dive into the details of a lap.",
      "Explore telemetry",
    ],
    [
      "/laps",
      Timer,
      "02",
      "Find the perfect lap.",
      "Compare lap times, sectors and tyre strategies across the field.",
      "Open lap timing",
    ],
    [
      "/results",
      Flag,
      "03",
      "The full race picture.",
      "From the starting grid to the chequered flag. Every session, every result.",
      "View session results",
    ],
  ];
  return (
    <div className="overview">
      <div className="overview-heading">
        <div>
          <div className="eyebrow">
            <span /> YOUR PADDOCK PASS
          </div>
          <h1>
            The race. <span>The details.</span>
          </h1>
          <p>Your window into the world of Formula 1.</p>
        </div>
        <Link className="subtle-button" to="/schedule">
          <CalendarDays size={16} /> {new Date().getFullYear()} season{" "}
          <ChevronRight size={15} />
        </Link>
      </div>
      {loading ? (
        <div className="hero-skeleton" role="status">
          <div className="loading-spinner" />
          <p>Preparing your race weekend…</p>
        </div>
      ) : error ? (
        <div className="dashboard-error" role="alert">
          <Flag size={28} />
          <div>
            <h2>A short pit stop.</h2>
            <p>{error}</p>
          </div>
          <button
            className="subtle-button"
            onClick={() => setAttempt((a) => a + 1)}
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      ) : event ? (
        <section className="race-hero">
          <div className="hero-grid-pattern" />
          <div className="race-hero-copy">
            <div className="hero-kicker">
              <span className="orange-dot" /> NEXT ON THE CALENDAR{" "}
              <span className="round-tag">
                ROUND {String(event.round_number).padStart(2, "0")}
              </span>
            </div>
            <h2>
              {event.event_name.replace(/ Grand Prix/i, "")}
              <em>
                Grand Prix<span>↗</span>
              </em>
            </h2>
            <div className="race-meta">
              <span>
                <MapPin size={15} />
                {event.location}, {event.country}
              </span>
              <span>
                <CalendarDays size={15} />
                {date(raceDate(event))}
              </span>
            </div>
            <Countdown target={raceDate(event)} />
            <Link to="/schedule" className="orange-button">
              Explore race weekend <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="hero-track">
            <span className="track-label">
              THE NEXT CHALLENGE / {event.country.toUpperCase()}
            </span>
            {getCircuitImageByCountry(event.country) && (
              <img
                src={getCircuitImageByCountry(event.country)}
                alt={`${event.country} circuit layout`}
              />
            )}
            <div className="track-caption">
              <span>LIGHTS OUT</span>
              <strong>{time(raceDate(event))}</strong>
              <small>{zone}</small>
            </div>
          </div>
        </section>
      ) : (
        <section className="race-hero season-finished">
          <div className="race-hero-copy">
            <div className="eyebrow">THE SEASON AT A GLANCE</div>
            <h2>
              {events.length
                ? "Across the finish line."
                : "The grid is getting ready."}
            </h2>
            <p>
              {events.length
                ? "Revisit the moments that defined the championship."
                : "No race weekends are available for this season yet."}
            </p>
            <Link to="/standings" className="orange-button">
              Explore the championship <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
      )}
      <section className="season-strip" aria-label="Season progress">
        <div>
          <Flag size={19} />
          <span>SEASON {new Date().getFullYear()}</span>
        </div>
        <div>
          <strong>
            {loading || error ? "—" : String(completed).padStart(2, "0")}
          </strong>
          <span>RACES COMPLETED</span>
        </div>
        <div className="season-progress">
          <div
            style={{
              width: `${
                events.length ? (completed / events.length) * 100 : 0
              }%`,
            }}
          />
        </div>
        <div>
          <strong>
            {loading || error ? "—" : String(upcoming.length).padStart(2, "0")}
          </strong>
          <span>STILL TO RACE</span>
        </div>
        <Link to="/standings">
          Championship <ArrowUpRight size={16} />
        </Link>
      </section>
      <div className="overview-section-title">
        <div>
          <span className="eyebrow">GO DEEPER</span>
          <h2>Every detail tells a story.</h2>
        </div>
        <span className="section-subtitle">Your analysis toolkit</span>
      </div>
      <div className="analysis-tools">
        {tools.map(([path, Icon, number, title, description, action]) => (
          <Link className="analysis-tool" key={path} to={path}>
            <div className="tool-top">
              <span className="tool-icon">
                <Icon size={22} />
              </span>
              <span>{number} / ANALYSIS</span>
              <ArrowUpRight size={19} />
            </div>
            <div className={`tool-visual visual-${number}`} aria-hidden="true">
              {Array.from({ length: 24 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    height: `${20 + ((i * 37 + Number(number) * 13) % 70)}%`,
                  }}
                />
              ))}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="tool-action">
              {action}
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>
      <div className="weekend-grid">
        <section className="weekend-panel">
          <div className="panel-title">
            <h2>
              <CalendarDays size={18} /> Weekend agenda
            </h2>
            {event && (
              <button
                className="icon-button"
                title="Add weekend to calendar"
                aria-label="Download weekend calendar"
                onClick={() => exportCalendar(event)}
              >
                <Download size={17} />
              </button>
            )}
          </div>
          <div className="panel-note">Session times in {zone}</div>
          {event ? (
            [1, 2, 3, 4, 5]
              .filter((i) => event[`session${i}`])
              .map((i) => (
                <div
                  className={`agenda-row ${i === 5 ? "race-session" : ""}`}
                  key={i}
                >
                  <span className="agenda-index">
                    {String(i).padStart(2, "0")}
                  </span>
                  <div>
                    <strong>{event[`session${i}`]}</strong>
                    <small>{date(event[`session${i}_date`])}</small>
                  </div>
                  <span className="agenda-time">
                    {time(event[`session${i}_date`])}
                  </span>
                </div>
              ))
          ) : (
            <p className="panel-empty">
              {loading
                ? "Loading the weekend…"
                : "The next weekend will appear here when available."}
            </p>
          )}
        </section>
        <section className="weekend-panel">
          <div className="panel-title">
            <h2>
              <Flag size={18} /> On the horizon
            </h2>
            <Link to="/schedule">
              Full calendar <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="panel-note">The next stops on the world tour</div>
          {upcoming.slice(1, 4).map((e) => (
            <Link className="horizon-row" key={e.round_number} to="/schedule">
              <span className="horizon-round">
                R{String(e.round_number).padStart(2, "0")}
              </span>
              <div>
                <strong>{e.event_name}</strong>
                <small>
                  {e.location} · {date(raceDate(e))}
                </small>
              </div>
              <ArrowUpRight size={16} />
            </Link>
          ))}
          {upcoming.length < 2 && (
            <p className="panel-empty">
              {loading
                ? "Finding the next races…"
                : "No further races on this season’s calendar."}
            </p>
          )}
          <Link to="/circuit" className="circuit-callout">
            <MapPin size={22} />
            <span>
              Know every corner.
              <small>Explore the circuits behind the action.</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </div>
      {results?.drivers.length > 0 && (
        <section className="weekend-panel latest-podium">
          <div className="panel-title">
            <h2>
              <Trophy size={18} /> Last time out
            </h2>
            <Link to="/results">
              Session results <ArrowUpRight size={15} />
            </Link>
          </div>
          <p className="panel-note">{results.event.event_name}</p>
          <div className="podium-grid">
            {results.drivers.map((d) => (
              <div key={d.position}>
                <span className="podium-rank">
                  {String(d.position).padStart(2, "0")}
                </span>
                <span>
                  <strong>{d.full_name}</strong>
                  <small>{d.team_name}</small>
                </span>
                <b>
                  {d.points} <small>PTS</small>
                </b>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
