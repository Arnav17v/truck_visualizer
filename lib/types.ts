export interface RoutePoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  type: "origin" | "delivery";
}

export interface RouteSegment {
  from: string;
  to: string;
  distanceKm: number;
}

export type AnimationState = "idle" | "playing" | "paused" | "completed";

export interface TruckStatus {
  currentLocation: string;
  distanceCovered: number;
  totalDistance: number;
  nextStop: string | null;
  completedStops: number;
  totalStops: number;
  progress: number; // 0–1
  segmentIndex: number; // which segment we're on
  segmentProgress: number; // 0–1 within the current segment
}
