import React from "react";
import { FaTrash, FaTimes } from "react-icons/fa";
import {
  cellStyles,
  zoneStyles,
  tableStyles,
  noZonesContainerStyles,
} from "../styles";

const ZoneList = ({
  zones,
  handleRemoveZone,
  handleRemoveFeature,
  maxWidth,
}) => {
  return (
    <>
      {zones.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <p style={noZonesContainerStyles}>
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
                    <td style={{ padding: "10px", color: "gray" }}>
                      no pincodes added.
                    </td>
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
    </>
  );
};

export default ZoneList;
