// DateWiseVisit.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MapIcon from "@mui/icons-material/Map";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import NotesIcon from "@mui/icons-material/Notes";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import RoomIcon from "@mui/icons-material/Room";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SearchIcon from "@mui/icons-material/Search";
import TodayIcon from "@mui/icons-material/Today";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

import { getDateWiseVisit } from "../../../api/controller/admin_controller/visit_controller";

const fallback = "-";

const labelOf = (value, empty = fallback) => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    return value.status_name || value.priority_name || value.zone_name || value.prospect_name || value.name || value.label || value.value || empty;
  }
  return empty;
};

const normalize = (value) => labelOf(value, "").trim().toLowerCase();

const formatDate = (value, pattern = "MMM D, YYYY") => {
  if (!value) return fallback;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(pattern) : String(value);
};

const formatDateTime = (value) => formatDate(value, "MMM D, YYYY h:mm A");

const parseDate = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const statusTone = (status) => {
  const key = normalize(status);
  if (["completed", "done", "checked out", "success"].includes(key)) return "success";
  if (["started", "in progress", "ongoing", "checked in"].includes(key)) return "info";
  if (["cancelled", "canceled", "failed", "missed"].includes(key)) return "error";
  if (["pending", "scheduled", "planned"].includes(key)) return "warning";
  return "default";
};

const typeTone = (type) => {
  const key = normalize(type);
  if (["planned", "plan"].includes(key)) return "primary";
  if (["ad-hoc", "adhoc", "instant"].includes(key)) return "secondary";
  return "default";
};

const getCoords = (visit) => {
  const parse = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };
  const lat = parse(visit?.start_latitude) ?? parse(visit?.checkin_latitude) ?? parse(visit?.complete_latitude) ?? parse(visit?.lead?.latitude);
  const lng = parse(visit?.start_longitude) ?? parse(visit?.checkin_longitude) ?? parse(visit?.complete_longitude) ?? parse(visit?.lead?.longitude);
  return lat != null && lng != null ? { lat, lng } : null;
};

const visitSearch = (visit = {}) =>
  [
    visit.id,
    visit.purpose,
    visit.note,
    labelOf(visit.status, ""),
    labelOf(visit.priority, ""),
    labelOf(visit.visit_type, ""),
    visit.planner?.name,
    visit.employee?.name,
    visit.lead?.prospect_name,
    visit.zone?.zone_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const flattenVisits = (groups) => groups.flatMap((group) => (Array.isArray(group.visits) ? group.visits.map((visit) => ({ ...visit, group_date: group.date })) : []));

const StatTile = ({ icon, label, value, helper, tone = "primary" }) => {
  const theme = useTheme();
  const color = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        flex: "1 1 165px",
        minWidth: { xs: 145, sm: 165 },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="space-between">
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1.15 }}>
            {value}
          </Typography>
          {helper && (
            <Typography variant="caption" noWrap sx={{ color: theme.palette.text.secondary }}>
              {helper}
            </Typography>
          )}
        </Box>
        <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.12), color }}>
          {icon}
        </Avatar>
      </Stack>
    </Paper>
  );
};

const SoftChip = ({ icon, label, color = "primary", variant = "outlined", sx }) => {
  const theme = useTheme();
  const base = theme.palette[color]?.main || theme.palette.text.secondary;

  return (
    <Chip
      size="small"
      icon={icon}
      label={label}
      color={variant === "filled" && color !== "default" ? color : undefined}
      variant={variant === "filled" ? "filled" : "outlined"}
      sx={{
        fontWeight: 600,
        bgcolor: variant === "filled" ? undefined : alpha(base, 0.08),
        borderColor: variant === "filled" ? undefined : alpha(base, 0.28),
        color: variant === "filled" ? undefined : base,
        "& .MuiChip-icon": { color: variant === "filled" ? undefined : base },
        ...sx,
      }}
    />
  );
};
const VisitCard = ({ visit, onMap, onProspect, onTask }) => {
  const theme = useTheme();
  const coords = getCoords(visit);
  const priorityColor = visit?.priority?.color_code && /^#([0-9A-F]{3}){1,2}$/i.test(visit.priority.color_code)
    ? visit.priority.color_code
    : theme.palette.warning.main;
  const leadName = visit?.lead?.prospect_name || fallback;
  const taskId = visit?.task_visit_relation?.task_id;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(theme.palette.primary.main, 0.38),
          boxShadow: theme.shadows[3],
        },
      }}
    >
      <Stack spacing={1.35}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "stretch", md: "flex-start" }}>
          <Stack direction="row" spacing={1.2} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: alpha(priorityColor, 0.14),
                color: priorityColor,
                fontWeight: 700,
                width: 44,
                height: 44,
              }}
            >
              #{visit.id || "?"}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                  {visit.purpose || "Visit plan"}
                </Typography>
                <SoftChip label={labelOf(visit.status)} color={statusTone(visit.status)} variant="filled" />
                <SoftChip label={labelOf(visit.visit_type)} color={typeTone(visit.visit_type)} />
              </Stack>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Scheduled {formatDateTime(visit.scheduled_at)}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent={{ xs: "flex-start", md: "flex-end" }}>
            <SoftChip label={labelOf(visit.priority)} sx={{ bgcolor: alpha(priorityColor, 0.1), borderColor: alpha(priorityColor, 0.34), color: priorityColor }} />
            <Tooltip title={coords ? "Open visit location" : "No coordinates available"}>
              <span>
                <IconButton
                  size="small"
                  disabled={!coords}
                  onClick={() => coords && onMap(coords.lat, coords.lng)}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${coords ? alpha(theme.palette.primary.main, 0.28) : theme.palette.divider}`,
                    bgcolor: coords ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                  }}
                >
                  <MyLocationIcon fontSize="small" color={coords ? "primary" : "disabled"} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {visit.note && (
          <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: theme.palette.background.default, border: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={0.8} alignItems="flex-start">
              <NotesIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mt: 0.15 }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {visit.note}
              </Typography>
            </Stack>
          </Paper>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 1 }}>
          <MetaItem icon={<WorkHistoryIcon />} label="Planner" value={visit?.planner?.name} />
          <MetaItem icon={<PersonIcon />} label="Visited By" value={visit?.employee?.name} />
          <MetaItem icon={<RoomIcon />} label="Lead" value={leadName} />
          <MetaItem icon={<MapIcon />} label="Zone" value={visit?.zone?.zone_name} />
        </Box>

        <Divider />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <SoftChip icon={<ScheduleIcon />} label={formatDateTime(visit.scheduled_at)} />
            <SoftChip icon={<AssignmentIcon />} label={`Visit #${visit.id || fallback}`} />
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              endIcon={<OpenInNewIcon />}
              disabled={!visit?.lead?.id}
              onClick={() => visit?.lead?.id && onProspect(visit.lead.id)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Prospect
            </Button>
            <Button
              size="small"
              variant="contained"
              endIcon={<OpenInNewIcon />}
              disabled={!taskId}
              onClick={() => taskId && onTask(taskId)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Task
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

const MetaItem = ({ icon, label, value }) => {
  const theme = useTheme();

  return (
    <Paper elevation={0} sx={{ p: 1.1, borderRadius: 1.5, bgcolor: theme.palette.background.default, border: `1px solid ${theme.palette.divider}` }}>
      <Stack direction="row" spacing={0.85} alignItems="center" sx={{ minWidth: 0 }}>
        <Box sx={{ color: theme.palette.text.secondary, display: "flex", "& svg": { fontSize: 18 } }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
            {value || fallback}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default function DateWiseVisit() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedDates, setExpandedDates] = useState({});
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "error" });

  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const loadVisits = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getDateWiseVisit();
      const list = Array.isArray(res?.data) ? res.data : [];
      setGroups(list);
      setExpandedDates((current) => {
        if (Object.keys(current).length) return current;
        return Object.fromEntries(list.slice(0, 2).map((group) => [group.date, true]));
      });
    } catch (error) {
      console.error(error);
      setSnack({ open: true, msg: "Failed to load visits.", sev: "error" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  const allVisits = useMemo(() => flattenVisits(groups), [groups]);

  const statusOptions = useMemo(() => {
    const values = Array.from(new Set(allVisits.map((visit) => labelOf(visit.status, "")).filter(Boolean)));
    return ["all", ...values];
  }, [allVisits]);

  const typeOptions = useMemo(() => {
    const values = Array.from(new Set(allVisits.map((visit) => labelOf(visit.visit_type, "")).filter(Boolean)));
    return ["all", ...values];
  }, [allVisits]);

  const employeeOptions = useMemo(() => {
    const map = new Map();
    allVisits.forEach((visit) => {
      if (visit?.employee?.id && visit?.employee?.name) map.set(String(visit.employee.id), visit.employee.name);
    });
    return [{ id: "all", name: "All employees" }, ...Array.from(map, ([id, name]) => ({ id, name }))];
  }, [allVisits]);
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = dateFrom ? dayjs(dateFrom).startOf("day") : null;
    const to = dateTo ? dayjs(dateTo).endOf("day") : null;

    return groups
      .map((group) => {
        const visits = (group.visits || []).filter((visit) => {
          const statusMatch = statusFilter === "all" || normalize(visit.status) === normalize(statusFilter);
          const typeMatch = typeFilter === "all" || normalize(visit.visit_type) === normalize(typeFilter);
          const employeeMatch = employeeFilter === "all" || String(visit?.employee?.id || "") === String(employeeFilter);
          const visitDate = parseDate(visit.scheduled_at || group.date);
          const fromMatch = !from || !visitDate || visitDate.isAfter(from) || visitDate.isSame(from, "day");
          const toMatch = !to || !visitDate || visitDate.isBefore(to) || visitDate.isSame(to, "day");
          const searchMatch = !q || visitSearch(visit).includes(q);
          return statusMatch && typeMatch && employeeMatch && fromMatch && toMatch && searchMatch;
        });
        return { ...group, visits };
      })
      .filter((group) => group.visits.length > 0);
  }, [dateFrom, dateTo, employeeFilter, groups, query, statusFilter, typeFilter]);

  const visibleVisits = useMemo(() => flattenVisits(filteredGroups), [filteredGroups]);
  const completedVisits = allVisits.filter((visit) => statusTone(visit.status) === "success").length;
  const todayVisits = allVisits.filter((visit) => dayjs(visit.scheduled_at || visit.group_date).isSame(dayjs(), "day")).length;
  const withLocation = allVisits.filter((visit) => Boolean(getCoords(visit))).length;

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setEmployeeFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const expandAll = () => setExpandedDates(Object.fromEntries(filteredGroups.map((group) => [group.date, true])));
  const collapseAll = () => setExpandedDates({});
  const handleOpenMap = (lat, lng) => navigate(`/google-map?lat=${lat}&lng=${lng}`);
  const handleOpenProspect = (id) => navigate(`/prospect-detail/${id}`);
  const handleOpenTask = (id) => navigate(`/task-details/${id}`);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        alignItems={{ xs: "stretch", lg: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <TodayIcon />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1 }}>
              Date-wise Visits
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Field visit schedule grouped by day, team, status, and location readiness.
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button variant="outlined" startIcon={<ListAltIcon />} onClick={expandAll} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Expand All
          </Button>
          <Button variant="outlined" startIcon={<ExpandMoreIcon />} onClick={collapseAll} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Collapse
          </Button>
          <Button
            variant="contained"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            disabled={loading || refreshing}
            onClick={() => loadVisits({ silent: true })}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mb: 2.5 }}>
        <StatTile icon={<EventIcon />} label="Total Visits" value={allVisits.length} helper={`${groups.length} date groups`} />
        <StatTile icon={<SearchIcon />} label="Visible" value={visibleVisits.length} helper="After filters" tone="info" />
        <StatTile icon={<TodayIcon />} label="Today" value={todayVisits} helper={formatDate(dayjs())} tone="warning" />
        <StatTile icon={<CheckCircleIcon />} label="Completed" value={completedVisits} helper="Finished visits" tone="success" />
        <StatTile icon={<MyLocationIcon />} label="Mapped" value={withLocation} helper="Has coordinates" tone="error" />
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: "column", xl: "row" }} spacing={1.5} alignItems={{ xs: "stretch", xl: "center" }}>
          <TextField
            size="small"
            placeholder="Search purpose, note, employee, lead, zone"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            sx={{ flex: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField size="small" label="From" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: { xs: "100%", xl: 155 } }} />
          <TextField size="small" label="To" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: { xs: "100%", xl: 155 } }} />
          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 170 } }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {statusOptions.map((option) => <MenuItem key={option} value={option}>{option === "all" ? "All statuses" : option}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 155 } }}>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              {typeOptions.map((option) => <MenuItem key={option} value={option}>{option === "all" ? "All types" : option}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 185 } }}>
            <InputLabel>Employee</InputLabel>
            <Select label="Employee" value={employeeFilter} onChange={(event) => setEmployeeFilter(event.target.value)}>
              {employeeOptions.map((option) => <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="text" onClick={clearFilters} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
            Clear Filters
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip icon={<FilterAltIcon />} clickable label={`All (${allVisits.length})`} color={statusFilter === "all" ? "primary" : "default"} variant={statusFilter === "all" ? "filled" : "outlined"} onClick={() => setStatusFilter("all")} sx={{ fontWeight: 650 }} />
          {statusOptions.filter((option) => option !== "all").map((option) => {
            const count = allVisits.filter((visit) => normalize(visit.status) === normalize(option)).length;
            return <Chip key={option} clickable label={`${option} (${count})`} color={statusTone(option)} variant={statusFilter === option ? "filled" : "outlined"} onClick={() => setStatusFilter(option)} sx={{ fontWeight: 650 }} />;
          })}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
              Loading visits...
            </Typography>
          </Box>
        ) : filteredGroups.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <EventIcon color="disabled" sx={{ fontSize: 38 }} />
            <Typography variant="h6" sx={{ mt: 1, color: theme.palette.text.primary, fontWeight: 700 }}>
              No visits found
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Try changing the date range, status, type, employee, or search text.
            </Typography>
          </Box>
        ) : (
          filteredGroups.map((group) => {
            const groupDate = parseDate(group.date);
            const completed = group.visits.filter((visit) => statusTone(visit.status) === "success").length;
            const progress = group.visits.length ? Math.round((completed / group.visits.length) * 100) : 0;
            const groupKey = group.date || "unknown";

            return (
              <Accordion
                key={groupKey}
                disableGutters
                expanded={Boolean(expandedDates[groupKey])}
                onChange={() => setExpandedDates((current) => ({ ...current, [groupKey]: !current[groupKey] }))}
                sx={{
                  boxShadow: "none",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, py: 1 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" sx={{ width: "100%", pr: 1 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                      <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
                        <ScheduleIcon />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                          {groupDate ? groupDate.format("dddd, MMM D, YYYY") : group.date || fallback}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {group.visits.length} visits | {completed} completed
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <SoftChip icon={<EventIcon />} label={`${group.visits.length} visits`} />
                      <Box sx={{ width: 120 }}>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 7, borderRadius: 999 }} />
                      </Box>
                    </Stack>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Stack spacing={1.5}>
                    {group.visits.map((visit) => (
                      <VisitCard key={visit.id} visit={visit} onMap={handleOpenMap} onProspect={handleOpenProspect} onTask={handleOpenTask} />
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={2600}
        onClose={() => setSnack((state) => ({ ...state, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
