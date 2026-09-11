"use client";
import dynamic from "next/dynamic";
const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => <div className="map-loading">Loading route map…</div>,
});
export interface MapProps {
  truckLat: number;
  truckLng: number;
  progress: number;
  darkMode: boolean;
  fitKey: number;
}
export default function Map(props: MapProps) {
  return <MapInner {...props} />;
}
