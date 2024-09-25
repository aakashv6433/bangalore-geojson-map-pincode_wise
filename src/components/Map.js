import React from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import bangalore from "../data/bangalore.json";

const Map = ({ mapKey, zones, onEachFeature }) => {
  return (
    <MapContainer
      key={mapKey} // Trigger re-render with new key
      center={[12.955185, 77.58]}
      zoom={11}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON data={bangalore} onEachFeature={onEachFeature} />
    </MapContainer>
  );
};

export default Map;
