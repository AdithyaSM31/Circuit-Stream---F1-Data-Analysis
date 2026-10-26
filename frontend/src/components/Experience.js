import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDown, Activity, Menu, X } from "lucide-react";
import "./Experience.css";
import { attachSceneMotion } from "../utils/sceneMotion";

export default function Experience({
  children,
  effectsReduced,
  onToggleEffects,
}) {
  const root = useRef(null);
  const [menu, setMenu] = React.useState(false);
  useEffect(() => {
    const element = root.current;
    const stopMotion = attachSceneMotion(element);
    const onKey = (e) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );
    element
      .querySelectorAll("[data-reveal]")
      .forEach((item) => observer.observe(item));
    return () => {
      stopMotion();
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  return (
    <div className="brand-experience" ref={root}>
      <header className="experience-nav">
        <Link
          to="/"
          className="experience-logo"
          aria-label="Circuit Stream home"
        >
          <Activity size={28} />
          <span>
            CIRCUIT
            <br />
            <b>STREAM</b>
          </span>
        </Link>
        <nav
          className={menu ? "experience-links is-open" : "experience-links"}
          aria-label="Experience navigation"
        >
          <a href="#race-center" onClick={() => setMenu(false)}>
            Race center
          </a>
          <Link to="/schedule">Calendar</Link>
          <Link to="/teams">The grid</Link>
          <Link to="/telemetry">
            Analysis lab <ArrowUpRight size={13} />
          </Link>
        </nav>
        <button
          className="motion-toggle experience-motion"
          onClick={onToggleEffects}
          aria-pressed={effectsReduced}
          title="Reduce motion and visual effects"
        >
          Motion {effectsReduced ? "off" : "on"}
        </button>
        <Link className="nav-launch" to="/telemetry">
          Enter the lab <ArrowUpRight size={16} />
        </Link>
        <button
          className="experience-menu"
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          onClick={() => setMenu((v) => !v)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <section className="cinema-scroll" aria-labelledby="cinema-title">
        <div className="cinema-stage">
          <div className="cinema-texture" />
          <div className="cinema-lane" />
          <div className="cinema-halo" />
          <div className="hero-edition">
            <span>INDEPENDENT FORMULA 1 INTELLIGENCE</span>
            <span>EST. FOR THE OBSESSED / {new Date().getFullYear()}</span>
          </div>
          <h1 id="cinema-title" className="cinema-title">
            <span>RACE</span>
            <span>DECODED.</span>
          </h1>
          <div className="cinema-car">
            <img
              src="/images/experience/scarlet-overhead.png"
              alt="Sculptural overhead view of a scarlet open-wheel racing car"
              fetchpriority="high"
            />
          </div>
          <div className="hero-side left">
            <span className="micro-label">[ 01 — THE PURSUIT ]</span>
            <p>
              Some watch the race.
              <br />
              You see what’s underneath.
            </p>
            <a href="#race-center">
              Discover the details <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="hero-side right">
            <span className="micro-label">PRECISION WITHOUT COMPROMISE</span>
            <div className="crosshair">+</div>
            <span className="micro-label">EVERY LAP. EVERY LAYER.</span>
          </div>
          <div className="hero-bottom">
            <a href="#velocity" className="scroll-cue">
              <span>
                <ArrowDown size={16} />
              </span>
              SCROLL TO FEEL THE DIFFERENCE
            </a>
            <span>
              THE SPORT IS SPEED.
              <br />
              <b>THE ADVANTAGE IS UNDERSTANDING.</b>
            </span>
            <span className="hero-coordinate">
              CS / F1
              <br />
              001 — ∞
            </span>
          </div>
        </div>
      </section>
      <section className="manifesto-section" data-reveal>
        <span className="micro-label">THE VIEW FROM THE PIT WALL</span>
        <h2>
          Instinct feels it.
          <br />
          <span>Data reveals it.</span>
        </h2>
        <div className="manifesto-bottom">
          <span className="manifesto-symbol">↗</span>
          <p>
            A late brake. An earlier throttle. A thousandth of a second.
            <br />
            Uncover the invisible decisions that make the difference.
          </p>
          <Link
            to="/laps"
            className="round-link"
            aria-label="Explore lap timing"
          >
            <ArrowUpRight />
          </Link>
        </div>
      </section>
      <section className="velocity-section" id="velocity">
        <div className="velocity-glow" />
        <div className="velocity-top" data-reveal>
          <span className="micro-label">[ 02 — THE ANATOMY OF A LAP ]</span>
          <span className="micro-label">ENGINEERED FOR CURIOSITY</span>
        </div>
        <div className="velocity-layout">
          <div className="velocity-copy" data-reveal>
            <h2>
              SPEED IS
              <br />A <em>LANGUAGE.</em>
            </h2>
            <p>Learn to read it.</p>
            <Link to="/telemetry" className="mint-button">
              Explore telemetry <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="velocity-art">
            <div className="velocity-orbit orbit-one" />
            <div className="velocity-orbit orbit-two" />
            <span className="velocity-word" aria-hidden="true">
              FULL SEND
            </span>
            <img
              src="/images/cars/2026mercedescarright.avif"
              alt="Mercedes Formula 1 car in profile"
              loading="lazy"
            />
            <div className="velocity-callout">
              <i />
              <span>
                THE MACHINE, UNDERSTOOD.
                <small>Speed · Throttle · Braking · DRS</small>
              </span>
            </div>
          </div>
        </div>
        <div className="velocity-bottom" data-reveal>
          <span>
            FROM FIRST INPUT
            <br />
            TO FINAL APEX.
          </span>
          <p>
            Go inside the lap with detailed telemetry.
            <br />
            Trace the inputs. Find the difference.
          </p>
          <span className="velocity-index">01 / 03</span>
        </div>
      </section>
      <section className="editorial-tools">
        <div className="editorial-heading" data-reveal>
          <span className="micro-label">[ 03 — CHOOSE YOUR PERSPECTIVE ]</span>
          <h2>
            Closer to the edge.
            <br />
            <span>Deeper into the race.</span>
          </h2>
        </div>
        {[
          [
            "/laps",
            "01",
            "Chase the thousandth.",
            "Lap times, sectors and tyre life. Find where the time is won.",
            "LAP TIMING",
          ],
          [
            "/standings",
            "02",
            "See the bigger picture.",
            "Follow the championship fight, one result at a time.",
            "CHAMPIONSHIP",
          ],
          [
            "/circuit",
            "03",
            "Know every corner.",
            "Explore the circuits that turn ambition into a racing line.",
            "CIRCUIT EXPLORER",
          ],
        ].map(([path, num, title, copy, label]) => (
          <Link key={path} to={path} className="editorial-row" data-reveal>
            <span className="editorial-number">/{num}</span>
            <div>
              <span className="micro-label">{label}</span>
              <h3>{title}</h3>
            </div>
            <p>{copy}</p>
            <span className="editorial-arrow">
              <ArrowUpRight size={28} />
            </span>
          </Link>
        ))}
      </section>
      <section className="live-race-center" id="race-center">
        <div className="race-center-intro" data-reveal>
          <span className="micro-label">
            <i /> CONNECT TO THE SEASON
          </span>
          <h2>
            Your seat.
            <br />
            <span>At the pit wall.</span>
          </h2>
          <p>
            The next lights out. The latest results.
            <br />
            Your race weekend, in focus.
          </p>
        </div>
        {children}
      </section>
      <div className="experience-end">
        <span>
          BUILT FOR THE
          <br />
          RELENTLESSLY CURIOUS.
        </span>
        <Link to="/telemetry">
          LET’S GO RACING <ArrowUpRight />
        </Link>
        <a href="#cinema-title">BACK TO TOP ↑</a>
      </div>
    </div>
  );
}
