import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Next.js bundlaydigan vaqtda Leaflet standart marker rasmlari buzilib qoladi,
// shuning uchun ularni CDN orqali qo'lda belgilaymiz.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  center?: [number, number];
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ center = [41.311081, 69.240562], onChange }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const handlePick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onChange(lat, lng);
  };

  return (
    <div className="rounded-xl overflow-hidden border" style={{ height: 300 }}>
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={handlePick} />
        {position && <Marker position={position} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}
