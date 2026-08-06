// src/scenes/prospect/ProspectListByStage.jsx
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AddRounded,
  AssignmentTurnedInRounded,
  BusinessRounded,
  CallRounded,
  EmailRounded,
  FilterAltRounded,
  LanguageRounded,
  LinkedIn,
  LocationOnRounded,
  MapRounded,
  MessageRounded,
  OpenInNewRounded,
  RefreshRounded,
  SearchRounded,
  SourceRounded,
  StarRounded,
  TableRowsRounded,
  TimelineRounded,
  TrendingUpRounded,
  ViewKanbanRounded,
} from "@mui/icons-material";

import {
  fetchAllProspectByStage,
  getProspectAllStatus,
} from "../../../api/controller/admin_controller/prospect_controller";
import { base_url } from "../../../api/config";
import opportunity from "../../../assets/images/opportunity.png";

const ACTIVITY_TYPES = [
  { type: "call", label: "Calls", icon: <CallRounded fontSize="inherit" /> },
  { type: "whatsapp", label: "Messages", icon: <MessageRounded fontSize="inherit" /> },
  { type: "visit", label: "Visits", icon: <LocationOnRounded fontSize="inherit" /> },
  { type: "email", label: "Emails", icon: <EmailRounded fontSize="inherit" /> },
  { type: "task", label: "Tasks", icon: <AssignmentTurnedInRounded fontSize="inherit" /> },
];

const SORT_OPTIONS = [
  { value: "last_activity_desc", label: "Last activity" },
  { value: "created_desc", label: "Newest" },
  { value: "created_asc", label: "Oldest" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "activity_desc", label: "Most engaged" },
];

const isTrue = (value) => value === true || value === 1 || value === "1";

const ensureUrl = (url) => {
  if (!url) return "";
  return String(url).startsWith("http") ? url : `https://${url}`;
};

const getStageColor = (theme, colorCode) => {
  if (colorCode && /^#([0-9A-F]{3}){1,2}$/i.test(colorCode)) return colorCode;
  return theme.palette.primary.main;
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const getActivityTotal = (prospect = {}) =>
  Object.values(prospect.activity_summary || {}).reduce((sum, count) => sum + Number(count || 0), 0);

const getLastActivityTime = (prospect = {}) => {
  if (!prospect.last_activity) return 0;
  const value = dayjs(prospect.last_activity).valueOf();
  return Number.isFinite(value) ? value : 0;
};

const formatDate = (value) => {
  if (!value) return "No activity";
  const date = dayjs(value);
  return date.isValid() ? date.format("MMM D, YYYY") : "No activity";
};

const flattenProspects = (grouped = {}) =>
  Object.entries(grouped).flatMap(([stageName, list]) =>
    (list || []).map((prospect) => ({ ...prospect, stage_name: prospect.stage?.stage_name || stageName }))
  );

const sortProspects = (items, sortBy) =>
  [...items].sort((a, b) => {
    if (sortBy === "created_asc") return dayjs(a.created_at || 0).valueOf() - dayjs(b.created_at || 0).valueOf();
    if (sortBy === "created_desc") return dayjs(b.created_at || 0).valueOf() - dayjs(a.created_at || 0).valueOf();
    if (sortBy === "name_asc") return String(a.prospect_name || "").localeCompare(String(b.prospect_name || ""));
    if (sortBy === "activity_desc") return getActivityTotal(b) - getActivityTotal(a);
    return getLastActivityTime(b) - getLastActivityTime(a);
  });

const ActivityChip = ({ icon, label, count, type }) => {
  const theme = useTheme();
  const colorMap = {
    call: theme.palette.success.main,
    whatsapp: theme.palette.success.dark || theme.palette.success.main,
    visit: theme.palette.error.main,
    email: theme.palette.info.main,
    task: theme.palette.primary.main,
  };
  const color = colorMap[type] || theme.palette.primary.main;

  return (
    <Chip
      icon={icon}
      label={`${count || 0} ${label}`}
      size="small"
      variant="outlined"
      sx={{
        height: 24,
        bgcolor: alpha(color, 0.08),
        borderColor: alpha(color, 0.26),
        color,
        fontWeight: 800,
        "& .MuiChip-icon": { color },
      }}
    />
  );
};

const StatTile = ({ icon, label, value, tone = "primary" }) => {
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
        flex: "1 1 150px",
        minWidth: { xs: 145, sm: 160 },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
            {value}
          </Typography>
        </Box>
        <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: alpha(color, 0.12), color }}>
          {icon}
        </Avatar>
      </Stack>
    </Paper>
  );
};

const EmptyStage = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        textAlign: "center",
        bgcolor: theme.palette.background.default,
        border: `1px dashed ${theme.palette.divider}`,
      }}
    >
      <ViewKanbanRounded color="disabled" />
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
        No prospects match this stage.
      </Typography>
    </Box>
  );
};

const ProspectCard = ({ prospect, stageColor, onDetails }) => {
  const theme = useTheme();
  const firstPerson = prospect?.concern_persons?.[0];
  const activity = prospect?.activity_summary || {};
  const isOpportunity = isTrue(prospect.is_opportunity);
  const source = prospect.information_source?.information_source_name || "No source";
  const industry = prospect.industry_type?.industry_type_name || "No industry";
  const interest = prospect.interested_for?.product_name || "No interest set";
  const zone = prospect.zone?.zone_name || "No zone";

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        borderColor: theme.palette.divider,
        overflow: "visible",
        transition: "border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(stageColor, 0.45),
          boxShadow: theme.shadows[3],
        },
      }}
    >
      <CardContent sx={{ p: 1.75, pb: 1.5 }}>
        <Stack spacing={1.35}>
          <Stack direction="row" alignItems="flex-start" spacing={1.25}>
            <Avatar
              variant="rounded"
              sx={{ bgcolor: alpha(stageColor, 0.12), color: stageColor, width: 42, height: 42, fontWeight: 900 }}
            >
              {getInitials(prospect.prospect_name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                  {prospect.prospect_name || "Untitled prospect"}
                </Typography>
                {isOpportunity && (
                  <Tooltip title="Qualified opportunity">
                    <Box component="img" src={opportunity} alt="Opportunity" sx={{ width: 18, height: 18, flexShrink: 0 }} />
                  </Tooltip>
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Prospect #{prospect.id} | {source}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={industry} icon={<BusinessRounded />} sx={{ fontWeight: 800 }} />
            <Chip size="small" label={interest} variant="outlined" sx={{ fontWeight: 800 }} />
          </Stack>

          {prospect.address && (
            <Stack direction="row" spacing={0.75} alignItems="flex-start">
              <MapRounded fontSize="small" sx={{ color: theme.palette.text.secondary, mt: 0.15 }} />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {prospect.address}
              </Typography>
            </Stack>
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <Paper elevation={0} sx={{ p: 1, borderRadius: 1.5, bgcolor: theme.palette.background.default, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                Zone
              </Typography>
              <Typography variant="body2" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                {zone}
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 1, borderRadius: 1.5, bgcolor: theme.palette.background.default, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                Last Activity
              </Typography>
              <Typography variant="body2" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                {formatDate(prospect.last_activity)}
              </Typography>
            </Paper>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(stageColor, 0.06),
              border: `1px solid ${alpha(stageColor, 0.18)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
              <Avatar
                src={firstPerson?.photo ? `${base_url}/storage/${firstPerson.photo}` : undefined}
                sx={{ width: 30, height: 30, bgcolor: alpha(stageColor, 0.16), color: stageColor, fontSize: 13, fontWeight: 900 }}
              >
                {getInitials(firstPerson?.person_name)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                  Initial Contact
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                  {firstPerson?.person_name || "No contact person"}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {ACTIVITY_TYPES.map((item) => (
              <ActivityChip key={item.type} type={item.type} icon={item.icon} label={item.label} count={activity[item.type]} />
            ))}
          </Stack>

          {(prospect.website_link || prospect.linkedin_link) && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {prospect.website_link && (
                <Chip
                  size="small"
                  icon={<LanguageRounded />}
                  label="Website"
                  clickable
                  component={Link}
                  href={ensureUrl(prospect.website_link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontWeight: 800 }}
                />
              )}
              {prospect.linkedin_link && (
                <Chip
                  size="small"
                  icon={<LinkedIn />}
                  label="LinkedIn"
                  clickable
                  component={Link}
                  href={ensureUrl(prospect.linkedin_link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontWeight: 800 }}
                />
              )}
            </Stack>
          )}

          <Button
            variant="contained"
            fullWidth
            endIcon={<OpenInNewRounded />}
            onClick={() => onDetails(prospect.id)}
            sx={{ borderRadius: 2, fontWeight: 900 }}
          >
            View Details
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

const ProspectListByStage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [prospects, setProspects] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [infoSourceFilter, setInfoSourceFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [opportunityFilter, setOpportunityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("last_activity_desc");
  const [showEmptyStages, setShowEmptyStages] = useState(true);

  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const loadProspects = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [pRes, sRes] = await Promise.all([fetchAllProspectByStage(), getProspectAllStatus()]);
      setProspects(pRes?.data || {});
      setStatuses(sRes?.data || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Prospect pipeline could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProspects();
  }, []);

  const allProspects = useMemo(() => flattenProspects(prospects), [prospects]);

  const boardStages = useMemo(() => {
    if (statuses.length) return statuses;
    return Object.keys(prospects || {}).map((stageName, index) => ({ id: stageName || index, stage_name: stageName }));
  }, [prospects, statuses]);

  const infoSources = useMemo(() => {
    const map = new Map();
    allProspects.forEach((prospect) => {
      const id = prospect?.information_source_id ?? prospect?.information_source?.id;
      const name =
        prospect?.information_source?.information_source_name ??
        prospect?.information_source_name ??
        (id != null ? `Source ${id}` : null);
      if (id != null && name) map.set(String(id), name);
    });
    return [{ id: "all", name: "All sources" }, ...Array.from(map, ([id, name]) => ({ id, name }))];
  }, [allProspects]);

  const filteredMap = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sourceId = String(infoSourceFilter);
    const next = {};

    Object.keys(prospects || {}).forEach((stageName) => {
      next[stageName] = sortProspects(
        (prospects[stageName] || []).filter((prospect) => {
          const prospectSourceId = String(prospect?.information_source_id ?? prospect?.information_source?.id ?? "");
          if (sourceId !== "all" && prospectSourceId !== sourceId) return false;
          if (stageFilter !== "all" && stageName !== stageFilter) return false;
          if (opportunityFilter === "opportunities" && !isTrue(prospect.is_opportunity)) return false;
          if (opportunityFilter === "leads" && isTrue(prospect.is_opportunity)) return false;

          if (!query) return true;
          const haystack = [
            prospect?.prospect_name,
            prospect?.address,
            prospect?.industry_type?.industry_type_name,
            prospect?.interested_for?.product_name,
            prospect?.information_source?.information_source_name,
            prospect?.zone?.zone_name,
            prospect?.concern_persons?.map((person) => person.person_name).join(" "),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        }),
        sortBy
      );
    });

    return next;
  }, [infoSourceFilter, opportunityFilter, prospects, searchQuery, sortBy, stageFilter]);

  const visibleProspects = useMemo(() => flattenProspects(filteredMap), [filteredMap]);
  const totalOpportunities = allProspects.filter((prospect) => isTrue(prospect.is_opportunity)).length;
  const noActivityCount = allProspects.filter((prospect) => !prospect.last_activity).length;
  const topStage = useMemo(() => {
    const entries = boardStages.map((stage) => ({
      name: stage.stage_name,
      count: filteredMap[stage.stage_name]?.length || 0,
    }));
    return entries.sort((a, b) => b.count - a.count)[0];
  }, [boardStages, filteredMap]);

  const visibleStages = boardStages.filter((stage) => {
    const list = filteredMap[stage.stage_name] || [];
    if (stageFilter !== "all" && stage.stage_name !== stageFilter) return false;
    return showEmptyStages || list.length > 0;
  });

  const handleDetails = (id) => navigate(`/prospect-detail/${id}`);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", lg: "center" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <ViewKanbanRounded />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1 }}>
              Prospect Pipeline
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Smart stage board for leads, opportunities, contacts, activity, and next actions.
            </Typography>
          </Box>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => navigate("/add-prospect")} sx={{ borderRadius: 2, fontWeight: 900 }}>
            Add Prospect
          </Button>
          <Button variant="outlined" startIcon={<TableRowsRounded />} onClick={() => navigate("/prospect-list")} sx={{ borderRadius: 2, fontWeight: 900 }}>
            Table View
          </Button>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshRounded />}
            disabled={refreshing || loading}
            onClick={() => loadProspects({ silent: true })}
            sx={{ borderRadius: 2, fontWeight: 900 }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mb: 2.5 }}>
        <StatTile icon={<BusinessRounded />} label="Total Prospects" value={allProspects.length} />
        <StatTile icon={<SearchRounded />} label="Visible" value={visibleProspects.length} tone="info" />
        <StatTile icon={<StarRounded />} label="Opportunities" value={totalOpportunities} tone="success" />
        <StatTile icon={<TimelineRounded />} label="Top Stage" value={topStage?.count || 0} tone="warning" />
        <StatTile icon={<TrendingUpRounded />} label="No Activity" value={noActivityCount} tone="error" />
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          mb: 2.5,
        }}
      >
        <Stack direction={{ xs: "column", xl: "row" }} spacing={1.5} alignItems={{ xs: "stretch", xl: "center" }}>
          <TextField
            size="small"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search prospects, contact, address, source, product"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 210 } }}>
            <InputLabel id="stage-filter-label">Stage</InputLabel>
            <Select labelId="stage-filter-label" label="Stage" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
              <MenuItem value="all">All stages</MenuItem>
              {boardStages.map((stage) => (
                <MenuItem key={stage.id} value={stage.stage_name}>
                  {stage.stage_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 210 } }}>
            <InputLabel id="source-filter-label">Source</InputLabel>
            <Select labelId="source-filter-label" label="Source" value={infoSourceFilter} onChange={(event) => setInfoSourceFilter(event.target.value)}>
              {infoSources.map((source) => (
                <MenuItem key={source.id} value={source.id}>
                  {source.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 190 } }}>
            <InputLabel id="opportunity-filter-label">Type</InputLabel>
            <Select labelId="opportunity-filter-label" label="Type" value={opportunityFilter} onChange={(event) => setOpportunityFilter(event.target.value)}>
              <MenuItem value="all">All records</MenuItem>
              <MenuItem value="opportunities">Opportunities only</MenuItem>
              <MenuItem value="leads">Leads only</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", xl: 180 } }}>
            <InputLabel id="sort-label">Sort</InputLabel>
            <Select labelId="sort-label" label="Sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Switch checked={showEmptyStages} onChange={(event) => setShowEmptyStages(event.target.checked)} />}
            label="Show empty"
            sx={{ whiteSpace: "nowrap", color: theme.palette.text.secondary }}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<FilterAltRounded />}
            clickable
            label="All stages"
            color={stageFilter === "all" ? "primary" : "default"}
            variant={stageFilter === "all" ? "filled" : "outlined"}
            onClick={() => setStageFilter("all")}
            sx={{ fontWeight: 800 }}
          />
          {boardStages.map((stage) => {
            const count = filteredMap[stage.stage_name]?.length || 0;
            return (
              <Chip
                key={stage.id}
                clickable
                label={`${stage.stage_name} (${count})`}
                color={stageFilter === stage.stage_name ? "primary" : "default"}
                variant={stageFilter === stage.stage_name ? "filled" : "outlined"}
                onClick={() => setStageFilter(stage.stage_name)}
                sx={{ fontWeight: 800 }}
              />
            );
          })}
        </Stack>
      </Paper>

      {loading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(auto-fit, minmax(280px, 1fr))", xl: "repeat(auto-fit, minmax(300px, 1fr))" },
            gap: 1.5,
            width: "100%",
          }}
        >
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} variant="rounded" height={620} sx={{ width: "100%", minWidth: 0 }} />
          ))}
        </Box>
      ) : visibleStages.length ? (
        <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden", pb: 1.5 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(auto-fit, minmax(280px, 1fr))", xl: "repeat(auto-fit, minmax(300px, 1fr))" },
              gap: 1.5,
              alignItems: "start",
              width: "100%",
            }}
          >
            {visibleStages.map((status) => {
              const list = filteredMap[status.stage_name] || [];
              const originalCount = prospects[status.stage_name]?.length || 0;
              const stageColor = getStageColor(theme, status.color_code);
              const progressValue = allProspects.length ? Math.round((originalCount / allProspects.length) * 100) : 0;

              return (
                <Paper
                  key={status.id}
                  elevation={0}
                  sx={{
                    width: "100%",
                    minWidth: 0,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ p: 1.5, borderTop: `4px solid ${stageColor}` }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                          {status.stage_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {list.length} visible | {originalCount} total
                        </Typography>
                      </Box>
                      <Chip label={list.length} sx={{ bgcolor: alpha(stageColor, 0.12), color: stageColor, fontWeight: 900 }} />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progressValue}
                      sx={{
                        height: 6,
                        borderRadius: 999,
                        bgcolor: alpha(stageColor, 0.12),
                        "& .MuiLinearProgress-bar": { bgcolor: stageColor },
                      }}
                    />
                  </Box>
                  <Divider />
                  <Stack spacing={1.25} sx={{ p: 1.25, maxHeight: { xs: "none", lg: "calc(100vh - 405px)" }, overflowY: { xs: "visible", lg: "auto" } }}>
                    {list.length ? (
                      list.map((prospect) => (
                        <ProspectCard key={prospect.id} prospect={prospect} stageColor={stageColor} onDetails={handleDetails} />
                      ))
                    ) : (
                      <EmptyStage />
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: theme.palette.background.paper,
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <SourceRounded color="disabled" />
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900, mt: 1 }}>
            No prospects found
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Try clearing filters or adding a new prospect.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ProspectListByStage;
