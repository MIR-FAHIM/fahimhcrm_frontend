import React from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { google_map_key } from "../../../api/config/index";
import { useLocation } from "react-router-dom";

const MapComponent = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const lat = parseFloat(searchParams.get("lat")) || 23.8103; // Default to Dhaka, BD
  const lng = parseFloat(searchParams.get("lng")) || 90.4125;

  const position = { lat, lng };

  return (
    <APIProvider apiKey={google_map_key}>
      <div style={{ width: "100%", height: "500px" }}> {/* Ensure container size */}
        <Map 
          center={position} 
          zoom={15} // Increase zoom level
         // mapId="YOUR_MAP_ID" // Optional if using a customized map style
          style={{ width: "100%", height: "100%" }} // Ensure proper rendering
        >
          <Marker position={position} />
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapComponent;
