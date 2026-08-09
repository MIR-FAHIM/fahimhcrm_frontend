// src/scenes/prospect/ProspectListPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  AddRounded,
  AssignmentTurnedInRounded,
  BusinessRounded,
  CallRounded,
  EmailRounded,
  FilterAltRounded,
  LanguageRounded,
  LocationOnRounded,
  MapRounded,
  MessageRounded,
  OpenInNewRounded,
  RefreshRounded,
  SearchRounded,
  StarRounded,
  TableRowsRounded,
  TimelineRounded,
  ViewKanbanRounded,
} from "@mui/icons-material";

import opportunity from "../../../assets/images/opportunity.png";
import {
  fetchAllProspect,
  getAllProspectStageOverview,
} from "../../../api/controller/admin_controller/prospect_controller";

const activityItems = [
  ["call", "Calls", CallRounded, "error"],
  ["whatsapp", "Messages", MessageRounded, "info"],
  ["visit", "Visits", LocationOnRounded, "primary"],
  ["email", "Emails", EmailRounded, "warning"],
  ["task", "Tasks", AssignmentTurnedInRounded, "success"],
];

const sortOptions = [
  ["last_activity", "Last activity"],
  ["newest", "Newest"],
  ["oldest", "Oldest"],
  ["name", "Name A-Z"],
  ["engaged", "Most engaged"],
];

const truthy = (value) => value === true || value === 1 || value === "1";
const isHex = (value) => /^#([0-9A-F]{3}){1,2}$/i.test(String(value || ""));
const safeColor = (theme, color) => (isHex(color) ? color : theme.palette.primary.main);
const initials = (name = "") => name.split(" ").filter(Boolean).map((word) => word[0]).slice(0, 2).join("").toUpperCase() || "?";
const href = (url) => (url ? (String(url).startsWith("http") ? url : `https://${url}`) : "");
const dateText = (value) => (value && dayjs(value).isValid() ? dayjs(value).format("MMM D, YYYY") : "N/A");
const activityTotal = (row = {}) => Object.values(row.activity_summary || {}).reduce((sum, count) => sum + Number(count || 0), 0);
const timeValue = (value) => (value && dayjs(value).isValid() ? dayjs(value).valueOf() : 0);

const searchText = (row = {}) =>
  [
    row.prospect_name,
    row.address,
    row.website_link,
    row.linkedin_link,
    row.stage?.stage_name,
    row.industry_type?.industry_type_name,
    row.information_source?.information_source_name,
    row.zone?.zone_name,
    row.interested_for?.product_name,
    row.concern_persons?.map((p) => `${p.person_name || ""} ${p.mobile || ""} ${p.email || ""}`).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const sortRows = (rows, sortBy) =>
  [...rows].sort((a, b) => {
    if (sortBy === "newest") return timeValue(b.created_at) - timeValue(a.created_at);
    if (sortBy === "oldest") return timeValue(a.created_at) - timeValue(b.created_at);
    if (sortBy === "name") return String(a.prospect_name || "").localeCompare(String(b.prospect_name || ""));
    if (sortBy === "engaged") return activityTotal(b) - activityTotal(a);
    return timeValue(b.last_activity) - timeValue(a.last_activity);
  });

const Kpi = ({ icon, label, value, helper, tone = "primary" }) => {
  const theme = useTheme();
  const color = theme.palette[tone]?.main || theme.palette.primary.main;
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, flex: "1 1 165px", bgcolor: theme.palette.background.paper }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.25}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>{label}</Typography>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>{value}</Typography>
          {helper && <Typography variant="caption" noWrap sx={{ color: theme.palette.text.secondary }}>{helper}</Typography>}
        </Box>
        <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.12), color }}>{icon}</Avatar>
      </Stack>
    </Paper>
  );
};

const StageChip = ({ stage }) => {
  const theme = useTheme();
  const color = safeColor(theme, stage?.color_code);
  return <Chip size="small" label={stage?.stage_name || "No stage"} sx={{ bgcolor: color, color: theme.palette.getContrastText(color), fontWeight: 700 }} />;
};

const ActivityChips = ({ row }) => {
  const theme = useTheme();
  const data = row.activity_summary || {};
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {activityItems.map(([key, label, Icon, tone]) => {
        const color = theme.palette[tone]?.main || theme.palette.primary.main;
        return (
          <Tooltip key={key} title={`${label}: ${data[key] || 0}`}>
            <Chip
              size="small"
              icon={<Icon fontSize="small" />}
              label={data[key] || 0}
              variant="outlined"
              sx={{ height: 24, bgcolor: alpha(color, 0.08), borderColor: alpha(color, 0.24), color, fontWeight: 600, "& .MuiChip-icon": { color } }}
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
};

const ProspectListPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandHover = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.getContrastText(brand);

  const [prospects, setProspects] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("last_activity");
  const [query, setQuery] = useState("");

  const loadData = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [pRes, sRes] = await Promise.all([fetchAllProspect(), getAllProspectStageOverview()]);
      if (pRes?.status === "success") setProspects(pRes.data || []);
      else setError("Failed to fetch prospects.");
      if (sRes?.status === "success") setStages(sRes.data || []);
      else setError((current) => current || "Failed to fetch prospect stages.");
    } catch (err) {
      console.error(err);
      setError("Error fetching prospect data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const stageOptions = useMemo(() => {
    if (stages.length) return stages;
    const map = new Map();
    prospects.forEach((row) => {
      const id = row.stage_id ?? row.stage?.id;
      if (id != null) map.set(String(id), { id, stage_name: row.stage?.stage_name || `Stage ${id}`, color_code: row.stage?.color_code });
    });
    return Array.from(map.values());
  }, [prospects, stages]);

  const sourceOptions = useMemo(() => {
    const map = new Map();
    prospects.forEach((row) => {
      const id = row.information_source_id ?? row.information_source?.id;
      const name = row.information_source?.information_source_name || row.information_source_name;
      if (id != null && name) map.set(String(id), name);
    });
    return [{ id: "all", name: "All sources" }, ...Array.from(map, ([id, name]) => ({ id, name }))];
  }, [prospects]);

  const stageCounts = useMemo(() => {
    const map = new Map();
    prospects.forEach((row) => {
      const key = String(row.stage_id ?? row.stage?.id ?? "none");
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [prospects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = prospects.filter((row) => {
      const rowStage = String(row.stage_id ?? row.stage?.id ?? "");
      const rowSource = String(row.information_source_id ?? row.information_source?.id ?? "");
      if (stageFilter !== "all" && rowStage !== String(stageFilter)) return false;
      if (sourceFilter !== "all" && rowSource !== String(sourceFilter)) return false;
      if (typeFilter === "opportunities" && !truthy(row.is_opportunity)) return false;
      if (typeFilter === "leads" && truthy(row.is_opportunity)) return false;
      return !q || searchText(row).includes(q);
    });
    return sortRows(rows, sortBy);
  }, [prospects, query, sortBy, sourceFilter, stageFilter, typeFilter]);

  const topStage = useMemo(() => stageOptions.map((s) => ({ name: s.stage_name, count: stageCounts.get(String(s.id)) ?? Number(s.prospects_count || 0) })).sort((a, b) => b.count - a.count)[0], [stageCounts, stageOptions]);
  const opportunityCount = prospects.filter((row) => truthy(row.is_opportunity)).length;
  const engagedCount = prospects.filter((row) => activityTotal(row) > 0).length;

  const columns = useMemo(() => [
    {
      field: "prospect",
      headerName: "Prospect",
      minWidth: 320,
      flex: 1.4,
      sortable: false,
      renderCell: ({ row }) => {
        const color = safeColor(theme, row.stage?.color_code);
        const website = href(row.website_link);
        return (
          <Stack direction="row" spacing={1.2} alignItems="flex-start" sx={{ py: 1.25, width: "100%", minWidth: 0 }}>
            <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.14), color, fontWeight: 700 }}>{initials(row.prospect_name)}</Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>{row.prospect_name || "Untitled prospect"}</Typography>
                {truthy(row.is_opportunity) && <Tooltip title="Qualified opportunity"><Box component="img" src={opportunity} alt="Opportunity" sx={{ width: 18, height: 18 }} /></Tooltip>}
              </Stack>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Prospect #{row.id}</Typography>
              {website && <Link href={website} target="_blank" rel="noopener noreferrer" underline="hover" variant="caption" sx={{ display: "block", color: brand, fontWeight: 600 }}><LanguageRounded sx={{ fontSize: 14, mr: 0.4, verticalAlign: "text-bottom" }} />Website</Link>}
            </Box>
          </Stack>
        );
      },
    },
    { field: "stage", headerName: "Stage", minWidth: 160, flex: 0.7, valueGetter: ({ row }) => row.stage?.stage_name || "No stage", renderCell: ({ row }) => <Box sx={{ py: 1.25 }}><StageChip stage={row.stage} /></Box> },
    {
      field: "profile",
      headerName: "Profile",
      minWidth: 310,
      flex: 1.3,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1.25, width: "100%", minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 650 }}>{row.industry_type?.industry_type_name || "No industry"}</Typography>
          <Typography variant="caption" noWrap sx={{ display: "block", color: theme.palette.text.secondary }}>Source: {row.information_source?.information_source_name || "N/A"}</Typography>
          <Typography variant="caption" noWrap sx={{ display: "block", color: theme.palette.text.secondary }}>Zone: {row.zone?.zone_name || "N/A"} | Product: {row.interested_for?.product_name || "N/A"}</Typography>
          {row.address && <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}><MapRounded sx={{ fontSize: 14, mr: 0.4, verticalAlign: "text-bottom" }} />{row.address}</Typography>}
        </Box>
      ),
    },
    {
      field: "contact",
      headerName: "Contact",
      minWidth: 260,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const persons = row.concern_persons || [];
        const first = persons[0];
        return (
          <Tooltip title={persons.length ? persons.map((p) => `${p.person_name || "Unnamed"} - ${p.mobile || p.email || "No contact"}`).join(" | ") : "No contact person"} arrow>
            <Box sx={{ py: 1.25, minWidth: 0 }}>
              <Typography noWrap sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>{first?.person_name || "No contact person"}</Typography>
              <Typography variant="caption" noWrap sx={{ display: "block", color: theme.palette.text.secondary }}>{first?.mobile || first?.email || "Contact unavailable"}{persons.length > 1 ? ` | +${persons.length - 1} more` : ""}</Typography>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "activity",
      headerName: "Activity",
      minWidth: 300,
      flex: 1.15,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack spacing={0.75} sx={{ py: 1.25, width: "100%" }}>
          <ActivityChips row={row} />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Last: {dateText(row.last_activity)} | Next: {dateText(row.next_activity)}</Typography>
        </Stack>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      minWidth: 135,
      flex: 0.55,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => <Box sx={{ py: 1.25 }}><Button variant="contained" endIcon={<OpenInNewRounded />} onClick={() => navigate(`/prospect-detail/${row.id}`)} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: brand, color: brandContrast, "&:hover": { bgcolor: brandHover } }}>View</Button></Box>,
    },
  ], [brand, brandContrast, brandHover, navigate, theme]);

  const clearFilters = () => {
    setStageFilter("all");
    setSourceFilter("all");
    setTypeFilter("all");
    setSortBy("last_activity");
    setQuery("");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", lg: "row" }} alignItems={{ xs: "stretch", lg: "center" }} justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}><TableRowsRounded /></Avatar>
          <Box><Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1 }}>Prospects</Typography><Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Search, filter, compare, and open every prospect from one focused CRM list.</Typography></Box>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => navigate("/add-prospect")} sx={{ borderRadius: 2, fontWeight: 700 }}>Add Prospect</Button>
          <Button variant="outlined" startIcon={<ViewKanbanRounded />} onClick={() => navigate("/prospect-list-by-stage")} sx={{ borderRadius: 2, fontWeight: 700 }}>Stage View</Button>
          <Button variant="outlined" startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshRounded />} disabled={loading || refreshing} onClick={() => loadData({ silent: true })} sx={{ borderRadius: 2, fontWeight: 700 }}>Refresh</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={() => loadData()}>Retry</Button>}>{error}</Alert>}

      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mb: 2.5 }}>
        <Kpi icon={<BusinessRounded />} label="Total Prospects" value={prospects.length} helper="All records" />
        <Kpi icon={<SearchRounded />} label="Visible" value={filtered.length} helper="After filters" tone="info" />
        <Kpi icon={<StarRounded />} label="Opportunities" value={opportunityCount} helper="Qualified" tone="success" />
        <Kpi icon={<TimelineRounded />} label="Top Stage" value={topStage?.count || 0} helper={topStage?.name || "No stage"} tone="warning" />
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: "column", xl: "row" }} spacing={1.5} alignItems={{ xs: "stretch", xl: "center" }}>
          <TextField size="small" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search prospect, contact, address, source, product" sx={{ flex: 1 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }} />
          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 190 } }}><InputLabel>Stage</InputLabel><Select label="Stage" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}><MenuItem value="all">All stages</MenuItem>{stageOptions.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.stage_name}</MenuItem>)}</Select></FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 200 } }}><InputLabel>Source</InputLabel><Select label="Source" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>{sourceOptions.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</Select></FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 185 } }}><InputLabel>Type</InputLabel><Select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><MenuItem value="all">All records</MenuItem><MenuItem value="opportunities">Opportunities</MenuItem><MenuItem value="leads">Leads only</MenuItem></Select></FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 180 } }}><InputLabel>Sort</InputLabel><Select label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>{sortOptions.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</Select></FormControl>
          <Button variant="text" onClick={clearFilters} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Clear Filters</Button>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip icon={<FilterAltRounded />} clickable label={`All stages (${prospects.length})`} color={stageFilter === "all" ? "primary" : "default"} variant={stageFilter === "all" ? "filled" : "outlined"} onClick={() => setStageFilter("all")} sx={{ fontWeight: 650 }} />
          {stageOptions.map((s) => {
            const count = stageCounts.get(String(s.id)) ?? Number(s.prospects_count || 0);
            const color = safeColor(theme, s.color_code);
            const selected = String(stageFilter) === String(s.id);
            return <Chip key={s.id} clickable label={`${s.stage_name} (${count})`} variant={selected ? "filled" : "outlined"} onClick={() => setStageFilter(String(s.id))} sx={{ fontWeight: 650, bgcolor: selected ? alpha(color, 0.18) : "transparent", color: selected ? color : theme.palette.text.primary, borderColor: selected ? alpha(color, 0.55) : theme.palette.divider, "&:hover": { bgcolor: alpha(color, 0.12) } }} />;
          })}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ height: "72vh", borderRadius: 2, overflow: "hidden", bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, "& .MuiDataGrid-root": { border: "none", color: theme.palette.text.primary }, "& .MuiDataGrid-columnHeaders": { bgcolor: alpha(brand, 0.1), borderBottom: `1px solid ${theme.palette.divider}` }, "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 }, "& .MuiDataGrid-cell": { borderBottom: `1px solid ${theme.palette.divider}`, alignItems: "flex-start" }, "& .MuiDataGrid-row": { cursor: "pointer" }, "& .MuiDataGrid-row:hover": { bgcolor: alpha(brand, 0.06) }, "& .MuiDataGrid-footerContainer": { bgcolor: alpha(brand, 0.08), borderTop: `1px solid ${theme.palette.divider}` }, "& .MuiDataGrid-toolbarContainer": { p: 1, borderBottom: `1px solid ${theme.palette.divider}`, "& .MuiButton-text": { color: theme.palette.text.primary, fontWeight: 600 } } }}>
        <DataGrid rows={filtered} columns={columns} getRowId={(row) => row.id} loading={loading || refreshing} checkboxSelection disableRowSelectionOnClick onRowDoubleClick={(params) => navigate(`/prospect-detail/${params.row.id}`)} slots={{ toolbar: GridToolbar }} getRowHeight={() => "auto"} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>

      <Paper elevation={0} sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(brand, 0.06), border: `1px solid ${alpha(brand, 0.16)}` }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Showing {filtered.length} of {prospects.length} prospects. Double-click a row to open details. {engagedCount} prospects have logged activity.</Typography>
          <LinearProgress variant="determinate" value={prospects.length ? Math.round((filtered.length / prospects.length) * 100) : 0} sx={{ width: { xs: "100%", sm: 220 }, height: 7, borderRadius: 999 }} />
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProspectListPage;