import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  CalendarDays,
  Trophy,
  Users,
  Flag,
  Timer,
  Activity,
  Radio,
  MapPin,
  ArrowUpRight,
  ChevronRight,
  Search,
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import Experience from "./components/Experience";
import EventSchedule from "./components/EventSchedule";
import SessionResults from "./components/SessionResults";
import LapTiming from "./components/LapTiming";
import Telemetry from "./components/Telemetry";
import RaceControl from "./components/RaceControl";
import CircuitInfo from "./components/CircuitInfo";
import Teams from "./components/Teams";
import Standings from "./components/Standings";
import API_BASE_URL from "./config/api";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import "./App.css";
import "./Modern.css";
import "./Lab.css";
import "./Performance.css";
import LabIntro from "./components/LabIntro";
const pages = [
  ["/", "Overview", LayoutDashboard, Dashboard],
  ["/schedule", "Race calendar", CalendarDays, EventSchedule],
  ["/standings", "Championship", Trophy, Standings],
  ["/teams", "Teams & drivers", Users, Teams],
  ["/results", "Session results", Flag, SessionResults],
  ["/laps", "Lap timing", Timer, LapTiming],
  ["/telemetry", "Telemetry", Activity, Telemetry],
  ["/race-control", "Race control", Radio, RaceControl],
  ["/circuit", "Circuit explorer", MapPin, CircuitInfo],
];
function Workspace() {
  const [effectsReduced, setEffectsReduced] = useState(() => {
    try {
      return localStorage.getItem("circuit-stream-reduced-effects") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.effects = effectsReduced
      ? "reduced"
      : "full";
    try {
      localStorage.setItem(
        "circuit-stream-reduced-effects",
        String(effectsReduced)
      );
    } catch {}
    window.dispatchEvent(new Event("circuit-stream-effects"));
  }, [effectsReduced]);
  const toggleEffects = () => setEffectsReduced((value) => !value);
  const [status, setStatus] = useState("checking");
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef(null);
  const trigger = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const matches = pages.filter(([, title]) =>
    title.toLowerCase().includes(query.toLowerCase())
  );
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: "#101114" });
      StatusBar.setOverlaysWebView({ overlay: false });
    }
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setStatus("connected"))
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("disconnected");
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    setMenu(false);
    setSearch(false);
    setQuery("");
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    const key = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === "Escape") {
        setSearch(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (search) input.current?.focus();
  }, [search]);
  const closeSearch = () => {
    setSearch(false);
    trigger.current?.focus();
  };
  const jump = (path) => {
    navigate(path);
    closeSearch();
  };
  return (
    <div
      className={`App modern-app ${
        location.pathname === "/" ? "is-experience" : "is-lab"
      }`}
    >
      <a className="skip-link" href="#workspace-content">
        Skip to content
      </a>
      {menu && (
        <button
          className="workspace-overlay"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`workspace-sidebar ${menu ? "is-open" : ""}`}>
        <NavLink to="/" className="workspace-brand">
          <span className="brand-symbol">
            <Activity size={25} />
          </span>
          <span>
            CIRCUIT<span className="brand-light">STREAM</span>
            <small>THE FORMULA 1 WORKSPACE</small>
          </span>
        </NavLink>
        <button
          className="sidebar-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        >
          <X size={20} />
        </button>
        <div className="nav-caption">PADDOCK</div>
        <nav aria-label="Main navigation">
          {pages.map(([path, title, Icon], i) => (
            <React.Fragment key={path}>
              {i === 4 && (
                <div className="nav-caption analysis-caption">ANALYSIS LAB</div>
              )}
              <NavLink to={path} end={path === "/"} className="workspace-nav">
                <Icon size={18} />
                <span>{title}</span>
                {path === "/telemetry" && <small>LAB</small>}
              </NavLink>
            </React.Fragment>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="motion-toggle"
            aria-pressed={effectsReduced}
            onClick={toggleEffects}
            title="Reduce motion and visual effects"
          >
            Motion {effectsReduced ? "off" : "on"}
            <span>{effectsReduced ? "STATIC" : "SUBTLE"}</span>
          </button>
          <div className="sidebar-note">
            <span className="tiny-label">EVERY MILLISECOND MATTERS</span>
            <p>Go beyond the finish line.</p>
            <NavLink to="/telemetry">
              Explore the data <ArrowUpRight size={15} />
            </NavLink>
          </div>
          <div className={`connection ${status}`} role="status">
            <i />
            {status === "connected"
              ? "Data service connected"
              : status === "checking"
              ? "Connecting to data service"
              : "Data service unavailable"}
          </div>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="topbar-location">
            <button
              className="sidebar-toggle icon-button"
              aria-label="Open navigation"
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {pages.find(([path]) => path === location.pathname)?.[1] ||
                "Circuit Stream"}
            </strong>
          </div>
          <button
            ref={trigger}
            className="workspace-search"
            onClick={() => setSearch(true)}
          >
            <Search size={16} />
            <span>Jump to a page</span>
            <kbd>Ctrl K</kbd>
          </button>
        </header>
        <main id="workspace-content" className="main-content" tabIndex={-1}>
          <div key={location.pathname} className="route-enter">
            <Routes>
              {pages.map(([path, , , Component]) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    path === "/" ? (
                      <Experience
                        effectsReduced={effectsReduced}
                        onToggleEffects={toggleEffects}
                      >
                        <Component />
                      </Experience>
                    ) : (
                      <section
                        className={`lab-page ${
                          [
                            "/telemetry",
                            "/laps",
                            "/results",
                            "/race-control",
                            "/circuit",
                          ].includes(path)
                            ? "has-lab-intro"
                            : ""
                        }`}
                      >
                        <LabIntro path={path} />
                        <Component />
                      </section>
                    )
                  }
                />
              ))}
              <Route
                path="*"
                element={
                  <div className="empty-panel">
                    <h1>Off the racing line.</h1>
                    <p>This page could not be found.</p>
                    <NavLink to="/">Return to overview</NavLink>
                  </div>
                }
              />
            </Routes>
          </div>
        </main>
        <footer className="workspace-footer">
          <span>
            CIRCUIT STREAM <span className="footer-dot">/</span> Independent F1
            analysis
          </span>
          <span>FastF1 + OpenF1</span>
        </footer>
      </div>
      {search && (
        <div className="command-backdrop" onClick={closeSearch}>
          <section
            className="command-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Jump to a page"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                const all = e.currentTarget.querySelectorAll("input,button");
                const first = all[0],
                  last = all[all.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <div className="command-input">
              <Search size={20} />
              <input
                ref={input}
                aria-label="Search pages"
                placeholder="Where do you want to go?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matches[0]) {
                    e.preventDefault();
                    jump(matches[0][0]);
                  }
                }}
              />
              <button
                className="icon-button"
                aria-label="Close search"
                onClick={closeSearch}
              >
                <X size={18} />
              </button>
            </div>
            <div className="command-results">
              {matches.map(([path, title, Icon]) => (
                <button key={path} onClick={() => jump(path)}>
                  <Icon size={18} />
                  {title}
                  <ArrowUpRight size={16} />
                </button>
              ))}
              {!matches.length && <p>No matching pages.</p>}
            </div>
            <div className="command-hint">
              Enter to open the first match · Esc to close
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Workspace />
    </BrowserRouter>
  );
}
