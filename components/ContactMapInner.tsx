"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { COMPANY } from "@/lib/site";

type Props = {
  ariaLabel: string;
  directionsLabel: string;
};

export default function ContactMapInner({ ariaLabel, directionsLabel }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = [COMPANY.geo.lat, COMPANY.geo.lng];
    const map = L.map(containerRef.current, {
      center,
      zoom: 16,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: "consultec-pin",
      html: `<div style="width:22px;height:22px;border-radius:50%;background:#D92027;box-shadow:0 0 0 6px rgba(217,32,39,0.22),0 8px 20px -8px rgba(0,0,0,0.45);border:3px solid #fff;"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    const marker = L.marker(center, { icon, title: COMPANY.name }).addTo(map);
    marker
      .bindPopup(
        `<strong>${COMPANY.name}</strong><br/>${COMPANY.address.street}<br/>${COMPANY.address.postalCode} ${COMPANY.address.city}<br/><a href="${COMPANY.googleMapsDirections}" target="_blank" rel="noopener noreferrer">${directionsLabel} →</a>`,
      )
      .openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [directionsLabel]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className="h-[380px] w-full overflow-hidden rounded-2xl border border-[--color-line] md:h-[460px]"
    />
  );
}
