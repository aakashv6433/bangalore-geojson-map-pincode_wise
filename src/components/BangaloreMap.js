import React, { useState, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import bangalore from "../data/bangalore.json";
import { FaTrash } from "react-icons/fa";
import { BsBorderWidth } from "react-icons/bs";

const Modal = ({
  show,
  onClose,
  onAddFeature,
  zones,
  selectedZone,
  setSelectedZone,
  selectedFeature,
  setSelectedFeature,
}) => {
  if (!show) return null;

  return (
    <div style={modalStyles}>
      <div style={modalContentStyles}>
        <h3>Select a Zone</h3>
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          style={selectStyles}
        >
          <option value="">Select a Zone</option>
          {zones.map((zone, index) => (
            <option key={index} value={zone.name}>
              {zone.name}
            </option>
          ))}
        </select>
        <select
          value={selectedFeature}
          onChange={(e) => setSelectedFeature(e.target.value)}
          style={selectStyles}
        >
          <option value="">Select a Pincode</option>
          {bangalore.features.map((feature, index) => {
            const pincode = feature.properties.PINCODE;
            return (
              <option key={index} value={pincode}>
                {pincode}
              </option>
            );
          })}
        </select>
        <button onClick={onAddFeature} style={buttonStyles.add}>
          Add Feature
        </button>
        <button onClick={onClose} style={buttonStyles.cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const BangaloreMap = () => {
  const [zones, setZones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedFeature, setSelectedFeature] = useState(null);

  const onEachFeature = useCallback(
    (feature, layer) => {
      if (feature.properties) {
        const pincode = feature.properties.PINCODE;
        const isAssigned = zones.some((zone) =>
          zone.features.includes(pincode)
        );

        layer.setStyle({
          color: isAssigned ? "gray" : "black",
          weight: 2,
          fillOpacity: 0.5,
        });

        layer.on({
          mouseover: (e) => {
            const layer = e.target;
            layer.setStyle({ color: "blue", weight: 3 });
            layer
              .bindTooltip(`Pincode: ${pincode}`, {
                permanent: false,
                direction: "top",
                offset: [0, -10],
              })
              .openTooltip();
          },
          mouseout: (e) => {
            const layer = e.target;
            layer.setStyle({ color: isAssigned ? "gray" : "black", weight: 2 });
            layer.closeTooltip();
          },
          click: () => {
            if (!isAssigned) {
              setSelectedFeature(pincode);
              setShowModal(true);
            }
          },
        });
      }
    },
    [zones]
  );

  const addZone = () => {
    const zoneName = prompt("Enter the name of the new zone:");
    if (zoneName) {
      setZones((prevZones) => [...prevZones, { name: zoneName, features: [] }]);
      setSelectedZone(zoneName);
    }
  };

  const handleAddFeatureToZone = useCallback(() => {
    if (selectedZone && selectedFeature) {
      // Check if the feature (pincode) already exists in any zone
      const isFeatureExists = zones.some((zone) =>
        zone.features.includes(selectedFeature)
      );

      // If the feature already exists, alert the user
      if (isFeatureExists) {
        alert(
          "This pincode is already assigned to another zone. Please remove it from that zone first."
        );
        return;
      }

      // Add the feature to the selected zone
      setZones((prevZones) =>
        prevZones.map((zone) =>
          zone.name === selectedZone
            ? { ...zone, features: [...zone.features, selectedFeature] }
            : zone
        )
      );
      setShowModal(false);
      setSelectedZone("");
      setSelectedFeature(null);
    } else {
      alert("Please select a zone and a feature.");
    }
  }, [selectedZone, selectedFeature, zones]);

  const handleRemoveFeature = (zoneName, pincode) => {
    setZones((prevZones) =>
      prevZones.map((zone) =>
        zone.name === zoneName
          ? { ...zone, features: zone.features.filter((f) => f !== pincode) }
          : zone
      )
    );
  };

  return (
    <div style={{ display: "flex", width: "100%" }}>
      <div style={{ width: "75%" }}>
        <MapContainer
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
      </div>

      <div style={{ width: "25%", padding: "10px" }}>
        <button onClick={addZone} style={buttonStyles.add}>
          Add Zone
        </button>
        <div style={headerStyles}>
          <h2>Zones</h2>
        </div>
        {zones.length === 0 ? (
          <p>No zones available. Please add a zone.</p>
        ) : (
          zones.map((zone, index) => (
            <div key={index} style={zoneStyles}>
              {/* <div style={{ textAlign: "center" }}>
                <h3>{zone.name}</h3>
              </div> */}

              <table style={tableStyles}>
                <thead>
                  <tr style={{ background: "purple", color: "white" }}>
                    <th style={cellStyles}>{zone.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {zone.features.length === 0 ? (
                    <tr>
                      <td style={cellStyles}>No features added.</td>
                    </tr>
                  ) : (
                    zone.features.map((feature, idx) => (
                      <tr key={idx}>
                        <td style={cellStyles}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-around",
                              alignItems: "center",
                            }}
                          >
                            <span>{feature}</span>
                            <FaTrash
                              onClick={() =>
                                handleRemoveFeature(zone.name, feature)
                              }
                              style={{
                                cursor: "pointer",
                                color: "black",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAddFeature={handleAddFeatureToZone}
        zones={zones}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        selectedFeature={selectedFeature}
        setSelectedFeature={setSelectedFeature}
      />
    </div>
  );
};

// Styles for modal
const modalStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyles = {
  background: "white",
  padding: "0 20px 10px 20px",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  width: "400px",
};

const selectStyles = {
  marginBottom: "10px",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  width: "100%",
};

const buttonStyles = {
  add: {
    marginBottom: "10px",
    padding: "10px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: 10,
    marginTop: 5,
  },
  cancel: {
    padding: "10px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: 5,
  },
};

const headerStyles = {
  background: "black",
  color: "white",
  padding: "10px",
  borderRadius: "5px",
  textAlign: "center",
  marginTop: 5,
  marginBottom: 10,
};

const zoneStyles = {
  backgroundColor: "#f1f1f1",
  marginBottom: "10px",
  padding: "10px",
  borderRadius: "5px",
  border: "0.5px solid lightgray",
};

const tableStyles = {
  width: "100%",
  // borderCollapse: "collapse",
  // marginTop: "15px",
};

const cellStyles = {
  padding: "10px",
  border: "1px solid #ddd",
};

export default BangaloreMap;
