"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Map from "./components/Map";
import StatusPanel from "./components/StatusPanel";
import Controls from "./components/Controls";
import { createRouteTimeline, type Timeline } from "@/lib/animationConfig";
import {
  computeTruckStatus,
  getRoadPosition,
  TOTAL_DISTANCE_KM,
  TOTAL_DURATION_MS,
} from "@/lib/routeData";
import type { AnimationState } from "@/lib/types";

export default function Home() {
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [progress, setProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fitKey, setFitKey] = useState(0);
  const timelineRef = useRef<Timeline | null>(null);
  const status = computeTruckStatus(progress);
  const { position } = getRoadPosition(
    status.segmentIndex,
    status.segmentProgress,
  );
  useEffect(
    () => () => {
      timelineRef.current?.pause();
    },
    [],
  );
  const onComplete = useCallback(() => {
    setProgress(1);
    setAnimationState("completed");
  }, []);
  function start() {
    if (!timelineRef.current || animationState === "completed") {
      timelineRef.current?.pause();
      timelineRef.current = createRouteTimeline(setProgress, onComplete);
      setProgress(0);
    }
    timelineRef.current.speed = speed;
    timelineRef.current.play();
    setAnimationState("playing");
  }
  function pause() {
    timelineRef.current?.pause();
    setAnimationState("paused");
  }
  function reset() {
    timelineRef.current?.pause();
    timelineRef.current = null;
    setProgress(0);
    setAnimationState("idle");
  }
  function changeSpeed(value: number) {
    setSpeed(value);
    if (timelineRef.current) timelineRef.current.speed = value;
  }
  const stateLabel = {
    idle: "Ready to depart",
    playing: "In transit",
    paused: "Tracking paused",
    completed: "Route completed",
  }[animationState];
  return (
    <div className={`workspace ${darkMode ? "dark" : ""}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-symbol">
            f<span>↗</span>
          </span>
          <span>FreightFox</span>
        </div>
        <div className="topbar-divider" />
        <span className="workspace-name">Dispatch workspace</span>
        <div className="topbar-right">
          <span className="demo-label">Simulation mode</span>
          <button
            className="icon-button"
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀" : "☾"}
          </button>
          <span className="avatar" title="Dispatch operator">
            FF
          </span>
        </div>
      </header>
      <main className="main-content">
        <div className="page-heading">
          <div>
            <div className="breadcrumb">
              Operations <span>/</span> Route tracking
            </div>
            <h1>
              Truck Route Visualizer<span className="heading-dot">.</span>
            </h1>
            <p>Track delivery progress along the Noida route.</p>
          </div>
          <div className="region">
            <span className="region-pin">⌖</span>
            <div>
              Noida, Uttar Pradesh<small>India · Local delivery route</small>
            </div>
          </div>
        </div>
        <div className="tracking-grid">
          <section className="map-card" aria-label="Route map and playback">
            <div className="map-heading">
              <div>
                <span className="route-code">Route 001</span>
                <span className="route-title">Noida delivery run</span>
              </div>
              <span className={`status-badge ${animationState}`}>
                <i />
                {stateLabel}
              </span>
            </div>
            <div className="map-stage">
              <Map
                truckLat={position[0]}
                truckLng={position[1]}
                progress={progress}
                darkMode={darkMode}
                fitKey={fitKey}
              />
              <div className="map-caption">
                <span className="map-caption-icon">⌁</span>
                <div>
                  Origin to D3
                  <small>
                    3 delivery stops · {TOTAL_DISTANCE_KM.toFixed(1)} km
                  </small>
                </div>
              </div>
              <button
                className="fit-button"
                onClick={() => setFitKey((k) => k + 1)}
              >
                ⌖ <span>Fit route</span>
              </button>
              <div className="map-legend">
                <span>
                  <i className="legend-planned" />
                  Planned route
                </span>
                <span>
                  <i className="legend-covered" />
                  Distance covered
                </span>
              </div>
            </div>
            <div className="playback">
              <div className="playback-top">
                <span>Route playback</span>
                <span className="timecode">
                  {((progress * TOTAL_DURATION_MS) / 1000).toFixed(1)}s{" "}
                  <em>/ {TOTAL_DURATION_MS / 1000}s</em>
                </span>
              </div>
              <div
                className="playback-track"
                role="progressbar"
                aria-label="Route playback progress"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div style={{ width: `${progress * 100}%` }} />
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} style={{ left: `${(i / 3) * 100}%` }} />
                ))}
              </div>
              <div className="playback-bottom">
                <Controls
                  animationState={animationState}
                  onStart={start}
                  onPause={pause}
                  onReset={reset}
                />
                <label className="speed-control">
                  Speed
                  <select
                    value={speed}
                    onChange={(e) => changeSpeed(Number(e.target.value))}
                  >
                    <option value={0.5}>0.5×</option>
                    <option value={1}>1×</option>
                    <option value={2}>2×</option>
                  </select>
                </label>
              </div>
            </div>
          </section>
          <StatusPanel status={status} animationState={animationState} />
        </div>
        <footer className="page-footer">
          <span>
            <i />
            Road route via OSRM / OpenStreetMap. Simulated driving at 30 km/h.
          </span>
          <span>Origin → D1 → D2 → D3</span>
        </footer>
      </main>
    </div>
  );
}
