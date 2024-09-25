import React, { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import bangalore from "../data/bangalore.json";
import { FaTrash, FaTimes } from "react-icons/fa";

const colors = [
  "#FF6F61", // Medium Coral
  "#FF8C00", // Dark Orange
  "#FFD700", // Gold
  "#CD5C5C", // Indian Red
  "#D2691E", // Medium Chocolate
  "#FF4500", // Orange Red
  "#ADFF2F", // Green Yellow
  "#3CB371", // Medium Sea Green
  "#8B4513", // Saddle Brown
  "#BA55D3", // Medium Orchid
  "#8B0000", // Dark Red
  "#DC143C", // Crimson
  "#FF1493", // Deep Pink
  "#DDA0DD", // Plum
  "#32CD32", // Lime Green
  "#FFB6C1", // Light Pink
  "#FF7F50", // Coral
  "#FF6347", // Tomato
  "#B8860B", // Dark Goldenrod
  "#F08080", // Light Coral
  "#FFDAB9", // Peach Puff
  "#FF69B4", // Hot Pink
  "#C71585", // Medium Violet Red
  "#FFDEAD", // Navajo White
  // "#C0C0C0", // Silver
];

const usedColors = new Set();

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
          Add Pincode
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

  // New state to trigger map refresh
  const [mapKey, setMapKey] = useState(0);

  const [maxWidth, setMaxWidth] = useState("150px");

  useEffect(() => {
    const updateMaxWidth = () => {
      // Check if the window width is less than a certain threshold (e.g., 1200px)
      if (window.innerWidth < 1200) {
        setMaxWidth("150px"); // Set to 150px when not full screen
      } else {
        setMaxWidth("300px"); // Set to a different value when full screen
      }
    };

    // Initial check
    updateMaxWidth();

    // Add event listener for resize
    window.addEventListener("resize", updateMaxWidth);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", updateMaxWidth);
  }, []);

  const onEachFeature = useCallback(
    (feature, layer) => {
      if (feature.properties) {
        const pincode = feature.properties.PINCODE;

        // Find the zone associated with this pincode
        const assignedZone = zones.find((zone) =>
          zone.features.includes(pincode)
        );
        const zoneColor = assignedZone ? assignedZone.color : "black"; // Use the zone color or black if not assigned

        layer.setStyle({
          color: zoneColor,
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
            layer.setStyle({ color: zoneColor, weight: 2 }); // Use the zone color on mouseout
            layer.closeTooltip();
          },
          click: () => {
            if (!assignedZone) {
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
      // Find an unused color
      let assignedColor;

      // Filter colors to find an unused one
      const availableColors = colors.filter((color) => !usedColors.has(color));

      if (availableColors.length > 0) {
        assignedColor =
          availableColors[Math.floor(Math.random() * availableColors.length)];
        usedColors.add(assignedColor); // Mark the color as used
      } else {
        console.log("No available colors left.");
        return; // Exit if no colors are available
      }

      setZones((prevZones) => [
        ...prevZones,
        { name: zoneName, features: [], color: assignedColor },
      ]);
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

      // Trigger map refresh by updating mapKey
      setMapKey((prevKey) => prevKey + 1);

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
    setMapKey((prevKey) => prevKey + 1); // Refresh the map after removal
  };

  const handleRemoveZone = (zoneName) => {
    const zoneToRemove = zones.find((zone) => zone.name === zoneName);

    if (zoneToRemove) {
      usedColors.delete(zoneToRemove.color); // Free up the color
      setZones((prevZones) =>
        prevZones.filter((zone) => zone.name !== zoneName)
      );
      setMapKey((prevKey) => prevKey + 1); // Refresh the map after removal
    }
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "75%" }}>
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
      </div>

      <div
        style={{
          width: "25%",
          padding: "10px",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        <div
          style={{ flex: 1, backgroundColor: "gray", height: 1, marginTop: 5 }}
        ></div>
        <button onClick={addZone} style={buttonStyles.addZone}>
          + Add Zone
        </button>

        <div
          style={{
            flex: 1,
            backgroundColor: "gray",
            height: 1,
            marginTop: 5,
          }}
        ></div>
        <div
          style={
            (headerStyles,
            { textAlign: "center", backgroundColor: "black", marginTop: 30 })
          }
        >
          <h2 style={{ color: "white", padding: 15 }}>Zones</h2>
        </div>
        {zones.length === 0 ? (
          <div style={noZonesContainerStyles}>
            <p style={{ color: "gray" }}>
              No zones available. Please add a zone.
            </p>
          </div>
        ) : (
          zones.map((zone, index) => (
            <div key={index} style={zoneStyles}>
              <table style={tableStyles}>
                <thead>
                  <tr style={{ background: zone.color, color: "white" }}>
                    <th style={cellStyles}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            maxWidth: maxWidth,
                          }}
                        >
                          {zone.name}
                        </span>
                        <FaTimes
                          onClick={() => handleRemoveZone(zone.name)}
                          style={{
                            cursor: "pointer",
                            color: "black",
                          }}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {zone.features.length === 0 ? (
                    <tr>
                      <td style={cellStyles}>no pincodes added.</td>
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
                                color: "darkgray",
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
    </div>
  );
};

const modalStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modalContentStyles = {
  backgroundColor: "#fff",
  padding: "0px 15px 5px 15px",
  borderRadius: "8px",
  width: "300px",
  textAlign: "center",
};

const selectStyles = {
  marginBottom: "10px",
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const buttonStyles = {
  add: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    margin: "10px 0",
    marginRight: 15,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancel: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "10px 20px",
    margin: "10px 0",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  addZone: {
    width: "100%",
    backgroundColor: "blue",
    color: "white",
    padding: 12,
    marginTop: 5,
    borderRadius: 5,
  },
};

const noZonesContainerStyles = {
  padding: "10px",
  border: "1px dashed gray",
  borderRadius: "5px",
  textAlign: "center",
};

const zoneStyles = {
  marginTop: "10px",
  backgroundColor: "lightgray",
  padding: "10px",
  borderRadius: "8px",
};

const headerStyles = {
  backgroundColor: "black",
  color: "white",
  padding: "10px",
};

const tableStyles = {
  width: "100%",
  // borderCollapse: "collapse",
};

const cellStyles = {
  padding: "10px",
  // border: "1px solid darkgray",
};

export default BangaloreMap;
