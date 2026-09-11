"use client";
import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMap,
  ZoomControl,
  Pane,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ROUTE_POINTS,
  ROAD_POSITIONS,
  getRoadPosition,
  computeTruckStatus,
} from "@/lib/routeData";
import type { MapProps } from "./Map";
const truckIcon = L.divIcon({
  className: "truck-map-icon",
  html: '<div class="vehicle-halo"></div><div class="semi-heading"><img src="/semi-truck-top.svg" width="30" height="64" alt="" /></div>',
  iconSize: [64, 64],
  iconAnchor: [32, 32],
});
function TruckMarker({
  position,
  heading,
}: {
  position: [number, number];
  heading: number;
}) {
  const marker = useRef<L.Marker>(null);
  const rotation = useRef<number | null>(null);
  useEffect(() => {
    const element = marker.current
      ?.getElement()
      ?.querySelector<HTMLElement>(".semi-heading");
    if (!element) return;
    const previous = rotation.current;
    const angle =
      previous === null
        ? heading
        : previous + ((((heading - previous + 540) % 360) + 360) % 360) - 180;
    element.style.transform = `rotate(${angle}deg)`;
    rotation.current = angle;
  }, [heading]);
  return (
    <Marker
      pane="vehicle"
      ref={marker}
      position={position}
      icon={truckIcon}
      zIndexOffset={1000}
      title="Delivery semi truck · TRK-001"
      alt="Delivery semi truck"
    >
      <Popup>Delivery truck · TRK-001</Popup>
    </Marker>
  );
}
function stopIcon(label: string, completed: boolean) {
  return L.divIcon({
    className: "stop-map-icon",
    html: `<div class="map-stop ${completed ? "delivered" : ""}">${completed ? "✓" : label === "Origin" ? "O" : label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}
function FitBounds({ fitKey }: { fitKey: number }) {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      map.invalidateSize();
      map.fitBounds(L.latLngBounds(ROAD_POSITIONS), {
        padding: [85, 95],
      });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, fitKey]);
  return null;
}
export default function MapInner({
  truckLat,
  truckLng,
  progress,
  darkMode,
  fitKey,
}: MapProps) {
  const [tileError, setTileError] = useState(false);
  const key = process.env.NEXT_PUBLIC_CARTO_BASEMAPS_API_KEY;
  const positions = ROAD_POSITIONS;
  const status = computeTruckStatus(progress);
  const { covered, heading } = getRoadPosition(
    status.segmentIndex,
    status.segmentProgress,
  );
  const url = key
    ? `https://basemaps.cartocdn.com/${darkMode ? "dark_all" : "light_all"}/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  return (
    <>
      <MapContainer
        center={[28.56, 77.43]}
        zoom={13}
        zoomSnap={0.25}
        zoomControl={false}
        className={`${!key ? "osm-map" : ""} ${darkMode ? "map-dark" : ""}`}
      >
        <TileLayer
          key={url}
          url={url}
          attribution={
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' +
            (key
              ? ' &copy; <a href="https://carto.com/attributions">CARTO</a>'
              : "")
          }
          eventHandlers={{
            tileerror: () => setTileError(true),
            load: () => setTileError(false),
          }}
        />
        <FitBounds fitKey={fitKey} />
        <ZoomControl position="topright" />
        <Polyline
          positions={positions}
          pathOptions={{
            color: darkMode ? "#493e35" : "#ffffff",
            weight: 8,
            opacity: 0.9,
          }}
        />
        <Polyline
          positions={positions}
          pathOptions={{
            color: "#d88256",
            weight: 3,
            dashArray: "7 8",
            opacity: 1,
          }}
        />
        {progress > 0 && (
          <Polyline
            positions={covered}
            pathOptions={{ color: "#d65c27", weight: 5 }}
          />
        )}
        {ROUTE_POINTS.map((p, i) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={stopIcon(
              p.label,
              i === 0 ? progress > 0 : status.completedStops >= i,
            )}
          >
            <Tooltip
              permanent
              direction={i === 3 ? "left" : "right"}
              offset={[i === 3 ? -19 : 19, 0]}
              className="stop-tooltip"
            >
              {i === 0 ? "Origin warehouse" : `Delivery ${p.label}`}
            </Tooltip>
            <Popup>
              <strong>{p.label}</strong>
              <br />
              {i === 0
                ? "Departure warehouse"
                : status.completedStops >= i
                  ? "Delivery completed"
                  : "Delivery pending"}
            </Popup>
          </Marker>
        ))}
        <Pane name="vehicle" style={{ zIndex: 675 }}>
          <TruckMarker position={[truckLat, truckLng]} heading={heading} />
        </Pane>
      </MapContainer>
      {tileError && (
        <div className="map-error" role="status">
          Map tiles unavailable. Route tracking still works. Check your
          connection or basemap key.
        </div>
      )}
    </>
  );
}
