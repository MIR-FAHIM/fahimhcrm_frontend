import React, { useState, useEffect } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { google_map_key } from "../../../api/config/index";
import { useLocation, useNavigate } from "react-router-dom";
import { getVisitByDateEmp } from "../../../api/controller/admin_controller/visit_controller";
import { TextField, MenuItem, Box, CircularProgress } from "@mui/material";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";

const VisitMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const lat = parseFloat(searchParams.get("lat")) || 23.8103;
  const lng = parseFloat(searchParams.get("lng")) || 90.4125;

  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const defaultPosition = { lat, lng };

  // Fetch employees from API
  useEffect(() => {
    const fetchEmpList = async () => {
      try {
        const response = await fetchEmployees();
        if (response.status === "success") {
          setEmployees([{ id: "", name: "All Employees" }, ...response.data.map(emp => ({ id: emp.id, name: emp.name }))]);
        } else {
          setError("Failed to fetch employees");
        }
      } catch {
        setError("Error fetching employees");
      }
    };
    fetchEmpList();
  }, []);

  // Fetch visits based on selected employee and date
  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      try {
        const response = await getVisitByDateEmp(selectedDate, selectedEmp);
        if (response.status === "success") {
          setProspects(response.data);
          setError(null);
        } else {
          setError("Failed to fetch prospects");
        }
      } catch {
        setError("Error fetching data");
      }
      setLoading(false);
    };
    fetchVisits();
  }, [selectedDate, selectedEmp]);

  const handleMarkerClick = (marker) => setSelectedMarker(marker);
  const handleCloseInfoWindow = () => setSelectedMarker(null);
  const handleAddWarehouse = () => navigate("/visit-plan");

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}><CircularProgress /></Box>;
  if (error) return <div>Error: {error}</div>;

  const prospectMarkers = prospects
    .filter(
      (prospect) =>
        prospect.checkin_latitude &&
        prospect.checkin_longitude &&
        !isNaN(parseFloat(prospect.checkin_latitude)) &&
        !isNaN(parseFloat(prospect.checkin_longitude))
    )
    .map((prospect) => ({
      position: {
        lat: parseFloat(prospect.checkin_latitude),
        lng: parseFloat(prospect.checkin_longitude),
      },
      info: prospect.prospect_name,
      createdAt: prospect.created_at,
    }));

  const allMarkers = [
    { position: defaultPosition, info: "Default Location" },
    ...prospectMarkers,
  ];

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Filters */}
      <Box sx={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 1000,
        display: "flex",
        gap: 2,
        bgcolor: "rgba(255,255,255,0.95)",
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
        alignItems: "center"
      }}>
        <TextField
          select
          label="Employee"
          size="small"
          value={selectedEmp}
          onChange={e => setSelectedEmp(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {employees.map(emp => (
            <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          type="date"
          label="Date"
          size="small"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140 }}
        />
      </Box>

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
        + Add Visit Plan
      </button>

      <APIProvider apiKey={google_map_key}>
        <div style={{ width: "100%", height: "100%" }}> 
          <Map gestureHandling="greedy" style={{ width: "100%", height: "100%" }} >
            {prospectMarkers.length === 0 ? (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "rgba(255,255,255,0.95)",
                  p: 3,
                  borderRadius: 2,
                  boxShadow: 2,
                  zIndex: 2000,
                }}
              >
                <h3>No visit found</h3>
              </Box>
            ) : (
              allMarkers.map((marker, index) => (
                <Marker
                  key={index}
                  position={marker.position}
                  onClick={() => handleMarkerClick(marker)}
                />
              ))
            )}

            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={handleCloseInfoWindow}
              >
                <div>
                  <h3>{selectedMarker.info}</h3>
                  <p>Visited At: {selectedMarker.createdAt ? new Date(selectedMarker.createdAt).toLocaleString() : "N/A"}</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </APIProvider>
    </div>
  );
};

export default VisitMap;