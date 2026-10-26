import React, { useState } from "react";
import { Search, MapPin, ChevronDown, CalendarDays } from "lucide-react";
import { getCircuitImageForEvent } from "../utils/imageMapper";
import { raceDate } from "../utils/weekend";
import {
  useArchiveData,
  SeasonPicker,
  ArchiveStatus,
  ArchiveImage,
} from "./ArchiveShared";
import "./Paddock.css";
const formatDate = (value) =>
  value && Number.isFinite(new Date(value).getTime())
    ? new Date(value).toLocaleDateString([], { day: "2-digit", month: "short" })
    : "TBC";
const formatSession = (value) =>
  value && Number.isFinite(new Date(value).getTime())
    ? new Date(value).toLocaleString([], {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Time TBC";
export default function EventSchedule() {
  const [year, setYear] = useState(new Date().getFullYear()),
    [filter, setFilter] = useState("all"),
    [query, setQuery] = useState("");
  const { data, loading, error, retry } = useArchiveData(
    `/api/schedule/${year}`
  );
  const events = (data?.events || [])
    .filter((e) => e.round_number > 0)
    .sort((a, b) => a.round_number - b.round_number);
  const now = Date.now(),
    next = events.find(
      (e) => new Date(raceDate(e)).getTime() + 10800000 >= now
    );
  const status = (e) =>
    new Date(raceDate(e)).getTime() + 10800000 < now ? "completed" : "upcoming";
  const visible = events.filter(
    (e) =>
      (filter === "all" || status(e) === filter) &&
      `${e.event_name} ${e.location} ${e.country}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  const completed = events.filter((e) => status(e) === "completed").length;
  return (
    <div className="paddock-page calendar-page">
      <div className="paddock-toolbar">
        <SeasonPicker year={year} onChange={setYear} />
        <div
          className="paddock-segments"
          role="group"
          aria-label="Filter races"
        >
          {[
            ["all", "Full season"],
            ["upcoming", "Still to race"],
            ["completed", "Completed"],
          ].map(([key, label]) => (
            <button
              key={key}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="paddock-search">
          <Search size={15} />
          <input
            aria-label="Search races"
            placeholder="Find a Grand Prix"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {!loading && !error && (
        <div className="paddock-season-strip">
          <span>
            <strong>{String(events.length).padStart(2, "0")}</strong> RACE
            WEEKENDS
          </span>
          <span>
            <strong>{String(completed).padStart(2, "0")}</strong> COMPLETED
          </span>
          <span className="paddock-local-time">
            Times in {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
        </div>
      )}
      <ArchiveStatus
        loading={loading}
        error={error}
        retry={retry}
        empty={!visible.length}
      />
      {!loading && !error && (
        <div className="calendar-cards">
          {visible.map((event) => (
            <article
              key={event.round_number}
              className={`calendar-card ${event === next ? "is-next" : ""}`}
            >
              <div className="calendar-card-top">
                <span>
                  ROUND / {String(event.round_number).padStart(2, "0")}
                </span>
                <span className={`race-state ${status(event)}`}>
                  {event === next
                    ? "NEXT LIGHTS OUT"
                    : status(event) === "completed"
                    ? "COMPLETED"
                    : "UPCOMING"}
                </span>
              </div>
              <div className="calendar-track">
                <ArchiveImage
                  src={getCircuitImageByCountry(event.country)}
                  alt={`${event.country} circuit layout`}
                  fallback="CIRCUIT"
                />
                <span>{event.country.toUpperCase()}</span>
              </div>
              <div className="calendar-race-info">
                <span className="paddock-kicker">{event.country}</span>
                <h2>
                  {event.event_name.replace(/ Grand Prix/i, "")}
                  <span>Grand Prix</span>
                </h2>
                <div className="calendar-location">
                  <MapPin size={12} />
                  {event.location}
                </div>
                <div className="calendar-date">
                  <CalendarDays size={14} />
                  {formatDate(raceDate(event))}
                  <span>
                    {event.event_format?.includes("sprint")
                      ? "SPRINT WEEKEND"
                      : "GRAND PRIX WEEKEND"}
                  </span>
                </div>
              </div>
              <details className="calendar-agenda">
                <summary>
                  Weekend sessions <ChevronDown size={15} />
                </summary>
                <div>
                  {[1, 2, 3, 4, 5]
                    .filter((i) => event[`session${i}`])
                    .map((i) => (
                      <div className="calendar-session" key={i}>
                        <span>{event[`session${i}`]}</span>
                        <time dateTime={event[`session${i}_date`]}>
                          {formatSession(event[`session${i}_date`])}
                        </time>
                      </div>
                    ))}
                </div>
              </details>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
