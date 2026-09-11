# Truck Route Visualizer

A delivery route simulation through Noida, built with Next.js, React, Leaflet, and Anime.js.

The truck follows a cached road route through three delivery stops. Playback includes pause, resume, reset, and speed controls. The status panel shows distance covered, completed stops, and an estimated remaining time. The map supports light and dark themes.

## Run locally

Requires Node.js 20.9+ and pnpm.

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000. Set `NEXT_PUBLIC_CARTO_BASEMAPS_API_KEY` in `.env.local` for CARTO tiles. Without a key, the map uses OpenStreetMap tiles.

```sh
pnpm lint
pnpm build
pnpm start
```

## Route data

`lib/roadRoute.json` contains the OSRM driving route between the four sample locations. Stop positions are snapped to the road network, and the marker is interpolated along each leg with its heading aligned to the road.

The route covers 18.2 km. Each leg plays in ten seconds; the ETA assumes 30 km/h independently of playback speed. This is a fixed-route simulation, not live GPS tracking or truck-specific navigation. OSRM's driving profile does not account for vehicle height, weight, or truck restrictions.

Map data: OpenStreetMap contributors. Basemaps: CARTO or OpenStreetMap. Routing: OSRM.
