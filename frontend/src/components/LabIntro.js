import React from "react";
const copy = {
  "/schedule": [
    "06",
    "THE WORLD.",
    "ONE SEASON.",
    "RACE CALENDAR",
    "Every stop. Every session. Your next lights out.",
  ],
  "/standings": [
    "07",
    "THE CHASE",
    "FOR THE CROWN.",
    "WORLD CHAMPIONSHIP",
    "The contenders. The points. The fight that defines a season.",
  ],
  "/teams": [
    "08",
    "BUILT TO RACE.",
    "BORN TO PUSH.",
    "TEAMS & DRIVERS",
    "The machines and the minds behind every millisecond.",
  ],
  "/telemetry": [
    "01",
    "READ THE",
    "INVISIBLE.",
    "TELEMETRY WORKSPACE",
    "Trace every input. Understand every thousandth.",
  ],
  "/laps": [
    "02",
    "CHASE THE",
    "THOUSANDTH.",
    "LAP TIMING",
    "From the first sector to the final apex. Find the difference.",
  ],
  "/results": [
    "03",
    "THE FINISH.",
    "THE FULL STORY.",
    "SESSION RESULTS",
    "Every position. Every point. Every session.",
  ],
  "/race-control": [
    "04",
    "READ THE",
    "RACE.",
    "RACE CONTROL",
    "The decisions, flags and messages behind the action.",
  ],
  "/circuit": [
    "05",
    "KNOW EVERY",
    "CORNER.",
    "CIRCUIT EXPLORER",
    "Get closer to the geometry of racing.",
  ],
};
export default function LabIntro({ path }) {
  const data = copy[path];
  if (!data) return null;
  const [index, first, second, label, description] = data;
  return (
    <header className="lab-intro">
      <div className="lab-intro-copy">
        <div className="lab-eyebrow">
          <i /> CIRCUIT STREAM /{" "}
          {["/schedule", "/standings", "/teams"].includes(path)
            ? "THE PADDOCK"
            : "ANALYSIS LAB"}{" "}
          <span>{index}</span>
        </div>
        <h1>
          {first}
          <br />
          <span>{second}</span>
        </h1>
        <p>{description}</p>
      </div>
      <div className="lab-intro-art" aria-hidden="true">
        <div className="lab-art-ring" />
        <svg viewBox="0 0 440 130">
          <path className="lab-art-guide" d="M0 100H440M0 65H440M0 30H440" />
          <path
            className="lab-art-trace"
            d="M0 99L30 94L50 85L70 89L92 53L110 62L135 25L155 16L170 98L192 88L214 74L240 34L260 20L280 103L303 91L328 65L350 27L378 15L396 88L416 74L440 54"
          />
        </svg>
        <span>PRECISION IS A PERSPECTIVE.</span>
      </div>
      <div className="lab-intro-bottom">
        <span>{label}</span>
        <span>FASTF1 / SESSION ARCHIVE</span>
      </div>
    </header>
  );
}
