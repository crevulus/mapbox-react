import { useState, useEffect } from "react";

import { AirportType } from "./App2";

export const useRouteOrigin = (airport: AirportType) => {
  const [lat, setLat] = useState<string | null>(null);
  const [long, setLong] = useState<string | null>(null);

  const route = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [long, lat],
            [lat, long],
          ],
        },
        properties: {},
      },
    ],
  };

  useEffect(() => {
    setLat(airport.latitude);
    setLong(airport.longitude);
  }, [airport]);

  return route;
};
