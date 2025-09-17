// VisitMap.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
  MarkerClusterer,
} from "@react-google-maps/api";

// Config + API
import { google_map_key } from "../../../api/config/index";
import { getAllVisit } from "../../../api/controller/admin_controller/visit_controller";

const mapContainerStyle = { width: "100%", height: 520, borderRadius: 12 };
const defaultCenter = { lat: 23.777176, lng: 90.399452 }; // Dhaka fallback

const statusChipColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "scheduled":
      return "default";
    case "started":
    case "in progress":
      return "info";
    case "completed":
      return "success";
    case "cancelled":
    case "canceled":
      return "error";
    default:
      return "default";
  }
};

const typeChipColor = (type) => {
  switch ((type || "").toLowerCase()) {
    case "planned":
      return "primary";
    case "ad-hoc":
    case "adhoc":
      return "secondary";
    default:
      return "default";
  }
};

/** Safely parse number */
const n = (v) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
};

/** Convert visit -> marker-ready object.
 *  Priority: checkin_lat/long -> lead.lat/long; skip if none.
 */
const toMarker = (v) => {
  const cLat = n(v?.checkin_latitude);
  const cLng = n(v?.checkin_longitude);
  const lLat = n(v?.lead?.latitude);
  const lLng = n(v?.lead?.longitude);

  const lat = cLat ?? lLat;
  const lng = cLng ?? lLng;
  if (lat == null || lng == null) return null;

  return {
    id: v.id,
    position: { lat, lng },
    title:
      v?.lead?.prospect_name ||
      v?.zone?.zone_name ||
      `Visit #${v.id}`,
    zone: v?.zone?.zone_name || null,
    when: v?.scheduled_at,
    status: v?.status,
    type: v?.visit_type,
    planner: v?.planner?.name || null,
    employee: v?.employee?.name || null,
    purpose: v?.purpose || "",
    note: v?.note || "",
    usedCheckin: cLat != null && cLng != null,
  };
};

export default function VisitMap() {
  const theme = useTheme();

  const [markers, setMarkers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "error" });
  const [activeId, setActiveId] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: google_map_key || "",
    libraries: ["places"],
  });

  // Fetch visits and build markers
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllVisit();
        const list = Array.isArray(res?.data) ? res.data : [];
        const ms = list.map(toMarker).filter(Boolean);
        setMarkers(ms);
      } catch (e) {
        console.error(e);
        setSnack({ open: true, msg: "Failed to load visits.", sev: "error" });
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  // Map ref + fit bounds
  const mapRef = useRef(null);
  const onMapLoad = (map) => {
    mapRef.current = map;
    // Fit bounds on first load if we already have markers
    if (markers.length > 0 && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend(m.position));
      map.fitBounds(bounds, 64);
    } else {
      map.setCenter(defaultCenter);
      map.setZoom(11);
    }
  };

  // Refit when markers change
  useEffect(() => {
    if (!mapRef.current || !isLoaded || markers.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach((m) => bounds.extend(m.position));
    mapRef.current.fitBounds(bounds, 64);
  }, [markers, isLoaded]);

  const activeMarker = useMemo(
    () => markers.find((m) => m.id === activeId) || null,
    [markers, activeId]
  );

  // Simple color per status
  const markerColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "#2e7d32";
      case "started":
      case "in progress":
        return "#0288d1";
      case "scheduled":
        return "#6d6d6d";
      default:
        return theme.palette.primary.main;
    }
  };

  if (loadError) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography color="error">Failed to load Google Maps.</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={800}>
            Visit Map
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {markers.length} {markers.length === 1 ? "location" : "locations"}.
          </Typography>
        </Box>

        {!isLoaded || loadingData ? (
          <Box
            sx={{
              height: mapContainerStyle.height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            onLoad={onMapLoad}
            center={defaultCenter} // overridden by fitBounds
            zoom={10}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              clickableIcons: false,
            }}
          >
            <MarkerClusterer>
              {(clusterer) =>
                markers.map((m) => (
                  <Marker
                    key={m.id}
                    clusterer={clusterer}
                    position={m.position}
                    onClick={() => setActiveId(m.id)}
                    icon={{
                      path: "M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z",
                      fillColor: markerColor(m.status),
                      fillOpacity: 1,
                      strokeWeight: 1,
                      strokeColor: "white",
                      scale: 1.3,
                      anchor: new window.google.maps.Point(12, 24),
                    }}
                    title={m.title}
                  />
                ))
              }
            </MarkerClusterer>

            {activeMarker && (
              <InfoWindow
                position={activeMarker.position}
                onCloseClick={() => setActiveId(null)}
              >
                <Box sx={{ maxWidth: 300 }}>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    {activeMarker.title}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                      size="small"
                      label={activeMarker.status || "—"}
                      color={statusChipColor(activeMarker.status)}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={activeMarker.type || "—"}
                      color={typeChipColor(activeMarker.type)}
                      variant="outlined"
                    />
                    {activeMarker.usedCheckin && (
                      <Chip size="small" label="Check-in" variant="outlined" />
                    )}
                  </Stack>

                  {activeMarker.zone && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <RoomIcon
                        sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }}
                      />
                      Zone: {activeMarker.zone}
                    </Typography>
                  )}

                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <EventIcon
                      sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }}
                    />
                    {activeMarker.when
                      ? new Date(activeMarker.when).toLocaleString()
                      : "—"}
                  </Typography>

                  {activeMarker.employee && (
                    <Typography variant="body2" sx={{ mb: 0.25 }}>
                      <PersonIcon
                        sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }}
                      />
                      Employee: {activeMarker.employee}
                    </Typography>
                  )}
                  {activeMarker.planner && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <PersonIcon
                        sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }}
                      />
                      Planner: {activeMarker.planner}
                    </Typography>
                  )}

                  {activeMarker.purpose && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>Purpose:</strong> {activeMarker.purpose}
                    </Typography>
                  )}
                  {activeMarker.note && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Note:</strong> {activeMarker.note}
                    </Typography>
                  )}
                </Box>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={2600}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
