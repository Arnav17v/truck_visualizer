"use client";
import type { AnimationState, TruckStatus } from "@/lib/types";
import { ROUTE_POINTS, ROUTE_SEGMENTS, MOCK_SPEED_KMH } from "@/lib/routeData";
export default function StatusPanel({
  status,
  animationState,
}: {
  status: TruckStatus;
  animationState: AnimationState;
}) {
  const remaining = Math.max(0, status.totalDistance - status.distanceCovered);
  const eta = Math.ceil((remaining / MOCK_SPEED_KMH) * 60);
  return (
    <aside className="status-panel">
      <section className="vehicle-section">
        <div className="section-title">
          <h2>Truck overview</h2>
          <span className="vehicle-id">TRK-001</span>
        </div>
        <div className="vehicle-row">
          <div className="truck-drawing" aria-hidden>
            <div className="truck-box" />
            <div className="truck-cab" />
            <i />
            <i />
          </div>
          <div>
            <h3>Delivery truck</h3>
            <p>Local distribution · Noida</p>
          </div>
        </div>
        <div className="location-box">
          <span>Current location</span>
          <strong>{status.currentLocation}</strong>
          <small>
            {animationState === "idle"
              ? "Start tracking to begin the route."
              : animationState === "paused"
                ? "Position saved. Resume to continue."
                : animationState === "completed"
                  ? "All three deliveries completed."
                  : `Heading to delivery point ${status.nextStop}`}
          </small>
        </div>
      </section>
      <section className="journey-section">
        <div className="section-title">
          <h2>Journey progress</h2>
          <strong className="percentage">
            {Math.round(status.progress * 100)}
            <span>%</span>
          </strong>
        </div>
        <div className="journey-bar">
          <span style={{ width: `${status.progress * 100}%` }} />
        </div>
        <div className="metrics">
          <div>
            <span>Distance covered</span>
            <strong>
              {status.distanceCovered.toFixed(1)}{" "}
              <small>/ {status.totalDistance.toFixed(1)} km</small>
            </strong>
          </div>
          <div>
            <span>Estimated remaining</span>
            <strong>
              {eta} <small>min</small>
            </strong>
          </div>
        </div>
        <div className="eta-note">
          Based on a simulated speed of {MOCK_SPEED_KMH} km/h
        </div>
      </section>
      <section className="stops-section">
        <div className="section-title">
          <h2>Delivery timeline</h2>
          <span className="stops-count">
            {status.completedStops} of 3 completed
          </span>
        </div>
        <ol className="stop-list">
          {ROUTE_POINTS.map((point, index) => {
            const done =
              index === 0
                ? status.progress > 0
                : status.completedStops >= index;
            const next = status.nextStop === point.label;
            return (
              <li
                key={point.id}
                className={`${done ? "done" : ""} ${next ? "next" : ""}`}
              >
                <div className="stop-marker">
                  {done ? "✓" : index === 0 ? "○" : index}
                </div>
                <div className="stop-copy">
                  <div>
                    <strong>
                      {index === 0
                        ? "Origin warehouse"
                        : `Delivery point ${point.label}`}
                    </strong>
                    {next && <span className="next-label">Next stop</span>}
                  </div>
                  <p>
                    {index === 0
                      ? "Departure point"
                      : `${ROUTE_SEGMENTS[index - 1].distanceKm.toFixed(1)} km from ${index === 1 ? "origin" : `D${index - 1}`}`}
                  </p>
                </div>
                <span className="stop-state">
                  {done ? "Done" : index === 0 ? "Ready" : "Pending"}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
      <div className="route-summary">
        <span>Total route distance</span>
        <strong>
          {status.totalDistance.toFixed(1)} <small>km</small>
        </strong>
      </div>
    </aside>
  );
}
