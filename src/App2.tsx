import React, { useRef, useEffect, useState, RefObject } from "react";

import mapboxgl, { Map } from "mapbox-gl";

import "./App.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic3dhbWVkaWFtb25rcyIsImEiOiJja3BvYm5sanQxdWZ6MnhvZ2w5ZWtoNmZhIn0.G9pGUxffpmmDegRHgPSR-g";

export type AirportType = {
  airport_name: string;
  alt_search_name: string[];
  booking_widget_display_name: string;
  city_served: string;
  federal_unit: string;
  iata_code: string;
  latitude: string;
  longitude: string;
  operate_date: string;
  popular_station: boolean;
  route_map_display_name: string;
  routes_connected: string[];
  routes_served: string[];
  station_message: string;
  seasonal_service: boolean;
  suspended: boolean;
};

function App() {
  const mapContainer = useRef<HTMLElement>(null);
  const map = useRef<Map | undefined | null>(null);
  const [lng, setLng] = useState(-80);
  const [lat, setLat] = useState(34);
  const [zoom, setZoom] = useState(4);
  const [airports, setAirports] = useState<AirportType[]>([]);

  function toFixedNumber(num: number, digits: number): number {
    const pow = Math.pow(10, digits);
    return Math.round(num * pow) / pow;
  }

  async function fetchAirports() {
    const airports = await fetch(
      "https://www.southwest.com/swa-resources/generated/route_map/map_view.json"
    )
      .then((res) => res.json())
      .catch((err) => console.log(err));
    setAirports(airports);
  }

  useEffect(() => {
    if (!mapboxgl.supported()) {
      alert("This is an alert");
    }
  }, []);

  useEffect(() => {
    fetchAirports();
  }, []);

  useEffect(() => {
    const constructedArray = Object.entries(airports).map((pair) => pair[1]);
    if (constructedArray.length > 0) {
      constructedArray.map((airport) => {
        return new mapboxgl.Marker({ color: "red", rotation: 45, scale: 0.5 })
          .setLngLat([
            parseFloat(airport.longitude),
            parseFloat(airport.latitude),
          ])
          .addTo(map.current!);
      });
    }
  }, [airports]);

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container:
        mapContainer.current === undefined || mapContainer.current === null
          ? ""
          : mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(toFixedNumber(map.current!.getCenter().lng, 4));
      setLat(toFixedNumber(map.current!.getCenter().lat, 4));
      setZoom(toFixedNumber(map.current!.getZoom(), 2));
    });
    map.current.on("load", () => {
      if (!map.current?.getSource("route")) {
        map.current!.addSource("route", {
          type: "geojson",
          //@ts-ignore
          data: route,
        });
        if (!map.current?.getLayer("route")) {
          map.current!.addLayer({
            id: "route",
            source: "route",
            type: "line",
            paint: {
              "line-width": 2,
              "line-color": "#007cbf",
            },
          });
        }
      }
    });
  });

  return (
    <div className="App">
      <header className="App-header">
        <aside className="sidebar">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </aside>
        <div
          ref={mapContainer as RefObject<HTMLDivElement>}
          className="map-container"
        />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
