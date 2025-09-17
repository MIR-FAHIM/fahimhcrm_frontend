// MyVisits.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
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
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EventIcon from "@mui/icons-material/Event";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

// 👉 Import your controller function
import { getEmpVisit } from "../../../api/controller/admin_controller/visit_controller";

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

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");     // Scheduled / Started / Completed …
  const [typeFilter, setTypeFilter] = useState("all");         // Planned / Ad-hoc …
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "error" });

  const userID = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    (async () => {
      if (!userID) {
        setSnack({ open: true, msg: "No user ID found.", sev: "error" });
        return;
      }
      setLoading(true);
      try {
        const res = await getEmpVisit(userID);
        const list = Array.isArray(res?.data) ? res.data : [];
        setRows(list);
      } catch (e) {
        console.error(e);
        setSnack({ open: true, msg: "Failed to load visits.", sev: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [userID]);

  // Build unique filter options from data
  const allStatuses = useMemo(
    () => ["all", ...Array.from(new Set(rows.map((r) => r?.status).filter(Boolean)))],
    [rows]
  );
  const allTypes = useMemo(
    () => ["all", ...Array.from(new Set(rows.map((r) => r?.visit_type).filter(Boolean)))],
    [rows]
  );

  // Apply filters + search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r?.status !== statusFilter) return false;
      if (typeFilter !== "all" && r?.visit_type !== typeFilter) return false;

      if (!q) return true;
      const hay = [
        r?.purpose,
        r?.note,
        r?.status,
        r?.visit_type,
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
          <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1 }}>
            My Visits
          </Typography>

          {/* Search */}
          <TextField
            size="small"
            placeholder="Search visits…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: { xs: 200, sm: 260 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Filters */}
          <Stack direction="row" spacing={1} sx={{ minWidth: { xs: "100%", md: "auto" } }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
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

            <FormControl size="small" sx={{ minWidth: 140 }}>
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

        {/* Table */}
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table stickyHeader size="small" aria-label="my visits table">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Lead / Zone</TableCell>
                <TableCell>Purpose & Note</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Planner</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              )}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No visits found.
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filtered.map((v) => (
                  <TableRow key={v.id} hover>
                    {/* When */}
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
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography variant="body2" fontWeight={600} noWrap title={v.purpose}>
                        {v.purpose || "—"}
                      </Typography>
                      {v.note && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          title={v.note}
                        >
                          {v.note}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={v.status || "—"}
                        color={statusChipColor(v.status)}
                        variant="outlined"
                      />
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={v.visit_type || "—"}
                        color={typeChipColor(v.visit_type)}
                        variant="outlined"
                      />
                    </TableCell>

                    {/* Planner */}
                    <TableCell>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <WorkHistoryIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2">{v.planner?.name || "—"}</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
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
