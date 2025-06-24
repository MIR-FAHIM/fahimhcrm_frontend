import React, { useState, useEffect } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { google_map_key } from "../../../../api/config/index";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAllWarehouse } from "../../../../api/controller/admin_controller/prospect_controller";

const MapWithMarkers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const lat = parseFloat(searchParams.get("lat")) || 23.8103; // Default to Dhaka, BD
  const lng = parseFloat(searchParams.get("lng")) || 90.4125;

  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const defaultPosition = { lat, lng };

  useEffect(() => {
    fetchAllWarehouse()
      .then((response) => {
        if (response.status === "success") {
          setProspects(response.data);
        } else {
          setError("Failed to fetch prospects");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data");
        setLoading(false);
      });
  }, []);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleCloseInfoWindow = () => { 
    setSelectedMarker(null);
  };

  const handleAddWarehouse = () => {
    // Navigate to Add Warehouse page or open modal
    navigate("/add-warehouse"); // Change this route to your actual add warehouse path
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const prospectMarkers = prospects.map((prospect) => ({
    position: {
      lat: parseFloat(prospect.latitude),
      lng: parseFloat(prospect.longitude),
    },
    info: prospect.prospect_name,
  }));

  const allMarkers = [
    { position: defaultPosition, info: "Default Location" },
    ...prospectMarkers,
  ];

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Add Warehouse Button */}
      <button
        onClick={handleAddWarehouse}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        + Add Warehouse
      </button>

      <APIProvider apiKey={google_map_key}>
        <div style={{ width: "100%", height: "100%" }}>
          <Map gestureHandling="greedy" style={{ width: "100%", height: "100%" }}>
            {allMarkers.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position}
                onClick={() => handleMarkerClick(marker)}
              />
            ))}

            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={handleCloseInfoWindow}
              >
                <div>
                  <h3>{selectedMarker.info}</h3>
                  <p>Lat: {selectedMarker.position.lat}</p>
                  <p>Lng: {selectedMarker.position.lng}</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </APIProvider>
    </div>
  );
};

export default MapWithMarkers;
