import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { google_map_key } from "../../../../api/config/index";
import { useNavigate, useParams } from "react-router-dom";
import { updateProspect } from "../../../../api/controller/admin_controller/prospect_controller";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container
} from '@mui/material';

// Define the container style for the map
const containerStyle = {
  width: '100%',
  height: '500px'
};

const MapComponentSetLocation = ({onMapClick}) => {
  const navigate = useNavigate();
  const { id, latitude, longitude } = useParams();

  // Default to Dhaka, BD if latitude or longitude is not provided
  const defaultLat = latitude ? parseFloat(latitude) : 23.8103;
  const defaultLng = longitude ? parseFloat(longitude) : 90.4125;

  const [markerPosition, setMarkerPosition] = useState({
    lat: defaultLat,
    lng: defaultLng,
  });

  // State to force re-rendering the map
  const [mapKey, setMapKey] = useState(Date.now());
  const handleReloadMap = () => setMapKey(Date.now());

  useEffect(() => {
    console.log("Current Marker Position:", markerPosition);
  }, [markerPosition]);

  const handleMapClick = (event) => {
    
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    console.log("New Marker Position from click:", { lat: newLat, lng: newLng });
    setMarkerPosition({
      lat: newLat,
      lng: newLng,
    });
    onMapClick(event);
  };

  const handleUpdatePosition = async () => {
    const data = {
      prospect_id: id,
      latitude: markerPosition.lat,
      longitude: markerPosition.lng,
    };
    const updateRes = await updateProspect(data);
    if (updateRes.status === "success") {
      navigate(`/prospect-detail/${id}`);
    }
  };

  // Generate a unique key for the Marker component based on its position
  const markerKey = `${markerPosition.lat}-${markerPosition.lng}`;

  return (
    <Container maxWidth="md">
      {/* Reload Button */}
      <Button variant="outlined" onClick={handleReloadMap} sx={{ mb: 1 }}>
        Reload Map
      </Button>

      <Box sx={{ width: "100%", height: "500px", mb: 2 }}>
        <LoadScript googleMapsApiKey={google_map_key} key={mapKey}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={markerPosition}
            zoom={15}
            onClick={handleMapClick}
          >
            <Marker position={markerPosition} key={markerKey} />
          </GoogleMap>
        </LoadScript>
      </Box>

      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body1">
              <strong>Latitude:</strong> {markerPosition.lat.toFixed(6)}
            </Typography>
            <Typography variant="body1">
              <strong>Longitude:</strong> {markerPosition.lng.toFixed(6)}
            </Typography>
          </Box>

          
{id && (
  <Button
    variant="contained"
    color="primary"
    onClick={handleUpdatePosition}
    sx={{ fontWeight: 'bold' }}
  >
    Update Position
  </Button>
)}
        </CardContent>
      </Card>
    </Container>
  );
};

export default MapComponentSetLocation;
