import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getTeamCarImage, getDriverImage } from "../utils/imageMapper";
import {
  useArchiveData,
  SeasonPicker,
  ArchiveStatus,
  ArchiveImage,
} from "./ArchiveShared";
import "./Paddock.css";
export default function Teams() {
  const [year, setYear] = useState(new Date().getFullYear()),
    [query, setQuery] = useState("");
  const { data, loading, error, retry } = useArchiveData(
    `/api/drivers/${year}`
  );
  const teams = useMemo(() => {
    const grouped = new Map();
    for (const driver of data?.drivers || []) {
      const name = driver.team_name || "Independent";
      if (!grouped.has(name))
        grouped.set(name, {
          name,
          color: /^[0-9a-f]{6}$/i.test(
            (driver.team_color || "").replace("#", "")
          )
            ? `#${driver.team_color.replace("#", "")}`
            : "#91bba0",
          drivers: [],
        });
      grouped.get(name).drivers.push(driver);
    }
    return [...grouped.values()];
  }, [data]);
  const visible = teams.filter((t) =>
    `${t.name} ${t.drivers
      .map((d) => `${d.full_name} ${d.abbreviation} ${d.number}`)
      .join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  return (
    <div className="paddock-page grid-page">
      <div className="paddock-toolbar">
        <SeasonPicker year={year} onChange={setYear} />
        <span className="paddock-toolbar-note">THE MACHINES. THE PEOPLE.</span>
        <label className="paddock-search">
          <Search size={15} />
          <input
            aria-label="Search teams or drivers"
            placeholder="Find a team or driver"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {!loading && !error && (
        <div className="paddock-season-strip">
          <span>
            <strong>{String(teams.length).padStart(2, "0")}</strong> TEAMS
          </span>
          <span>
            <strong>
              {String(data?.drivers?.length || 0).padStart(2, "0")}
            </strong>{" "}
            DRIVERS
          </span>
          <span className="paddock-local-time">{year} / THE STARTING GRID</span>
        </div>
      )}
      <ArchiveStatus
        loading={loading}
        error={error}
        retry={retry}
        empty={!visible.length}
      />
      {!loading && !error && (
        <div className="grid-team-cards">
          {visible.map((team) => (
            <article
              className="grid-team-card"
              key={team.name}
              style={{ "--team-color": team.color }}
            >
              <div className="grid-team-top">
                <span className="paddock-kicker">
                  CONSTRUCTOR /{" "}
                  {String(teams.indexOf(team) + 1).padStart(2, "0")}
                </span>
                <span className="grid-team-marker" />
              </div>
              <h2>{team.name}</h2>
              <div className="grid-team-car">
                <ArchiveImage
                  src={
                    [2025, 2026].includes(year)
                      ? getTeamCarImage(team.name, year)
                      : null
                  }
                  alt={`${team.name} car`}
                  fallback="HISTORICAL LINE-UP"
                />
              </div>
              <div className="grid-driver-heading">
                <span>THE LINE-UP</span>
                <span>{team.drivers.length} DRIVERS</span>
              </div>
              <div className="grid-driver-list">
                {team.drivers.map((driver) => (
                  <div className="grid-driver" key={driver.number}>
                    <div className="grid-driver-portrait">
                      <ArchiveImage
                        src={
                          [2025, 2026].includes(year) &&
                          driver.abbreviation !== "DOO"
                            ? getDriverImage(
                                driver.abbreviation,
                                team.name,
                                year
                              )
                            : null
                        }
                        alt={driver.full_name}
                        fallback={driver.abbreviation}
                      />
                    </div>
                    <div className="grid-driver-copy">
                      <strong>{driver.full_name}</strong>
                      <span>{driver.abbreviation}</span>
                    </div>
                    <span className="grid-driver-number">{driver.number}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
