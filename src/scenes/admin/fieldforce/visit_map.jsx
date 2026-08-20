import React, { useEffect, useMemo, useState } from "react";
import { APIProvider, InfoWindow, Map, Marker } from "@vis.gl/react-google-maps";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { google_map_key } from "../../../api/config/index";
import { getVisitByDateEmp } from "../../../api/controller/admin_controller/visit_controller";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import { fetchAllProspect } from "../../../api/controller/admin_controller/prospect_controller";

const fallbackCenter = { lat: 23.8103, lng: 90.4125 };

const labelOf = (value, fallback = "-") => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    return value.status_name || value.priority_name || value.zone_name || value.prospect_name || value.name || value.label || fallback;
  }
  return fallback;
};

const normalize = (value) => labelOf(value, "").toLowerCase().replace(/[_-]/g, " ").trim();

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getLeadFromVisit = (visit, leadLookup = {}) => {
  const leadId = visit?.lead_id || visit?.prospect_id || visit?.client_id;
  return visit?.lead || visit?.prospect || visit?.client || visit?.customer || leadLookup[String(leadId)] || null;
};

const getZoneFromVisit = (visit) => visit?.zone || visit?.lead?.zone || visit?.prospect?.zone || null;

const getVisitTarget = (visit, leadLookup = {}) => {
  const lead = getLeadFromVisit(visit, leadLookup);
  const zone = getZoneFromVisit(visit);
  return lead?.prospect_name || lead?.name || zone?.zone_name || zone?.name || "Visit target not set";
};

const getTaskStatus = (visit) =>
  labelOf(visit?.task_visit_relation?.task?.status || visit?.taskVisitRelation?.task?.status || visit?.task_visit_relation?.status || visit?.taskVisitRelation?.status);

const getStartCoords = (visit) => {
  const lat =
    parseNumber(visit?.start_latitude) ??
    parseNumber(visit?.start_lat) ??
    parseNumber(visit?.checkin_latitude) ??
    parseNumber(visit?.check_in_latitude) ??
    parseNumber(visit?.check_in_lat);
  const lng =
    parseNumber(visit?.start_longitude) ??
    parseNumber(visit?.start_lon) ??
    parseNumber(visit?.start_lng) ??
    parseNumber(visit?.checkin_longitude) ??
    parseNumber(visit?.check_in_longitude) ??
    parseNumber(visit?.check_in_lon) ??
    parseNumber(visit?.check_in_lng);
  return lat != null && lng != null ? { lat, lng } : null;
};

const getCompleteCoords = (visit) => {
  const lat =
    parseNumber(visit?.complete_latitude) ??
    parseNumber(visit?.complete_lat) ??
    parseNumber(visit?.checkout_latitude) ??
    parseNumber(visit?.check_out_latitude);
  const lng =
    parseNumber(visit?.complete_longitude) ??
    parseNumber(visit?.complete_lon) ??
    parseNumber(visit?.complete_lng) ??
    parseNumber(visit?.checkout_longitude) ??
    parseNumber(visit?.check_out_longitude);
  return lat != null && lng != null ? { lat, lng } : null;
};

const getFallbackCoords = (visit, leadLookup = {}) => {
  const lead = getLeadFromVisit(visit, leadLookup);
  const zone = getZoneFromVisit(visit);
  const lat =
    parseNumber(visit?.latitude) ??
    parseNumber(visit?.lat) ??
    parseNumber(lead?.latitude) ??
    parseNumber(lead?.lat) ??
    parseNumber(zone?.latitude) ??
    parseNumber(zone?.lat);
  const lng =
    parseNumber(visit?.longitude) ??
    parseNumber(visit?.lon) ??
    parseNumber(visit?.lng) ??
    parseNumber(lead?.longitude) ??
    parseNumber(lead?.lon) ??
    parseNumber(lead?.lng) ??
    parseNumber(lead?.long) ??
    parseNumber(zone?.longitude) ??
    parseNumber(zone?.lon) ??
    parseNumber(zone?.lng) ??
    parseNumber(zone?.long);
  return lat != null && lng != null ? { lat, lng } : null;
};

const getVisitCoords = (visit, leadLookup = {}) =>
  getStartCoords(visit) || getCompleteCoords(visit) || getFallbackCoords(visit, leadLookup);

const getVisitCoordsSource = (visit, leadLookup = {}) => {
  const lead = getLeadFromVisit(visit, leadLookup);
  if (getStartCoords(visit)) return "Start";
  if (getCompleteCoords(visit)) return "Complete";
  if (parseNumber(visit?.checkin_latitude) != null || parseNumber(visit?.check_in_latitude) != null) return "Check-in";
  if (parseNumber(visit?.latitude) != null || parseNumber(visit?.lat) != null) return "Visit";
  if (parseNumber(lead?.latitude) != null || parseNumber(lead?.lat) != null) return "Lead";
  return "Zone";
};

const buildVisitMapPoints = (visit, leadLookup = {}) => {
  const points = [];
  const start = getStartCoords(visit);
  const complete = getCompleteCoords(visit);

  if (start) {
    points.push({
      id: `${visit.id}-start`,
      visit,
      coords: start,
      source: "Start",
      color: "#1976d2",
      time: visit.actual_start_at || visit.started_at,
      location: visit.start_location || visit.checkin_location,
    });
  }

  if (complete) {
    points.push({
      id: `${visit.id}-complete`,
      visit,
      coords: complete,
      source: "Complete",
      color: "#2e7d32",
      time: visit.actual_end_at || visit.completed_at,
      location: visit.complete_location || visit.checkout_location,
    });
  }

  if (!points.length) {
    const fallback = getFallbackCoords(visit, leadLookup);
    if (fallback) {
      points.push({
        id: `${visit.id}-target`,
        visit,
        coords: fallback,
        source: getVisitCoordsSource(visit, leadLookup),
        color: markerColor(visit),
        time: visit.scheduled_at,
        location: getVisitTarget(visit, leadLookup),
      });
    }
  }

  return points;
};

const statusTone = (status) => {
  const value = normalize(status);
  if (["completed", "visited", "done", "complete"].some((item) => value.includes(item))) return "success";
  if (["started", "in progress", "running"].some((item) => value.includes(item))) return "info";
  if (["cancelled", "canceled", "failed"].some((item) => value.includes(item))) return "error";
  return "warning";
};

const markerColor = (visit) => {
  const tone = statusTone(visit?.status);
  if (tone === "success") return "#2e7d32";
  if (tone === "info") return "#1976d2";
  if (tone === "error") return "#d32f2f";
  return "#ed6c02";
};

const markerIcon = (color) => ({
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <path fill="${color}" d="M17 0C7.6 0 0 7.6 0 17c0 12.8 17 27 17 27s17-14.2 17-27C34 7.6 26.4 0 17 0z"/>
      <circle fill="#fff" cx="17" cy="17" r="7"/>
    </svg>
  `)}`,
});

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const VisitMap = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [leadLookup, setLeadLookup] = useState({});
  const [visits, setVisits] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [employeeResponse, prospectResponse] = await Promise.all([
          fetchEmployees(),
          fetchAllProspect(),
        ]);
        const list = Array.isArray(employeeResponse?.data) ? employeeResponse.data : [];
        const prospects = Array.isArray(prospectResponse?.data) ? prospectResponse.data : [];
        setEmployees(list);
        setLeadLookup(Object.fromEntries(prospects.map((prospect) => [String(prospect.id), prospect])));
      } catch {
        setError("Failed to fetch employees or lead locations.");
      }
    })();
  }, []);

  const loadVisits = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getVisitByDateEmp(selectedDate, selectedEmp);
      if (response?.status === "success") {
        setVisits(Array.isArray(response.data) ? response.data : []);
      } else {
        const message = response?.errors ? Object.values(response.errors).flat().join(" ") : response?.message;
        setError(message || "Failed to fetch visits.");
        setVisits([]);
      }
    } catch {
      setError("Failed to fetch visits.");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, [selectedDate, selectedEmp]);

  const statusOptions = useMemo(() => {
    const values = Array.from(new Set(visits.map((visit) => labelOf(visit.status, "")).filter(Boolean)));
    return ["all", ...values];
  }, [visits]);

  const typeOptions = useMemo(() => {
    const values = Array.from(new Set(visits.map((visit) => labelOf(visit.visit_type, "")).filter(Boolean)));
    return ["all", ...values];
  }, [visits]);

  const filteredVisits = useMemo(() => (
    visits.filter((visit) => {
      const statusMatch = statusFilter === "all" || normalize(visit.status) === normalize(statusFilter);
      const typeMatch = typeFilter === "all" || normalize(visit.visit_type) === normalize(typeFilter);
      return statusMatch && typeMatch;
    })
  ), [statusFilter, typeFilter, visits]);

  const markerVisits = useMemo(
    () => filteredVisits.flatMap((visit) => buildVisitMapPoints(visit, leadLookup)),
    [filteredVisits, leadLookup]
  );
  const center = markerVisits[0]?.coords || fallbackCenter;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 430px" }, minHeight: "calc(100vh - 24px)", bgcolor: theme.palette.background.default }}>
      <Box sx={{ minHeight: { xs: 460, lg: "calc(100vh - 24px)" }, position: "relative" }}>
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            right: { xs: 16, md: "auto" },
            zIndex: 10,
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.94),
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
            <TextField size="small" type="date" label="Date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField size="small" select label="Employee" value={selectedEmp} onChange={(event) => setSelectedEmp(event.target.value)} sx={{ minWidth: 170 }}>
              <MenuItem value="">All Employees</MenuItem>
              {employees.map((employee) => <MenuItem key={employee.id} value={employee.id}>{employee.name}</MenuItem>)}
            </TextField>
            <Button variant="contained" startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />} disabled={loading} onClick={loadVisits}>
              Refresh
            </Button>
          </Stack>
        </Paper>

        <APIProvider apiKey={google_map_key}>
          <Map
            defaultCenter={center}
            defaultZoom={markerVisits.length ? 12 : 10}
            gestureHandling="greedy"
            draggable
            zoomControl
            scrollwheel
            style={{ width: "100%", height: "100%" }}
          >
            {markerVisits.map((point) => (
              <Marker
                key={point.id}
                position={point.coords}
                icon={markerIcon(point.color)}
                onClick={() => {
                  setSelectedVisit(point.visit);
                  setSelectedPoint(point);
                }}
              />
            ))}
            {selectedVisit && (selectedPoint?.coords || getVisitCoords(selectedVisit, leadLookup)) && (
              <InfoWindow
                position={selectedPoint?.coords || getVisitCoords(selectedVisit, leadLookup)}
                onCloseClick={() => {
                  setSelectedVisit(null);
                  setSelectedPoint(null);
                }}
              >
                <Box sx={{ color: "#111", maxWidth: 260 }}>
                  <Typography variant="subtitle2" fontWeight={800}>{getVisitTarget(selectedVisit, leadLookup)}</Typography>
                  <Typography variant="body2">Employee: {selectedVisit.employee?.name || "-"}</Typography>
                  <Typography variant="body2">Scheduled: {formatDateTime(selectedVisit.scheduled_at)}</Typography>
                  <Typography variant="body2">Visit status: {labelOf(selectedVisit.status)}</Typography>
                  <Typography variant="body2">Task status: {getTaskStatus(selectedVisit)}</Typography>
                  <Typography variant="body2">Point source: {selectedPoint?.source || getVisitCoordsSource(selectedVisit, leadLookup)}</Typography>
                  <Typography variant="body2">Point time: {formatDateTime(selectedPoint?.time)}</Typography>
                  <Typography variant="body2">Location: {selectedPoint?.location || "-"}</Typography>
                  {selectedPoint?.coords && (
                    <Typography variant="body2">
                      Lat/Lon: {selectedPoint.coords.lat.toFixed(6)}, {selectedPoint.coords.lng.toFixed(6)}
                    </Typography>
                  )}
                </Box>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </Box>

      <Paper elevation={0} sx={{ borderLeft: { lg: `1px solid ${theme.palette.divider}` }, bgcolor: theme.palette.background.paper, overflow: "hidden" }}>
        <Stack spacing={2} sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={800}>Field Force Map</Typography>
              <Typography variant="body2" color="text.secondary">{filteredVisits.length} visits for selected filters</Typography>
            </Box>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/visit-plan")} sx={{ whiteSpace: "nowrap" }}>
              Add
            </Button>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {statusOptions.map((option) => <MenuItem key={option} value={option}>{option === "all" ? "All statuses" : option}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                {typeOptions.map((option) => <MenuItem key={option} value={option}>{option === "all" ? "All types" : option}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`Mapped points ${markerVisits.length}`} color="primary" variant="outlined" />
            <Chip size="small" label={`Start ${markerVisits.filter((item) => item.source === "Start").length}`} color="info" variant="outlined" />
            <Chip size="small" label={`Complete ${markerVisits.filter((item) => item.source === "Complete").length}`} color="success" variant="outlined" />
            <Chip size="small" label={`From lead ${markerVisits.filter((item) => item.source === "Lead").length}`} color="info" variant="outlined" />
            <Chip size="small" label={`Pending ${filteredVisits.filter((visit) => statusTone(visit.status) === "warning").length}`} color="warning" variant="outlined" />
            <Chip size="small" label={`Completed ${filteredVisits.filter((visit) => statusTone(visit.status) === "success").length}`} color="success" variant="outlined" />
          </Stack>
        </Stack>

        <TableContainer sx={{ maxHeight: "calc(100vh - 220px)" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Lead/Zone</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              )}
              {!loading && filteredVisits.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>No visits found.</TableCell></TableRow>
              )}
              {!loading && filteredVisits.map((visit) => {
                const coords = getVisitCoords(visit, leadLookup);
                const coordsSource = coords ? getVisitCoordsSource(visit, leadLookup) : "";
                const startCoords = getStartCoords(visit);
                const completeCoords = getCompleteCoords(visit);
                return (
                <TableRow
                  key={visit.id}
                  hover
                  selected={selectedVisit?.id === visit.id}
                  onClick={() => {
                    setSelectedVisit(visit);
                    setSelectedPoint(buildVisitMapPoints(visit, leadLookup)[0] || null);
                  }}
                  sx={{ cursor: coords ? "pointer" : "default" }}
                >
                  <TableCell>{visit.employee?.name || "-"}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{getVisitTarget(visit, leadLookup)}</Typography>
                    <Typography variant="caption" color="text.secondary">{visit.purpose || "-"}</Typography>
                    {startCoords && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Start: {startCoords.lat.toFixed(6)}, {startCoords.lng.toFixed(6)}
                      </Typography>
                    )}
                    {completeCoords && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Complete: {completeCoords.lat.toFixed(6)}, {completeCoords.lng.toFixed(6)}
                      </Typography>
                    )}
                    {!startCoords && !completeCoords && coords && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {coordsSource}: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">Plan: {formatDateTime(visit.scheduled_at)}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">Start: {formatDateTime(visit.actual_start_at || visit.started_at)}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">End: {formatDateTime(visit.actual_end_at || visit.completed_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={labelOf(visit.status)} color={statusTone(visit.status)} variant="outlined" />
                    <Typography variant="caption" color="text.secondary" display="block">Task: {getTaskStatus(visit)}</Typography>
                  </TableCell>
                  <TableCell>{visit.priority?.priority_name || "-"}</TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default VisitMap;
