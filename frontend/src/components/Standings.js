import React, { useState } from "react";
import { Trophy, Users } from "lucide-react";
import { getDriverImage, getTeamCarImage } from "../utils/imageMapper";
import {
  useArchiveData,
  SeasonPicker,
  ArchiveStatus,
  ArchiveImage,
} from "./ArchiveShared";
import "./Paddock.css";
export default function Standings() {
  const [tab, setTab] = useState("drivers"),
    [year, setYear] = useState(new Date().getFullYear());
  const { data, loading, error, retry } = useArchiveData(
    `/api/standings/${tab}/${year}`
  );
  const standings = (data?.standings || [])
    .slice()
    .sort((a, b) => Number(a.position) - Number(b.position));
  const leader = standings[0];
  const name = (row) =>
    tab === "drivers"
      ? `${row.Driver?.givenName || ""} ${row.Driver?.familyName || ""}`.trim()
      : row.Constructor?.name || "Unknown constructor";
  const team = (row) =>
    tab === "drivers"
      ? row.Constructors?.[0]?.name || "Independent"
      : row.Constructor?.nationality || "";
  const photo = (row) =>
    ![2025, 2026].includes(year)
      ? null
      : tab === "drivers"
      ? row.Driver?.code === "DOO"
        ? null
        : getDriverImage(
            row.Driver?.code ||
              row.Driver?.familyName?.slice(0, 3).toUpperCase() ||
              "",
            team(row),
            year
          )
      : getTeamCarImage(name(row), year);
  const gap = (row) =>
    Math.max(0, Number(leader?.points || 0) - Number(row.points || 0));
  return (
    <div className="paddock-page championship-page">
      <div className="paddock-toolbar">
        <SeasonPicker year={year} onChange={setYear} />
        <div
          className="paddock-segments"
          role="group"
          aria-label="Championship classification"
        >
          <button
            aria-pressed={tab === "drivers"}
            onClick={() => setTab("drivers")}
          >
            <Users size={14} />
            Drivers
          </button>
          <button
            aria-pressed={tab === "constructors"}
            onClick={() => setTab("constructors")}
          >
            <Trophy size={14} />
            Constructors
          </button>
        </div>
        <span className="paddock-toolbar-note">THE CHAMPIONSHIP / {year}</span>
      </div>
      <ArchiveStatus
        loading={loading}
        error={error}
        retry={retry}
        empty={!standings.length}
      />
      {!loading && !error && standings.length > 0 && (
        <>
          <div className="championship-podium">
            {standings.slice(0, 3).map((row, index) => (
              <article
                key={row.position}
                className={`champion-card ${
                  index === 0 ? "champion-leader" : ""
                }`}
              >
                <div className="champion-card-top">
                  <span>
                    {index === 0 ? "SETTING THE PACE" : "IN THE CHASE"}
                  </span>
                  <span>P{String(row.position).padStart(2, "0")}</span>
                </div>
                <div
                  className={`champion-portrait ${
                    tab === "constructors" ? "is-car" : ""
                  }`}
                >
                  <span className="champion-watermark" aria-hidden="true">
                    {String(row.position).padStart(2, "0")}
                  </span>
                  <ArchiveImage
                    src={photo(row)}
                    alt={name(row)}
                    fallback={tab === "drivers" ? row.Driver?.code : "F1"}
                  />
                </div>
                <div className="champion-copy">
                  <span className="paddock-kicker">{team(row)}</span>
                  <h2>{name(row)}</h2>
                  <div className="champion-score">
                    <strong>
                      {row.points}
                      <small>PTS</small>
                    </strong>
                    <span>
                      {row.wins} WINS <i />{" "}
                      {index === 0 ? "LEADER" : `${gap(row)} TO LEADER`}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="paddock-list-heading">
            <span>THE COMPLETE CLASSIFICATION</span>
            <span>
              {standings.length}{" "}
              {tab === "drivers" ? "DRIVERS" : "CONSTRUCTORS"}
            </span>
          </div>
          <div className="classification-scroll">
            <table className="classification-table">
              <caption>
                {year} {tab === "drivers" ? "Driver" : "Constructor"}{" "}
                championship standings
              </caption>
              <thead>
                <tr>
                  <th scope="col">POS</th>
                  <th scope="col">
                    {tab === "drivers" ? "DRIVER / TEAM" : "CONSTRUCTOR"}
                  </th>
                  <th scope="col">WINS</th>
                  <th scope="col">TO LEADER</th>
                  <th scope="col">POINTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => (
                  <tr key={row.position}>
                    <td>
                      <span className="classification-position">
                        {String(row.position).padStart(2, "0")}
                      </span>
                    </td>
                    <td>
                      <div className="classification-name">
                        <strong>{name(row)}</strong>
                        <small>{team(row)}</small>
                      </div>
                    </td>
                    <td>{row.wins}</td>
                    <td className="classification-gap">
                      {Number(row.position) === 1 ? "—" : `−${gap(row)}`}
                    </td>
                    <td>
                      <strong className="classification-points">
                        {row.points}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="paddock-source-note">
            Season standings from the data service. Points and wins reflect its
            latest available classification.
          </p>
        </>
      )}
    </div>
  );
}
