import React, { useState, useRef } from "react";

import ReactMapGL, {
  Marker,
  FlyToInterpolator,
  Source,
  Layer,
  LayerProps,
} from "react-map-gl";
import { FeatureCollection, Geometry } from "geojson";
import useSupercluster from "./useSupercluster";
import useSwr from "swr";

const fetcher = (...args: any[]) =>
  //@ts-ignore
  fetch(...args).then((response) => response.json());

const route: FeatureCollection<Geometry> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [-1, 52.6376],
          [0, 52.6376],
        ],
      },
      properties: {},
    },
  ],
};

const layerStyle: LayerProps = {
  id: "route",
  source: "route",
  type: "line",
  paint: {
    "line-width": 2,
    "line-color": "#007cbf",
  },
};

type ViewportType = {
  longitude: number;
  latitude: number;
  width: string;
  height: string;
  zoom: number;
  transitionInterpolator?: any;
  transitionDuration?: any;
};

export default function App() {
  const [viewport, setViewport] = useState<ViewportType>({
    longitude: -1.135171,
    latitude: 52.6376,
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

  const handleClusterClick = (cluster: any) => {
    const [longitude, latitude] = cluster.geometry.coordinates;
    const expansionZoom = Math.min(
      supercluster!.getClusterExpansionZoom(cluster.id),
      20
    ); // set to maxZoom of viewport
    setViewport({
      ...viewport,
      latitude,
      longitude,
      zoom: expansionZoom,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: "auto",
    });
  };

  return (
    <div>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_ACCESS_TOKEN}
        onViewportChange={(viewport: React.SetStateAction<ViewportType>) =>
          setViewport(viewport)
        }
        maxZoom={20}
        ref={mapRef}
      >
        <Source id="map-line" type="geojson" data={route}>
          <Layer {...layerStyle} />
        </Source>
        {clusters &&
          clusters?.map((cluster: any) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count: pointCount } =
              cluster.properties;
            if (isCluster) {
              return (
                <Marker
                  key={cluster.id}
                  longitude={parseFloat(longitude)}
                  latitude={parseFloat(latitude)}
                >
                  <button
                    style={{
                      fontSize: `${20 + (pointCount / points.length) * 50}px`,
                    }}
                    onClick={() => handleClusterClick(cluster)}
                  >
                    Cluster: {pointCount}
                  </button>
                </Marker>
              );
            }
            return (
              <Marker
                key={cluster.properties.crimeId}
                longitude={parseFloat(longitude)}
                latitude={parseFloat(latitude)}
              >
                Naughty boi
              </Marker>
            );
          })}
      </ReactMapGL>
    </div>
  );
}
