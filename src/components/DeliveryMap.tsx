"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Info, X } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapPoint {
  name: string | null;
  lat: number | null;
  lng: number | null;
}

interface DeliveryMapProps {
  origin: MapPoint;
  destination: MapPoint;
  current?: MapPoint;
  className?: string;
}

const MARKER_COLOR = {
  origin: "#ea580c",
  current: "#2563eb",
  destination: "#0f172a",
} as const;

const LEGEND_LABEL = {
  origin: "Origin",
  current: "Current location",
  destination: "Destination",
} as const;

export function DeliveryMap({ origin, destination, current, className = "" }: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  const hasOrigin = origin.lat != null && origin.lng != null;
  const hasDestination = destination.lat != null && destination.lng != null;
  const hasCurrent = current != null && current.lat != null && current.lng != null;

  const legendPoints: { key: keyof typeof MARKER_COLOR; name: string | null }[] = [
    ...(hasOrigin ? [{ key: "origin" as const, name: origin.name }] : []),
    ...(hasCurrent ? [{ key: "current" as const, name: current?.name ?? null }] : []),
    ...(hasDestination ? [{ key: "destination" as const, name: destination.name }] : []),
  ];

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || (!hasOrigin && !hasDestination && !hasCurrent)) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Kept in a fixed conceptual order so the route line always reads as
    // origin -> current -> destination, however many of the three exist.
    const points: { key: keyof typeof MARKER_COLOR; coord: [number, number]; label: string | null }[] =
      [];
    if (hasOrigin) points.push({ key: "origin", coord: [origin.lng!, origin.lat!], label: origin.name });
    if (hasCurrent) {
      points.push({
        key: "current",
        coord: [current?.lng as number, current?.lat as number],
        label: current?.name ?? null,
      });
    }
    if (hasDestination) {
      points.push({ key: "destination", coord: [destination.lng!, destination.lat!], label: destination.name });
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: points[0].coord,
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    for (const point of points) {
      new mapboxgl.Marker({ color: MARKER_COLOR[point.key] })
        .setLngLat(point.coord)
        .setPopup(
          new mapboxgl.Popup({ offset: 16 }).setText(point.label ?? LEGEND_LABEL[point.key])
        )
        .addTo(map);
    }

    if (points.length >= 2) {
      const bounds = points.reduce(
        (b, p) => b.extend(p.coord),
        new mapboxgl.LngLatBounds(points[0].coord, points[0].coord)
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 12 });

      map.on("load", () => {
        for (let i = 0; i < points.length - 1; i++) {
          const from = points[i];
          const to = points[i + 1];
          // The origin -> current leg is the traveled portion (solid); any
          // leg ending at the destination is what's left (dashed).
          const traveled = from.key === "origin" && to.key === "current";

          map.addSource(`route-${i}`, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: [from.coord, to.coord] },
            },
          });
          map.addLayer({
            id: `route-line-${i}`,
            type: "line",
            source: `route-${i}`,
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#ea580c",
              "line-width": 3,
              ...(traveled ? {} : { "line-dasharray": [0.2, 1.6] }),
            },
          });
        }
      });
    }

    return () => map.remove();
  }, [
    hasOrigin,
    hasDestination,
    hasCurrent,
    origin.lat,
    origin.lng,
    origin.name,
    destination.lat,
    destination.lng,
    destination.name,
    current?.lat,
    current?.lng,
    current?.name,
  ]);

  if (!MAPBOX_TOKEN || (!hasOrigin && !hasDestination && !hasCurrent)) {
    return null;
  }

  return (
    <div className={`relative h-72 w-full overflow-hidden rounded-lg border border-border ${className}`}>
      <div ref={containerRef} className="h-full w-full" />

      <button
        type="button"
        onClick={() => setLegendOpen((v) => !v)}
        aria-label={legendOpen ? "Hide location details" : "Show location details"}
        className="absolute top-2 left-2 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm hover:bg-muted"
      >
        {legendOpen ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
      </button>

      {legendOpen && (
        <div className="absolute top-12 left-2 z-10 w-56 rounded-md border border-border bg-background p-3 shadow-md">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Locations
          </p>
          <ul className="space-y-2">
            {legendPoints.map((point) => (
              <li key={point.key} className="flex items-start gap-2 text-sm">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: MARKER_COLOR[point.key] }}
                />
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-muted-foreground">
                    {LEGEND_LABEL[point.key]}
                  </span>
                  <span className="block break-words text-foreground">
                    {point.name ?? "Not set"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
