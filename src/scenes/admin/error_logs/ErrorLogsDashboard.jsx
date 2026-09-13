import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress,
  Pagination,
  Stack,
  useTheme,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  DeleteSweep as DeleteSweepIcon,
  Visibility as EyeIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  BugReport as BugIcon,
  Close as CloseIcon,
  FilterAlt as FilterIcon,
  Computer as SystemIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Http as HttpIcon,
  Code as CodeIcon,
  DataObject as JsonIcon,
  InfoOutlined as InfoIcon,
  Terminal as TerminalIcon,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import {
  getErrorLogs,
  getErrorLogDetails,
  toggleResolveErrorLog,
  deleteErrorLog,
  clearErrorLogs,
} from "../../../api/controller/admin_controller/error_logs_controller";

const ErrorLogsDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";

  // Data & Pagination States
  const [logs, setLogs] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    total_errors: 0,
    unresolved_errors: 0,
    server_errors_500: 0,
    client_errors_400: 0,
  });
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusCodeFilter, setStatusCodeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [resolvedFilter, setResolvedFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Auto-refresh States (10s polling)
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Drawer / Side Modal States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Dialog & Confirmation States
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearType, setClearType] = useState("resolved"); // 'resolved' or 'all'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Toast / Feedback States
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [copiedTrace, setCopiedTrace] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch logs function
  const fetchLogs = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
        const params = {
          search: debouncedSearch,
          status_code: statusCodeFilter,
          method: methodFilter,
          is_resolved: resolvedFilter,
          start_date: startDate,
          end_date: endDate,
          page,
          per_page: perPage,
        };
        const response = await getErrorLogs(params);
        if (response && response.status === "success") {
          setLogs(response.data || []);
          if (response.summary) setSummaryStats(response.summary);
          if (response.meta) setMeta(response.meta);
        }
      } catch (err) {
        setToast({
          open: true,
          message: err.message || "Failed to load error logs",
          severity: "error",
        });
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [debouncedSearch, statusCodeFilter, methodFilter, resolvedFilter, startDate, endDate, page, perPage]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-polling effect (10s timer)
  useEffect(() => {
    let timer = null;
    let countdownInterval = null;

    if (autoRefresh) {
      setCountdown(10);
      countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev > 1 ? prev - 1 : 10));
      }, 1000);

      timer = setInterval(() => {
        fetchLogs(false);
      }, 10000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [autoRefresh, fetchLogs]);

  // Toggle Is Resolved Status
  const handleToggleResolve = async (id, currentStatus, e) => {
    if (e) e.stopPropagation();
    const nextStatus = !currentStatus;
    
    // Optimistic UI update
    setLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, is_resolved: nextStatus } : log))
    );
    if (selectedLog && selectedLog.id === id) {
      setSelectedLog((prev) => ({ ...prev, is_resolved: nextStatus }));
    }

    try {
      await toggleResolveErrorLog(id, nextStatus);
      setToast({
        open: true,
        message: `Log #${id} marked as ${nextStatus ? "Resolved" : "Unresolved"}.`,
        severity: "success",
      });
      // Silent refresh summary stats
      fetchLogs(false);
    } catch (err) {
      // Rollback on failure
      setLogs((prev) =>
        prev.map((log) => (log.id === id ? { ...log, is_resolved: currentStatus } : log))
      );
      setToast({ open: true, message: err.message || "Failed to update status", severity: "error" });
    }
  };

  // Open Log Details Drawer
  const handleOpenDetails = async (logItem) => {
    setSelectedLog(logItem);
    setDrawerOpen(true);
    setActiveTab(0);
    setDetailLoading(true);

    try {
      const details = await getErrorLogDetails(logItem.id);
      if (details && details.data) {
        setSelectedLog(details.data);
      }
    } catch (err) {
      console.error("Error fetching detail payload:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Delete Log Action
  const handleDeleteLog = async (id) => {
    try {
      await deleteErrorLog(id);
      setToast({ open: true, message: "Error log deleted successfully.", severity: "success" });
      if (drawerOpen && selectedLog?.id === id) {
        setDrawerOpen(false);
      }
      fetchLogs();
    } catch (err) {
      setToast({ open: true, message: err.message || "Failed to delete log", severity: "error" });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Bulk Clear Logs Action
  const handleBulkClear = async () => {
    try {
      await clearErrorLogs(clearType);
      setToast({
        open: true,
        message: `Successfully cleared ${clearType === "resolved" ? "resolved" : "all"} error logs.`,
        severity: "success",
      });
      setConfirmClearOpen(false);
      fetchLogs();
    } catch (err) {
      setToast({ open: true, message: err.message || "Failed to clear logs", severity: "error" });
    }
  };

  // Copy Stack Trace helper
  const handleCopyStackTrace = () => {
    if (selectedLog?.stack_trace) {
      navigator.clipboard.writeText(selectedLog.stack_trace);
      setCopiedTrace(true);
      setTimeout(() => setCopiedTrace(false), 2000);
    }
  };

  // Copy Payload JSON helper
  const handleCopyPayload = () => {
    if (selectedLog?.request_data) {
      navigator.clipboard.writeText(JSON.stringify(selectedLog.request_data, null, 2));
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  // Status code color helper
  const getStatusBadgeStyle = (statusCode) => {
    const code = parseInt(statusCode, 10);
    if (code >= 500) {
      return {
        bg: isDark ? "rgba(239, 71, 111, 0.2)" : "#FFE9ED",
        color: isDark ? "#F06B88" : "#C0264B",
        border: "1px solid rgba(239, 71, 111, 0.4)",
      };
    } else if (code >= 400) {
      return {
        bg: isDark ? "rgba(255, 159, 28, 0.2)" : "#FFF7E6",
        color: isDark ? "#FFB347" : "#E67E00",
        border: "1px solid rgba(255, 159, 28, 0.4)",
      };
    } else {
      return {
        bg: isDark ? "rgba(46, 196, 182, 0.2)" : "#EAFBF8",
        color: isDark ? "#6BD0B4" : "#229A8F",
        border: "1px solid rgba(46, 196, 182, 0.4)",
      };
    }
  };

  // HTTP Method Chip color helper
  const getMethodBadgeStyle = (method) => {
    const m = (method || "").toUpperCase();
    switch (m) {
      case "POST":
        return { bg: "#2E7D32", color: "#FFF" };
      case "GET":
        return { bg: "#0288D1", color: "#FFF" };
      case "PUT":
        return { bg: "#7B1FA2", color: "#FFF" };
      case "DELETE":
        return { bg: "#D32F2F", color: "#FFF" };
      case "PATCH":
        return { bg: "#ED6C02", color: "#FFF" };
      default:
        return { bg: "#616161", color: "#FFF" };
    }
  };

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: "100%", maxWidth: 1600, margin: "0 auto" }}>
      {/* Top Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 750, color: theme.palette.text.primary, display: "flex", alignItems: "center", gap: 1.5 }}>
            <BugIcon sx={{ fontSize: 32, color: theme.palette.error.main }} />
            API Error Logs Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
            Monitor, inspect, and resolve REST API application exceptions and runtime failures in real-time.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Auto-Refresh {autoRefresh ? `(${countdown}s)` : ""}
              </Typography>
            }
          />

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchLogs(true)}
            size="small"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={() => {
              setClearType("resolved");
              setConfirmClearOpen(true);
            }}
            size="small"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Clear Logs
          </Button>
        </Stack>
      </Box>

      {/* Metric Cards Header */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Total Errors */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="caption" sx={{ textTransform: "uppercase", fontWeight: 700, color: theme.palette.text.secondary, letterSpacing: 0.5 }}>
                  Total Errors
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.8, color: theme.palette.text.primary }}>
                  {summaryStats.total_errors}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2.5,
                  backgroundColor: isDark ? "rgba(58, 134, 255, 0.15)" : "#EAF2FF",
                  color: theme.palette.blueAccent?.main || "#3A86FF",
                }}
              >
                <InfoIcon sx={{ fontSize: 28 }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Unresolved Errors (Warning Red/Orange badge) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${isDark ? "rgba(255, 159, 28, 0.3)" : "#FFE5C2"}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(255,159,28,0.15)" },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="caption" sx={{ textTransform: "uppercase", fontWeight: 700, color: theme.palette.warning.main, letterSpacing: 0.5 }}>
                  Unresolved Errors
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.8, color: theme.palette.warning.main }}>
                  {summaryStats.unresolved_errors}
                </Typography>
              </Box>
              <Chip
                label="Action Required"
                size="small"
                sx={{
                  backgroundColor: isDark ? "rgba(255, 159, 28, 0.2)" : "#FFE5C2",
                  color: isDark ? "#FFB347" : "#E67E00",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* 500 Server Errors (Crimson Red badge) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${isDark ? "rgba(239, 71, 111, 0.3)" : "#F9C5D0"}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(239,71,111,0.15)" },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="caption" sx={{ textTransform: "uppercase", fontWeight: 700, color: theme.palette.error.main, letterSpacing: 0.5 }}>
                  5xx Server Errors
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.8, color: theme.palette.error.main }}>
                  {summaryStats.server_errors_500}
                </Typography>
              </Box>
              <Chip
                label="5xx Critical"
                size="small"
                sx={{
                  backgroundColor: isDark ? "rgba(239, 71, 111, 0.2)" : "#FFE9ED",
                  color: isDark ? "#F06B88" : "#C0264B",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* 4xx Client Errors (Amber Yellow badge) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="caption" sx={{ textTransform: "uppercase", fontWeight: 700, color: theme.palette.text.secondary, letterSpacing: 0.5 }}>
                  4xx Client Errors
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.8, color: theme.palette.text.primary }}>
                  {summaryStats.client_errors_400}
                </Typography>
              </Box>
              <Chip
                label="4xx Client"
                size="small"
                sx={{
                  backgroundColor: isDark ? "rgba(255, 179, 71, 0.15)" : "#FFF3E0",
                  color: "#FB8C00",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Search Bar Container */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Input */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search URL, Error Message, Exception..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchInput("")}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          {/* Status Code Dropdown */}
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Code</InputLabel>
              <Select
                value={statusCodeFilter}
                label="Status Code"
                onChange={(e) => {
                  setStatusCodeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="500">500 Internal Error</MenuItem>
                <MenuItem value="502">502 Bad Gateway</MenuItem>
                <MenuItem value="503">503 Unavailable</MenuItem>
                <MenuItem value="404">404 Not Found</MenuItem>
                <MenuItem value="401">401 Unauthorized</MenuItem>
                <MenuItem value="403">403 Forbidden</MenuItem>
                <MenuItem value="422">422 Unprocessable</MenuItem>
                <MenuItem value="400">400 Bad Request</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* HTTP Method Dropdown */}
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>HTTP Method</InputLabel>
              <Select
                value={methodFilter}
                label="HTTP Method"
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
                <MenuItem value="PATCH">PATCH</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Resolution Status Dropdown */}
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Resolution</InputLabel>
              <Select
                value={resolvedFilter}
                label="Resolution"
                onChange={(e) => {
                  setResolvedFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="all">All Logs</MenuItem>
                <MenuItem value="false">Unresolved Only</MenuItem>
                <MenuItem value="true">Resolved Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Date Range Inputs */}
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Smart Data Table Container */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        {loading && <LinearProgress sx={{ height: 3 }} />}

        <TableContainer>
          <Table sx={{ minWidth: 950 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                <TableCell sx={{ fontWeight: 700, py: 1.8 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.8 }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.8 }}>Endpoint URL</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.8 }}>Exception & Headline</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.8 }}>User / Client</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.8 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.8 }} align="center">Is Resolved</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.8 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 44, color: theme.palette.text.secondary, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                        No Error Logs Found
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Try clearing or resetting your active search filters.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((row) => {
                  const statusStyle = getStatusBadgeStyle(row.status_code);
                  const methodStyle = getMethodBadgeStyle(row.method);

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      onClick={() => handleOpenDetails(row)}
                      sx={{
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                        "&:hover": {
                          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                        },
                      }}
                    >
                      {/* Status Code Pill */}
                      <TableCell sx={{ py: 1.6 }}>
                        <Chip
                          label={row.status_code}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.78rem",
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            border: statusStyle.border,
                            borderRadius: 1.5,
                            px: 0.5,
                          }}
                        />
                      </TableCell>

                      {/* HTTP Method Chip */}
                      <TableCell sx={{ py: 1.6 }}>
                        <Chip
                          label={row.method}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            backgroundColor: methodStyle.bg,
                            color: methodStyle.color,
                            borderRadius: 1.5,
                            px: 0.5,
                          }}
                        />
                      </TableCell>

                      {/* Truncated URL with Tooltip */}
                      <TableCell sx={{ py: 1.6, maxWidth: 220 }}>
                        <Tooltip title={row.url} arrow placement="top">
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: theme.palette.text.primary,
                            }}
                          >
                            {row.url}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* Headline + Exception Class Badge */}
                      <TableCell sx={{ py: 1.6, maxWidth: 280 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: theme.palette.text.primary,
                            }}
                          >
                            {row.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                              color: theme.palette.text.secondary,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {row.exception_class}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* User Column */}
                      <TableCell sx={{ py: 1.6 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {row.user_name || row.user_email || "Guest"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: "monospace" }}>
                          {row.ip_address || "N/A"}
                        </Typography>
                      </TableCell>

                      {/* Timestamp Column */}
                      <TableCell sx={{ py: 1.6, whiteSpace: "nowrap" }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          {formatDate(row.created_at)}
                        </Typography>
                      </TableCell>

                      {/* Interactive Is Resolved Toggle Switch */}
                      <TableCell sx={{ py: 1.6 }} align="center" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          size="small"
                          checked={row.is_resolved}
                          onChange={(e) => handleToggleResolve(row.id, row.is_resolved, e)}
                          color="success"
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={{ py: 1.6 }} align="right" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetails(row);
                              }}
                              sx={{ color: theme.palette.text.secondary, "&:hover": { color: theme.palette.primary.main } }}
                            >
                              <EyeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Log">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(row.id);
                              }}
                              sx={{ color: theme.palette.text.secondary, "&:hover": { color: theme.palette.error.main } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Pagination */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justify: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
              Per Page:
            </Typography>
            <Select
              size="small"
              value={perPage}
              onChange={(e) => {
                setPerPage(e.target.value);
                setPage(1);
              }}
              sx={{ height: 32, fontSize: "0.8rem" }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>

            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, ml: 1 }}>
              Showing {meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1} to{" "}
              {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} logs
            </Typography>
          </Box>

          <Pagination
            count={meta.total_pages || 1}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>
      </Paper>

      {/* Detailed Error Side Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 600, md: 720 },
            backgroundColor: theme.palette.background.paper,
            p: 0,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {selectedLog && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Drawer Header */}
            <Box
              sx={{
                p: 2.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Chip
                  label={selectedLog.status_code}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    ...getStatusBadgeStyle(selectedLog.status_code),
                  }}
                />
                <Chip
                  label={selectedLog.method}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    ...getMethodBadgeStyle(selectedLog.method),
                  }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                  {selectedLog.id}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={selectedLog.is_resolved}
                      onChange={(e) => handleToggleResolve(selectedLog.id, selectedLog.is_resolved, e)}
                      color="success"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 700, color: selectedLog.is_resolved ? theme.palette.success.main : theme.palette.warning.main }}>
                      {selectedLog.is_resolved ? "Resolved" : "Unresolved"}
                    </Typography>
                  }
                />
                <IconButton onClick={() => setDrawerOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Error Class & Message Alert Banner */}
            <Box sx={{ px: 3, pt: 2.5 }}>
              <Alert
                severity={parseInt(selectedLog.status_code, 10) >= 500 ? "error" : "warning"}
                icon={<ErrorIcon />}
                sx={{ borderRadius: 2 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                  {selectedLog.exception_class}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                  {selectedLog.message}
                </Typography>
              </Alert>
            </Box>

            {/* Tab Navigation Header */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3, mt: 1 }}>
              <Tabs
                value={activeTab}
                onChange={(e, val) => setActiveTab(val)}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab icon={<InfoIcon fontSize="small" />} iconPosition="start" label="Overview" />
                <Tab icon={<TerminalIcon fontSize="small" />} iconPosition="start" label="Stack Trace" />
                <Tab icon={<JsonIcon fontSize="small" />} iconPosition="start" label="Request Body Payload" />
              </Tabs>
            </Box>

            {/* Drawer Body Content */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
              {detailLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 0 && (
                    <Grid container spacing={2.5}>
                      <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, textTransform: "uppercase" }}>
                            Target Endpoint URL
                          </Typography>
                          <Typography variant="body1" sx={{ fontFamily: "monospace", fontWeight: 700, mt: 0.5, wordBreak: "break-all" }}>
                            {selectedLog.url}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, textTransform: "uppercase" }}>
                            User Account
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                            {selectedLog.user_name || "Anonymous Guest"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block" }}>
                            {selectedLog.user_email || "No email attached"} (ID: {selectedLog.user_id || "N/A"})
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, textTransform: "uppercase" }}>
                            IP Address & Timestamp
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, mt: 0.5 }}>
                            IP: {selectedLog.ip_address || "127.0.0.1"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block" }}>
                            {formatDate(selectedLog.created_at)}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, textTransform: "uppercase" }}>
                            User Agent String
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: "monospace", display: "block", mt: 0.5, wordBreak: "break-all" }}>
                            {selectedLog.user_agent || "Not recorded"}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}

                  {/* TAB 2: FORMATTED STACK TRACE */}
                  {activeTab === 1 && (
                    <Box sx={{ position: "relative" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Multi-Line Stack Trace Log
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          color={copiedTrace ? "success" : "primary"}
                          startIcon={copiedTrace ? <CheckCircleIcon /> : <CopyIcon />}
                          onClick={handleCopyStackTrace}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          {copiedTrace ? "Copied to Clipboard!" : "Copy Stack Trace"}
                        </Button>
                      </Box>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: "#0d1117",
                          color: "#c9d1d9",
                          borderRadius: 2.5,
                          fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                          fontSize: "0.82rem",
                          lineHeight: 1.6,
                          overflowX: "auto",
                          maxHeight: 450,
                          border: "1px solid #30363d",
                        }}
                      >
                        {selectedLog.stack_trace
                          ? selectedLog.stack_trace.split("\n").map((line, idx) => (
                              <Box key={idx} sx={{ display: "flex", gap: 2 }}>
                                <Typography
                                  component="span"
                                  sx={{
                                    userSelect: "none",
                                    color: "#484f58",
                                    textAlign: "right",
                                    minWidth: 28,
                                    fontFamily: "inherit",
                                    fontSize: "inherit",
                                  }}
                                >
                                  {idx + 1}
                                </Typography>
                                <Typography
                                  component="span"
                                  sx={{
                                    fontFamily: "inherit",
                                    fontSize: "inherit",
                                    whiteSpace: "pre",
                                    color: line.includes("Exception") || line.includes("Error") ? "#ff7b72" : line.includes("at app/") ? "#79c0ff" : "#c9d1d9",
                                  }}
                                >
                                  {line}
                                </Typography>
                              </Box>
                            ))
                          : "No stack trace recorded."}
                      </Paper>
                    </Box>
                  )}

                  {/* TAB 3: REQUEST BODY PAYLOAD */}
                  {activeTab === 2 && (
                    <Box sx={{ position: "relative" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Incoming Request Parameters & Payload (JSON)
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          color={copiedPayload ? "success" : "primary"}
                          startIcon={copiedPayload ? <CheckCircleIcon /> : <CopyIcon />}
                          onClick={handleCopyPayload}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          {copiedPayload ? "Copied JSON!" : "Copy JSON"}
                        </Button>
                      </Box>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: "#0d1117",
                          color: "#79c0ff",
                          borderRadius: 2.5,
                          fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                          fontSize: "0.85rem",
                          lineHeight: 1.5,
                          overflowX: "auto",
                          maxHeight: 450,
                          border: "1px solid #30363d",
                        }}
                      >
                        <pre style={{ margin: 0, fontFamily: "inherit" }}>
                          {selectedLog.request_data
                            ? JSON.stringify(selectedLog.request_data, null, 2)
                            : "{} (No request payload parameters)"}
                        </pre>
                      </Paper>
                    </Box>
                  )}
                </>
              )}
            </Box>

            {/* Drawer Footer Actions */}
            <Box
              sx={{
                p: 2.5,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              }}
            >
              <Button
                variant={selectedLog.is_resolved ? "outlined" : "contained"}
                color={selectedLog.is_resolved ? "warning" : "success"}
                startIcon={<CheckCircleIcon />}
                onClick={(e) => handleToggleResolve(selectedLog.id, selectedLog.is_resolved, e)}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                Mark as {selectedLog.is_resolved ? "Unresolved" : "Resolved"}
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteConfirmId(selectedLog.id)}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                Delete Log
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Confirmation Dialog for Bulk Clear */}
      <Dialog open={confirmClearOpen} onClose={() => setConfirmClearOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Bulk Clear Error Logs</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear error logs? Choose whether to delete only resolved logs or purge all logs from the database.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Clear Scope</InputLabel>
              <Select
                value={clearType}
                label="Clear Scope"
                onChange={(e) => setClearType(e.target.value)}
              >
                <MenuItem value="resolved">Clear Only Resolved Logs</MenuItem>
                <MenuItem value="all">Clear ALL Error Logs (Irreversible)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmClearOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleBulkClear}>
            Clear Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Single Delete */}
      <Dialog open={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Error Log</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete error log #{deleteConfirmId}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteLog(deleteConfirmId)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Feedback Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ErrorLogsDashboard;
