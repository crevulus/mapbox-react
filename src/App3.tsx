import React, { useState, useEffect } from "react";

import ReactMapGL, { Marker, Popup } from "react-map-gl";

import * as data from "./skateboard-parks.json";

type ViewportType = {
  latitude: number;
  longitude: number;
  width: string;
  height: string;
  zoom: number;
};

export default function App() {
  const [viewport, setViewport] = useState({
    latitude: 45.4211,
    longitude: -75.6903,
    width: "100vw",
    height: "100vh",
    zoom: 10,
  });
  const [selectedPark, setSelectedPark] = useState<any>(null);

  const handleSelectPark = (e: any, park: any) => {
    e.preventDefault();
    setSelectedPark(park);
  };

  const handleClosePopup = () => {
    setSelectedPark(null);
  };

  useEffect(() => {
    const listener = (e: any) => {
      if (e.key === "Escape") {
        setSelectedPark(null);
      }
    };
    window.addEventListener("keydown", listener);
  }, []);

  return (
    <div>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_ACCESS_TOKEN}
        onViewportChange={(viewport: React.SetStateAction<ViewportType>) =>
          setViewport(viewport)
        }
        maxZoom={12}
      >
        {data.features.map((park) => (
          <Marker
            key={park.properties.PARK_ID}
            longitude={park.geometry.coordinates[0]}
            latitude={park.geometry.coordinates[1]}
          >
            <button onClick={(e) => handleSelectPark(e, park)}>
              {park.properties.PARK_ID}
            </button>
          </Marker>
        ))}
        {data.features.map((park) => (
          <Popup
            longitude={park?.geometry.coordinates[0]}
            latitude={park?.geometry.coordinates[1]}
            onClose={handleClosePopup}
          >
            <h2>{park.properties.NAME}</h2>
            <p>{park.properties.DESCRIPTIO}</p>
          </Popup>
        ))}
      </ReactMapGL>
    </div>
  );
}
