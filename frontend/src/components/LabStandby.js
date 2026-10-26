import React from "react";
import { Timer, Flag, Radio, MapPin, ArrowDown } from "lucide-react";
const modes = {
  laps: {
    Icon: Timer,
    label: "LAP TIMING",
    first: "THE LAP.",
    second: "EVERY LAYER.",
    copy: "Choose a session above to explore lap times, sectors and tyre life across the field.",
    tags: "PACE / SECTORS / STRATEGY",
  },
  results: {
    Icon: Flag,
    label: "SESSION CLASSIFICATION",
    first: "FROM THE GRID.",
    second: "TO THE FLAG.",
    copy: "Choose a race weekend and session above to reveal the final classification.",
    tags: "POSITIONS / POINTS / PERFORMANCE",
  },
  control: {
    Icon: Radio,
    label: "RACE CONTROL",
    first: "BEHIND THE",
    second: "DECISIONS.",
    copy: "Load a completed session to explore flags, investigations and race-control messages.",
    tags: "FLAGS / INCIDENTS / MESSAGES",
  },
  circuit: {
    Icon: MapPin,
    label: "CIRCUIT EXPLORER",
    first: "THE SHAPE",
    second: "OF SPEED.",
    copy: "Select a Grand Prix above to explore the circuit behind the action.",
    tags: "CORNERS / LAYOUT / CHARACTER",
  },
};
export default function LabStandby({ mode }) {
  const { Icon, label, first, second, copy, tags } = modes[mode];
  return (
    <section className="lab-standby">
      <div className="lab-empty-grid" />
      <div className="lab-standby-copy">
        <span className="lab-eyebrow">
          <ArrowDown size={11} /> SELECT A SESSION ABOVE
        </span>
        <h2>
          {first}
          <br />
          <span>{second}</span>
        </h2>
        <p>{copy}</p>
      </div>
      <div className="lab-standby-art" aria-hidden="true">
        <div />
        <Icon size={120} strokeWidth={0.6} />
        <span>{label}</span>
      </div>
      <div className="lab-empty-bottom">
        <span>{tags}</span>
        <span>READY WHEN YOU ARE.</span>
      </div>
    </section>
  );
}
