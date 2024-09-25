import React from "react";
import {
  modalStyles,
  modalContentStyles,
  selectStyles,
  buttonStyles,
} from "../styles"; // Adjust the import path accordingly

const Modal = ({
  show,
  onClose,
  onAddFeature,
  zones,
  selectedZone,
  setSelectedZone,
  selectedFeature,
  setSelectedFeature,
  bangalore,
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

export default Modal;
