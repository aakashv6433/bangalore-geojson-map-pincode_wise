import React, { useState, useCallback, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import bangalore from "../data/bangalore.json";
import { colors } from "../constants";
import Modal from "./Modal";
import { buttonStyles, headerStyles } from "../styles";
import Map from "./Map";
import ZoneList from "./ZoneList";

const usedColors = new Set();

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
          fillOpacity: 0.6,
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
      <div style={{ width: "80%" }}>
        <Map mapKey={mapKey} zones={zones} onEachFeature={onEachFeature} />
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

        <ZoneList
          zones={zones}
          handleRemoveZone={handleRemoveZone}
          handleRemoveFeature={handleRemoveFeature}
          maxWidth={maxWidth}
        />

        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          onAddFeature={handleAddFeatureToZone}
          zones={zones}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          bangalore={bangalore}
        />
      </div>
    </div>
  );
};

export default BangaloreMap;
