"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, LayerGroup } from "leaflet";

export type MapMarker = { lat: number; lng: number; label: string; approx?: boolean };

/**
 * Lightweight Leaflet wrapper (OpenStreetMap tiles, no API key).
 * - `markers` renders pins (circles for approximate areas)
 * - `onPick` enables click-to-pick coordinate mode
 */
export function SpotMap({
  markers = [],
  onPick,
  picked,
  center,
  height = "20rem",
}: {
  markers?: MapMarker[];
  onPick?: (lat: number, lng: number) => void;
  picked?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  height?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current || mapRef.current) return;

      const start = center ?? markers[0] ?? { lat: 39.5, lng: -95.5 };
      const map = L.map(ref.current).setView([start.lat, start.lng], center || markers.length ? 9 : 4);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);

      if (onPickRef.current) {
        map.on("click", (e) => {
          onPickRef.current?.(e.latlng.lat, e.latlng.lng);
        });
      }
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // draw markers whenever they change
  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      const layer = layerRef.current;
      if (!map || !layer) return;
      layer.clearLayers();

      const pin = (color: string) =>
        L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid white;box-shadow:0 1px 4px rgb(0 0 0/.4)"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 18],
        });

      for (const m of markers) {
        if (m.approx) {
          L.circle([m.lat, m.lng], {
            radius: 1200,
            color: "#22829b",
            fillColor: "#22829b",
            fillOpacity: 0.18,
            weight: 2,
          })
            .bindPopup(`${m.label} <em>(approximate area)</em>`)
            .addTo(layer);
        } else {
          L.marker([m.lat, m.lng], { icon: pin("#d97a26") }).bindPopup(m.label).addTo(layer);
        }
      }
      if (picked) {
        L.marker([picked.lat, picked.lng], { icon: pin("#22829b") }).addTo(layer);
      }
      if (markers.length > 0 && !picked) {
        const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
        map.fitBounds(bounds.pad(0.3), { maxZoom: 12 });
      }
    })();
  }, [markers, picked]);

  return <div ref={ref} style={{ height }} className="rounded-2xl border border-sand-200 z-0" />;
}
