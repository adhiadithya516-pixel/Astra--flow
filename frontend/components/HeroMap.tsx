"use client";
import { MapContainer, TileLayer, CircleMarker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const demoRoutes = [
  { positions: [[12.97, 77.59], [13.08, 77.57], [13.20, 77.68], [13.35, 77.72]] as [number, number][], color: "#3B82F6" },
  { positions: [[19.07, 72.87], [19.12, 72.91], [19.23, 72.98]] as [number, number][], color: "#06B6D4" },
  { positions: [[28.61, 77.20], [28.68, 77.25], [28.75, 77.30]] as [number, number][], color: "#8B5CF6" },
];

export default function HeroMap() {
  return (
    <MapContainer center={[20.59, 78.96]} zoom={5} zoomControl={false} attributionControl={false}
      style={{ width: "100%", height: "100%", background: "#050810" }}
      dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      {demoRoutes.map((r, i) => (
        <span key={i}>
          <Polyline positions={r.positions} pathOptions={{ color: r.color, weight: 2, opacity: 0.6 }} />
          {r.positions.map((p, j) => (
            <CircleMarker key={j} center={p} radius={j === r.positions.length - 1 ? 5 : 3}
              pathOptions={{ color: r.color, fillColor: r.color, fillOpacity: 0.8, weight: 1 }} />
          ))}
        </span>
      ))}
    </MapContainer>
  );
}
