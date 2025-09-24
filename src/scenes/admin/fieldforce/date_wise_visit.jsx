// DateWiseVisit.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Divider,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EventIcon from "@mui/icons-material/Event";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NotesIcon from "@mui/icons-material/Notes";
import RoomIcon from "@mui/icons-material/Room";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TodayIcon from "@mui/icons-material/Today";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import MapIcon from "@mui/icons-material/Map";
import { useNavigate } from "react-router-dom";

// Controller
import { getDateWiseVisit } from "../../../api/controller/admin_controller/visit_controller";

const fmtDateTime = (val) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString();
  } catch {
    return val;
  }
};

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

const getCoords = (v) => {
  // Prefer check-in coordinates if present; else fallback to lead coords if your API returns them
  const latS = v?.checkin_latitude ?? v?.lead?.latitude;
  const lngS = v?.checkin_longitude ?? v?.lead?.longitude;
  const lat = Number(latS);
  const lng = Number(lngS);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
};

export default function DateWiseVisit() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "error" });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getDateWiseVisit();
        const list = Array.isArray(res?.data) ? res.data : [];
        setGroups(list);
      } catch (e) {
        console.error(e);
        setSnack({ open: true, msg: "Failed to load visits.", sev: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalVisits = useMemo(
    () => groups.reduce((sum, g) => sum + (Array.isArray(g.visits) ? g.visits.length : 0), 0),
    [groups]
  );

  const handleOpenMap = (lat, lng) => {
    if (lat && lng) navigate(`/google-map?lat=${lat}&lng=${lng}`);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Date-wise Visits
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Expand a date to reveal its scheduled visits.
            </Typography>
          </Box>
          <Chip
            icon={<TodayIcon />}
            label={`${totalVisits} ${totalVisits === 1 ? "visit" : "visits"}`}
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : groups.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
            No visits found.
          </Box>
        ) : (
          groups.map((g) => (
            <Accordion key={g.date} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <ScheduleIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography fontWeight={700} sx={{ mr: 1 }}>
                    {g.date}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${g.visits.length} ${g.visits.length === 1 ? "visit" : "visits"}`}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderColor: alpha(theme.palette.primary.main, 0.25),
                    }}
                    variant="outlined"
                  />
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={2}>
                  {g.visits.map((v) => {
                    const coords = getCoords(v);
                    const hasCoords = Boolean(coords);
                    const brand = theme.palette.primary.main;
                    const divider = theme.palette.divider;
                    const textSec = theme.palette.text.secondary;

                    return (
                      <Box
                        key={v.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${divider}`,
                          bgcolor: alpha(theme.palette.background.paper, 1),
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.25,
                        }}
                      >
                        {/* Top Row: Chips + Time */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              size="small"
                              label={v.status || "—"}
                              color={statusChipColor(v.status)}
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={v.visit_type || "—"}
                              color={typeChipColor(v.visit_type)}
                              variant="outlined"
                            />
                          </Stack>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <EventIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Typography variant="body2" fontWeight={600}>
                              {fmtDateTime(v.scheduled_at)}
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Middle: Purpose / Note */}
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ display: "flex", alignItems: "center", mb: 0.25 }}
                          >
                            <AssignmentIcon
                              sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                            />
                            <strong>Purpose:</strong>&nbsp;{v.purpose || "—"}
                          </Typography>
                          {v.note && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <NotesIcon
                                sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                              />
                              {v.note}
                            </Typography>
                          )}
                        </Box>

                        <Divider />

                        {/* Bottom: Meta + actions */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: { xs: "stretch", sm: "center" },
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <WorkHistoryIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Typography variant="body2">
                                Planner: <strong>{v?.planner?.name || "—"}</strong>
                              </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Typography variant="body2">
                                Visited by: <strong>{v?.employee?.name || "—"}</strong>
                              </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <RoomIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Typography variant="body2">
                                Lead: <strong>{v?.lead?.prospect_name || "—"}</strong>
                              </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <MapIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Typography variant="body2">
                                Zone: <strong>{v?.zone?.zone_name || "—"}</strong>
                              </Typography>
                            </Stack>
                          </Stack>

                          <Tooltip
                            title={
                              hasCoords
                                ? "Open this location on map"
                                : "No coordinates available"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  hasCoords && handleOpenMap(coords.lat, coords.lng)
                                }
                                disabled={!hasCoords}
                                sx={{
                                  borderRadius: 2,
                                  bgcolor: hasCoords ? alpha(brand, 0.08) : "transparent",
                                  border: `1px solid ${hasCoords ? alpha(brand, 0.25) : divider}`,
                                  "&:hover": {
                                    bgcolor: hasCoords ? alpha(brand, 0.15) : "transparent",
                                  },
                                }}
                              >
                                <MyLocationIcon
                                  sx={{
                                    fontSize: 18,
                                    color: hasCoords ? brand : theme.palette.text.disabled,
                                  }}
                                />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))
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
