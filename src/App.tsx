import React, { useState, useRef } from "react";

import ReactMapGL, { Marker } from "react-map-gl";
import useSupercluster from "./useSupercluster";
import useSwr from "swr";

const fetcher = (...args: any[]) =>
  //@ts-ignore
  fetch(...args).then((response) => response.json());

type ViewportType = {
  latitude: number;
  longitude: number;
  width: string;
  height: string;
  zoom: number;
};

export default function App() {
  const [viewport, setViewport] = useState({
    latitude: 52.6376,
    longitude: -1.135171,
    width: "100vw",
    height: "100vh",
    zoom: 12,
  });
  const mapRef = useRef<any | null>(null);

  const url =
    "https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&date=2019-10";
  const { data, error } = useSwr(url, { fetcher });
  const crimes = data && !error ? data.slice(0, 2000) : [];
  const points = crimes.map((crime: any) => ({
    type: "Feature",
    properties: { cluster: false, crimeId: crime.id, category: crime.category },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(crime.location.longitude),
        parseFloat(crime.location.latitude),
      ],
    },
  }));

  const bounds = mapRef.current
    ? mapRef.current.getMap().getBounds().toArray().flat()
    : null;

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 20 },
  });

  console.log(clusters);

  return (
    <div>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_ACCESS_TOKEN}
        onViewportChange={(viewport: React.SetStateAction<ViewportType>) =>
          setViewport(viewport)
        }
        maxZoom={15}
        ref={mapRef}
      >
        {clusters &&
          clusters?.map((cluster: any) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count: pointCount } =
              cluster.properties;
            if (isCluster) {
              return (
                <Marker
                  key={cluster.id}
                  latitude={parseFloat(latitude)}
                  longitude={parseFloat(longitude)}
                >
                  Cluster: {pointCount}
                </Marker>
              );
            }
            return (
              <Marker
                key={cluster.properties.crimeId}
                latitude={parseFloat(latitude)}
                longitude={parseFloat(longitude)}
              >
                Naughty boi
              </Marker>
            );
          })}
      </ReactMapGL>
    </div>
  );
}
