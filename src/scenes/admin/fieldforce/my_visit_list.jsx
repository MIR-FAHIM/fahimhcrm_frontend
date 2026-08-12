// MyVisits.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Toolbar,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  useTheme,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Box,
  Tabs,
  Tab,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";
import EventIcon from "@mui/icons-material/Event";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Controller
import {
  completeVisit,
  getEmpVisitSchedule,
  startVisit,
} from "../../../api/controller/admin_controller/visit_controller";

const fmtDate = (val) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString();
  } catch {
    return val;
  }
};

export default function MyVisits() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [schedule, setSchedule] = useState({ today: [], upcoming: [], previous: [] });
  const [activeTab, setActiveTab] = useState("today");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "error" });
  const [actionState, setActionState] = useState({ open: false, type: "", visit: null, note: "", saving: false });

  const userID =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const handleOpenMap = (lat, lng) => {
    if (lat != null && lng != null) {
      navigate(`/google-map?lat=${lat}&lng=${lng}`);
    }
  };

  const loadSchedule = async () => {
    if (!userID) {
      setSnack({ open: true, msg: "No user ID found.", sev: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await getEmpVisitSchedule(userID);
      const data = res?.data || {};
      const nextSchedule = {
        today: Array.isArray(data.today) ? data.today : [],
        upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
        previous: Array.isArray(data.previous) ? data.previous : [],
      };
      setSchedule(nextSchedule);
      setRows(nextSchedule[activeTab] || []);
    } catch (e) {
      console.error(e);
      setSnack({ open: true, msg: "Failed to load visits.", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [userID]);

  useEffect(() => {
    setRows(schedule[activeTab] || []);
  }, [activeTab, schedule]);

  const getBrowserLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Browser geolocation is not available."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
        () => reject(new Error("Location permission was denied or unavailable.")),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });

  const openVisitAction = (type, visit) => setActionState({ open: true, type, visit, note: "", saving: false });
  const closeVisitAction = () => setActionState({ open: false, type: "", visit: null, note: "", saving: false });

  const submitVisitAction = async () => {
    if (!actionState.visit?.id) return;
    setActionState((current) => ({ ...current, saving: true }));
    try {
      const coords = await getBrowserLocation();
      const payload = {
        employee_id: Number(userID),
        latitude: coords.latitude,
        longitude: coords.longitude,
        note: actionState.note?.trim() || null,
      };
      const res = actionState.type === "complete"
        ? await completeVisit(actionState.visit.id, payload)
        : await startVisit(actionState.visit.id, payload);

      if (res?.status === "success" || res?.success) {
        setSnack({ open: true, msg: actionState.type === "complete" ? "Visit completed." : "Visit started.", sev: "success" });
        closeVisitAction();
        await loadSchedule();
      } else {
        const message = res?.errors ? Object.values(res.errors).flat().join(" ") : res?.message;
        setSnack({ open: true, msg: message || "Visit update failed.", sev: "error" });
        setActionState((current) => ({ ...current, saving: false }));
      }
    } catch (error) {
      setSnack({ open: true, msg: error.message || "Visit update failed.", sev: "error" });
      setActionState((current) => ({ ...current, saving: false }));
    }
  };

  const displayLabel = (value, fallback = "—") => {
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (value && typeof value === "object") {
      return (
        value.status_name ||
        value.name ||
        value.type ||
        value.label ||
        value.value ||
        fallback
      );
    }
    return fallback;
  };

  const normalizeValue = (value) =>
    String(displayLabel(value, "")).toLowerCase();

  // Build filter options
  const allStatuses = useMemo(() => {
    const values = rows
      .map((r) => displayLabel(r?.status, ""))
      .filter(Boolean)
      .map((v) => String(v));
    return ["all", ...Array.from(new Set(values))];
  }, [rows]);

  const allTypes = useMemo(() => {
    const values = rows
      .map((r) => displayLabel(r?.visit_type, ""))
      .filter(Boolean)
      .map((v) => String(v));
    return ["all", ...Array.from(new Set(values))];
  }, [rows]);

  // Apply filters + search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const statusKey = statusFilter === "all" ? "all" : statusFilter.toLowerCase();
    const typeKey = typeFilter === "all" ? "all" : typeFilter.toLowerCase();

    return rows.filter((r) => {
      const rowStatus = normalizeValue(r?.status);
      const rowType = normalizeValue(r?.visit_type);

      if (statusKey !== "all" && rowStatus !== statusKey) return false;
      if (typeKey !== "all" && rowType !== typeKey) return false;

      if (!q) return true;
      const hay = [
        r?.purpose,
        r?.note,
        displayLabel(r?.status, ""),
        displayLabel(r?.visit_type, ""),
        r?.planner?.name,
        r?.lead?.prospect_name,
        r?.zone?.zone_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [rows, query, statusFilter, typeFilter]);

  const statusChipColor = (status) => {
    switch (normalizeValue(status)) {
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
    switch (normalizeValue(type)) {
      case "planned":
        return "primary";
      case "ad-hoc":
      case "adhoc":
        return "secondary";
      default:
        return "default";
    }
  };

  const brand = theme.palette.primary.main;
  const divider = theme.palette.divider;
  const textSec = theme.palette.text.secondary;

  // Helper to get preferred coords (check-in first, else lead coords)
  const getCoords = (v) => {
    const parseNum = (x) => {
      const n = Number(x);
      return Number.isFinite(n) ? n : null;
    };
    const lat =
      parseNum(v?.checkin_latitude) ??
      parseNum(v?.lead?.latitude) ??
      null;
    const lng =
      parseNum(v?.checkin_longitude) ??
      parseNum(v?.lead?.longitude) ??
      null;
    return { lat, lng };
  };

  // Column count (update if you add/remove columns)
  const COLS = 9; // Includes details column

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
        {/* Toolbar */}
        <Toolbar
          sx={{
            px: 2,
            py: 1.5,
            gap: 1,
            flexWrap: "wrap",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
            My Visits
          </Typography>

          {/* Search */}
          <TextField
            size="small"
            placeholder="Search visits…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 260 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Filters */}
          <Stack direction="row" spacing={1} sx={{ minWidth: { xs: "100%", md: "auto" }, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 140 } }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {allStatuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s === "all" ? "All statuses" : s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 140 } }}>
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                label="Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {allTypes.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t === "all" ? "All types" : t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Toolbar>

        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            ".MuiTab-root": { textTransform: "none", fontWeight: 700 },
          }}
        >
          <Tab value="today" label={`Today (${schedule.today.length})`} />
          <Tab value="upcoming" label={`Upcoming (${schedule.upcoming.length})`} />
          <Tab value="previous" label={`Previous (${schedule.previous.length})`} />
        </Tabs>

        {isMobile ? (
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {loading && <LinearProgress />}

            {!loading && filtered.length === 0 && (
              <Typography align="center" sx={{ py: 4, color: "text.secondary" }}>
                No visits found.
              </Typography>
            )}

            {!loading &&
              filtered.map((v) => {
                const { lat, lng } = getCoords(v);
                const hasCoords = lat != null && lng != null;
                const statusLabel = displayLabel(v.status);
                const typeLabel = displayLabel(v.visit_type);

                return (
                  <Paper key={v.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {v.lead?.prospect_name || "Visit"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {v.id}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={statusLabel} color={statusChipColor(v.status)} variant="outlined" />
                        <Chip size="small" label={typeLabel} color={typeChipColor(v.visit_type)} variant="outlined" />
                      </Stack>
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EventIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {fmtDate(v.scheduled_at)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {v.actual_start_at || v.actual_end_at
                              ? `Actual: ${fmtDate(v.actual_start_at)} → ${fmtDate(v.actual_end_at)}`
                              : "—"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <FmdGoodIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" fontWeight={700}>
                          {v.lead?.prospect_name || "—"}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Zone: {v.zone?.zone_name || "—"}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Purpose
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {v.purpose || "—"}
                      </Typography>
                      {v.note && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          {v.note}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                      <Chip size="small" label={`Task: ${displayLabel(v?.task_visit_relation?.task?.status || v?.task_visit_relation?.status, "-")}`} variant="outlined" />
                      <Chip size="small" label={`Priority: ${v.priority?.priority_name || "-"}`} variant="outlined" />
                    </Stack>

                    <Box sx={{ mt: 1.5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Planner
                        </Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <WorkHistoryIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="body2">{v.planner?.name || "—"}</Typography>
                        </Stack>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Location
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasCoords) handleOpenMap(lat, lng);
                            }}
                            disabled={!hasCoords}
                            sx={{
                              borderRadius: 2,
                              bgcolor: hasCoords ? alpha(brand, 0.08) : "transparent",
                              border: `1px solid ${hasCoords ? alpha(brand, 0.3) : divider}`,
                              "&:hover": {
                                bgcolor: hasCoords ? alpha(brand, 0.16) : "transparent",
                              },
                            }}
                          >
                            <MyLocationIcon
                              sx={{
                                fontSize: 18,
                                color: hasCoords ? brand : textSec,
                              }}
                            />
                          </IconButton>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {hasCoords ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "—"}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                      <Stack direction="row" spacing={1} sx={{ mr: "auto" }}>
                        <Button size="small" variant="outlined" onClick={() => openVisitAction("start", v)}>
                          Start
                        </Button>
                        <Button size="small" variant="contained" onClick={() => openVisitAction("complete", v)}>
                          Complete
                        </Button>
                      </Stack>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          const tid = v.task_visit_relation?.task_id;
                          if (tid) navigate(`/task-details/${tid}`);
                        }}
                        disabled={!v.task_visit_relation?.task_id}
                        sx={{ borderRadius: 2 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                );
              })}
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 560 }}>
            <Table stickyHeader size="small" aria-label="my visits table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell>Lead / Zone</TableCell>
                  <TableCell>Purpose & Note</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Planner</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={COLS} sx={{ p: 0 }}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                )}

                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={COLS} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No visits found.
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  filtered.map((v) => {
                    const { lat, lng } = getCoords(v);
                    const hasCoords = lat != null && lng != null;
                    const statusLabel = displayLabel(v.status);
                    const typeLabel = displayLabel(v.visit_type);

                    return (
                      <TableRow key={v.id} hover>
                        {/* When */}
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {v.id}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <EventIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {fmtDate(v.scheduled_at)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {v.actual_start_at || v.actual_end_at
                                  ? `Actual: ${fmtDate(v.actual_start_at)} → ${fmtDate(v.actual_end_at)}`
                                  : "—"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Lead / Zone */}
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <FmdGoodIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Typography variant="body2" fontWeight={700}>
                                {v.lead?.prospect_name || "—"}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              Zone: {v.zone?.zone_name || "—"}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Purpose & Note */}
                        <TableCell sx={{ maxWidth: 260, minWidth: 180 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "normal",
                              maxWidth: "240px",
                            }}
                            title={v.purpose}
                          >
                            {v.purpose || "—"}
                          </Typography>
                          {v.note && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "normal",
                                maxWidth: "240px",
                                mt: 0.5,
                              }}
                              title={v.note}
                            >
                              {v.note}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Stack spacing={0.75} alignItems="flex-start">
                            <Chip
                              size="small"
                              label={statusLabel}
                              color={statusChipColor(v.status)}
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={`Task: ${displayLabel(v?.task_visit_relation?.task?.status || v?.task_visit_relation?.status, "-")}`}
                              variant="outlined"
                            />
                          </Stack>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Stack spacing={0.75} alignItems="flex-start">
                            <Chip
                              size="small"
                              label={typeLabel}
                              color={typeChipColor(v.visit_type)}
                              variant="outlined"
                            />
                            <Chip size="small" label={`Priority: ${v.priority?.priority_name || "-"}`} variant="outlined" />
                          </Stack>
                        </TableCell>

                        {/* Location */}
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (hasCoords) handleOpenMap(lat, lng);
                              }}
                              disabled={!hasCoords}
                              sx={{
                                borderRadius: 2,
                                bgcolor: hasCoords ? alpha(brand, 0.08) : "transparent",
                                border: `1px solid ${hasCoords ? alpha(brand, 0.3) : divider}`,
                                "&:hover": {
                                  bgcolor: hasCoords ? alpha(brand, 0.16) : "transparent",
                                },
                              }}
                            >
                              <MyLocationIcon
                                sx={{
                                  fontSize: 18,
                                  color: hasCoords ? brand : textSec,
                                }}
                              />
                            </IconButton>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {hasCoords ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "—"}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Planner */}
                        <TableCell>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <WorkHistoryIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="body2">{v.planner?.name || "—"}</Typography>
                          </Stack>
                        </TableCell>

                        {/* Details column */}
                        <TableCell>
                          <Stack direction="row" spacing={0.75}>
                            <Button size="small" variant="outlined" onClick={() => openVisitAction("start", v)}>
                              Start
                            </Button>
                            <Button size="small" variant="contained" onClick={() => openVisitAction("complete", v)}>
                              Done
                            </Button>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                const tid = v.task_visit_relation?.task_id;
                                if (tid) navigate(`/task-details/${tid}`);
                              }}
                              disabled={!v.task_visit_relation?.task_id}
                              sx={{ borderRadius: 2 }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={actionState.open} onClose={actionState.saving ? undefined : closeVisitAction} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {actionState.type === "complete" ? "Complete Visit" : "Start Visit"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              {actionState.visit?.lead?.prospect_name || actionState.visit?.zone?.zone_name || "Selected visit"}
            </Typography>
            <TextField
              label={actionState.type === "complete" ? "Visit report / note" : "Start note"}
              value={actionState.note}
              onChange={(event) => setActionState((current) => ({ ...current, note: event.target.value }))}
              multiline
              minRows={3}
              fullWidth
              placeholder="Write a short note"
            />
            <Alert severity="info">
              Browser location permission is required for this action.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeVisitAction} disabled={actionState.saving}>Cancel</Button>
          <Button variant="contained" onClick={submitVisitAction} disabled={actionState.saving}>
            {actionState.saving ? "Saving..." : actionState.type === "complete" ? "Complete Visit" : "Start Visit"}
          </Button>
        </DialogActions>
      </Dialog>

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
