import roadRoute from "./roadRoute.json";
import type { RoutePoint, RouteSegment, TruckStatus } from "./types";

export const ROUTE_POINTS: RoutePoint[] = [
  { id: "origin", label: "Origin", lat: 28.5355, lng: 77.391, type: "origin" },
  { id: "d1", label: "D1", lat: 28.55, lng: 77.41, type: "delivery" },
  { id: "d2", label: "D2", lat: 28.57, lng: 77.45, type: "delivery" },
  { id: "d3", label: "D3", lat: 28.59, lng: 77.48, type: "delivery" },
];

// Snap the sample stops to the road positions returned by the routing engine.
ROUTE_POINTS.forEach((point, index) => {
  const coordinates =
    index === 0
      ? roadRoute.legs[0].coordinates[0]
      : roadRoute.legs[index - 1].coordinates.at(-1)!;
  [point.lat, point.lng] = coordinates;
});
export const ROUTE_SEGMENTS: RouteSegment[] = roadRoute.legs.map(
  (leg, index) => ({
    from: ROUTE_POINTS[index].id,
    to: ROUTE_POINTS[index + 1].id,
    distanceKm: leg.distanceKm,
  }),
);
export const ROAD_POSITIONS = roadRoute.legs.flatMap((leg, index) =>
  index ? leg.coordinates.slice(1) : leg.coordinates,
) as [number, number][];
function meters(a: number[], b: number[]) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b[0] - a[0]) * rad) / 2) ** 2 +
    Math.cos(a[0] * rad) *
      Math.cos(b[0] * rad) *
      Math.sin(((b[1] - a[1]) * rad) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
const legDistances = roadRoute.legs.map((leg) => {
  const cumulative = [0];
  for (let i = 1; i < leg.coordinates.length; i++)
    cumulative.push(
      cumulative[i - 1] + meters(leg.coordinates[i - 1], leg.coordinates[i]),
    );
  return cumulative;
});
export function getRoadPosition(segmentIndex: number, progress: number) {
  const points = roadRoute.legs[segmentIndex].coordinates as [number, number][];
  const distances = legDistances[segmentIndex];
  const target =
    Math.max(0, Math.min(1, progress)) * distances[distances.length - 1];
  let index = 1;
  while (index < distances.length - 1 && distances[index] < target) index++;
  const fraction =
    (target - distances[index - 1]) /
    (distances[index] - distances[index - 1] || 1);
  const position: [number, number] = [
    points[index - 1][0] + (points[index][0] - points[index - 1][0]) * fraction,
    points[index - 1][1] + (points[index][1] - points[index - 1][1]) * fraction,
  ];
  const covered = [
    ...roadRoute.legs.slice(0, segmentIndex).flatMap((leg) => leg.coordinates),
    ...points.slice(0, index),
    position,
  ] as [number, number][];
  // Bearing clockwise from north, matching the north-facing vehicle artwork.
  const from = points[index - 1];
  const to = points[index];
  const rad = Math.PI / 180;
  const deltaLng = (to[1] - from[1]) * rad;
  const heading =
    (Math.atan2(
      Math.sin(deltaLng) * Math.cos(to[0] * rad),
      Math.cos(from[0] * rad) * Math.sin(to[0] * rad) -
        Math.sin(from[0] * rad) * Math.cos(to[0] * rad) * Math.cos(deltaLng),
    ) *
      180) /
    Math.PI;
  return { position, covered, heading };
}

export const TOTAL_DISTANCE_KM = ROUTE_SEGMENTS.reduce(
  (sum, seg) => sum + seg.distanceKm,
  0,
);

export const MOCK_SPEED_KMH = 30;

/** Each delivery leg gets ten seconds of accelerated demo playback. */
export const SEGMENT_DURATION_MS = 10000; // each leg = 10 seconds

/** Total animation duration */
export const TOTAL_DURATION_MS = SEGMENT_DURATION_MS * ROUTE_SEGMENTS.length; // 30 seconds

/**
 * Given a 0–1 progress value over the entire timeline,
 * compute the truck status.
 */
export function computeTruckStatus(progress: number): TruckStatus {
  const totalSegments = ROUTE_SEGMENTS.length;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  // Which segment are we on?
  const rawSegment = clampedProgress * totalSegments;
  const segmentIndex = Math.min(Math.floor(rawSegment), totalSegments - 1);
  const segmentProgress = rawSegment - Math.floor(rawSegment);

  const effectiveSegmentProgress =
    segmentIndex === totalSegments - 1 && clampedProgress >= 1
      ? 1
      : segmentProgress;

  const fromPoint = ROUTE_POINTS[segmentIndex];
  const toPoint = ROUTE_POINTS[segmentIndex + 1];

  // Distance covered up to start of this segment
  const distanceBefore = ROUTE_SEGMENTS.slice(0, segmentIndex).reduce(
    (sum, seg) => sum + seg.distanceKm,
    0,
  );
  const segmentDistance = ROUTE_SEGMENTS[segmentIndex].distanceKm;
  const distanceCovered =
    clampedProgress >= 1
      ? TOTAL_DISTANCE_KM
      : distanceBefore + segmentDistance * effectiveSegmentProgress;

  // Location label
  let currentLocation: string;
  let completedStops: number;
  let nextStop: string | null;

  if (clampedProgress <= 0) {
    currentLocation = "At Origin";
    completedStops = 0;
    nextStop = "D1";
  } else if (clampedProgress >= 1) {
    currentLocation = "At D3";
    completedStops = 3;
    nextStop = null;
  } else if (effectiveSegmentProgress < 0.05) {
    // Just arrived at fromPoint
    currentLocation = `At ${fromPoint.label}`;
    completedStops = segmentIndex;
    nextStop = toPoint.label;
  } else if (effectiveSegmentProgress >= 1) {
    // Just arrived at toPoint
    currentLocation = `At ${toPoint.label}`;
    completedStops = segmentIndex + 1;
    nextStop = ROUTE_POINTS[segmentIndex + 2]?.label ?? null;
  } else {
    currentLocation = `${fromPoint.label} → ${toPoint.label}`;
    completedStops = segmentIndex;
    nextStop = toPoint.label;
  }

  return {
    currentLocation,
    distanceCovered: Math.round(distanceCovered * 10) / 10,
    totalDistance: TOTAL_DISTANCE_KM,
    nextStop,
    completedStops,
    totalStops: 3,
    progress: clampedProgress,
    segmentIndex,
    segmentProgress: effectiveSegmentProgress,
  };
}
