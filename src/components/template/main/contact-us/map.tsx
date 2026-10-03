"use client";

import { useEffect, useRef } from "react";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

const POSITION: [number, number] = [51.505, -0.09];
const ZOOM = 13;

export default function Map() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: LeafletMap | null = null;
    let resize: ResizeObserver | null = null;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current) return;

      map = L.map(container, { center: POSITION, zoom: ZOOM, scrollWheelZoom: false });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const icon = L.icon({
        iconUrl: markerIcon.src,
        iconRetinaUrl: markerIcon2x.src,
        shadowUrl: markerShadow.src,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      L.marker(POSITION, { icon }).addTo(map).bindPopup("SET-KIDS");

      resize = new ResizeObserver(() => map?.invalidateSize());
      resize.observe(container);
    })();

    return () => {
      cancelled = true;
      resize?.disconnect();
      if (map) {
        map.off();
        map.remove();
        map = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full min-h-[350px] w-full" aria-label="Store location map" />;
}
