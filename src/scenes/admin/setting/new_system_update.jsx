// NewSystemUpdate.jsx
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArticleIcon from "@mui/icons-material/Article";
import CategoryIcon from "@mui/icons-material/Category";
import EventIcon from "@mui/icons-material/Event";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import SearchIcon from "@mui/icons-material/Search";
import TimelineIcon from "@mui/icons-material/Timeline";

import updates from "./new_system_update.json";

const formatDate = (value) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("MMM D, YYYY") : value || "No date";
};

const UpdateStat = ({ icon, label, value, helper, tone = "primary" }) => {
  const theme = useTheme();
  const color = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        flex: "1 1 170px",
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="space-between">
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1.1 }}>
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

const UpdateCard = ({ item, index }) => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(brand, 0.45),
          boxShadow: theme.shadows[3],
        },
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand, fontWeight: 900 }}>
            {index + 1}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1.15 }}>
              {item.title}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
              <Chip size="small" icon={<CategoryIcon />} label={item.feature} sx={{ fontWeight: 850, bgcolor: alpha(brand, 0.1), color: brand }} />
              <Chip size="small" icon={<EventIcon />} label={formatDate(item.published_date)} variant="outlined" sx={{ fontWeight: 850 }} />
            </Stack>
          </Box>
        </Stack>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.65,
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.details}
        </Typography>
      </Stack>
    </Paper>
  );
};

const NewSystemUpdate = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const [query, setQuery] = useState("");
  const [featureFilter, setFeatureFilter] = useState("all");

  const sortedUpdates = useMemo(
    () => [...updates].sort((a, b) => dayjs(b.published_date).valueOf() - dayjs(a.published_date).valueOf()),
    []
  );

  const features = useMemo(() => ["all", ...Array.from(new Set(sortedUpdates.map((item) => item.feature)))], [sortedUpdates]);

  const filteredUpdates = useMemo(() => {
    const search = query.trim().toLowerCase();
    return sortedUpdates.filter((item) => {
      const featureMatch = featureFilter === "all" || item.feature === featureFilter;
      const searchMatch = !search || [item.title, item.feature, item.details, item.published_date].join(" ").toLowerCase().includes(search);
      return featureMatch && searchMatch;
    });
  }, [featureFilter, query, sortedUpdates]);

  const latest = sortedUpdates[0];
  const latestDate = latest?.published_date;
  const latestCount = sortedUpdates.filter((item) => item.published_date === latestDate).length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", lg: "center" }} spacing={2} sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <NewReleasesIcon />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1 }}>
              New System Updates
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Recent project improvements, feature updates, and UI upgrades in one place.
            </Typography>
          </Box>
        </Stack>
        <Chip icon={<EventIcon />} label={`Latest: ${formatDate(latestDate)}`} sx={{ alignSelf: { xs: "flex-start", lg: "center" }, fontWeight: 900, bgcolor: alpha(brand, 0.1), color: brand }} />
      </Stack>

      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mb: 2.5 }}>
        <UpdateStat icon={<ArticleIcon />} label="Total Updates" value={sortedUpdates.length} helper="Published notes" />
        <UpdateStat icon={<TimelineIcon />} label="Latest Batch" value={latestCount} helper={formatDate(latestDate)} tone="info" />
        <UpdateStat icon={<CategoryIcon />} label="Feature Areas" value={features.length - 1} helper="Grouped by feature" tone="success" />
        <UpdateStat icon={<SearchIcon />} label="Visible" value={filteredUpdates.length} helper="After filters" tone="warning" />
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
          <TextField
            size="small"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search update title, feature, details, or date"
            sx={{ flex: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
            <InputLabel>Feature</InputLabel>
            <Select label="Feature" value={featureFilter} onChange={(event) => setFeatureFilter(event.target.value)}>
              {features.map((feature) => (
                <MenuItem key={feature} value={feature}>{feature === "all" ? "All features" : feature}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {features.map((feature) => {
            const count = feature === "all" ? sortedUpdates.length : sortedUpdates.filter((item) => item.feature === feature).length;
            const selected = featureFilter === feature;
            return (
              <Chip
                key={feature}
                clickable
                label={`${feature === "all" ? "All" : feature} (${count})`}
                color={selected ? "primary" : "default"}
                variant={selected ? "filled" : "outlined"}
                onClick={() => setFeatureFilter(feature)}
                sx={{ fontWeight: 850 }}
              />
            );
          })}
        </Stack>
      </Paper>

      {filteredUpdates.length ? (
        <Stack spacing={1.5}>
          {filteredUpdates.map((item, index) => <UpdateCard key={item.id} item={item} index={index} />)}
        </Stack>
      ) : (
        <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px dashed ${theme.palette.divider}` }}>
          <NewReleasesIcon color="disabled" sx={{ fontSize: 42 }} />
          <Typography variant="h6" sx={{ mt: 1, color: theme.palette.text.primary, fontWeight: 900 }}>
            No updates found
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Try another feature filter or search term.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default NewSystemUpdate;