import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Header } from "../../../components";
import { tokens } from "../../../theme";
import { getAllUserTrack } from "../../../api/controller/admin_controller/user_controller";

const TYPE_OPTIONS = [
  { label: "All types", value: "" },
  { label: "Auth", value: "auth" },
  { label: "Activity", value: "activity" },
  { label: "System", value: "system" },
];

const DEFAULT_PAGE_SIZE = 25;

const UserActivityList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // table state
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(0); // DataGrid is 0-based, API is 1-based
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // filters
  const [searchText, setSearchText] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // for manual refresh
  const [reloadKey, setReloadKey] = useState(0);

  const columns = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
        flex: 0.3,
       
        headerAlign: "center",
        align: "center",
      },
      {
        field: "name",
        headerName: "User",
        flex: 0.9,
        
        valueGetter: (params) => params.row.user?.name || "—",
      },
      
      {
        field: "activity_name",
        headerName: "Activity",
        flex: 0.9,
       
      },

      {
        field: "details",
        headerName: "Details",
        flex: 1.4,
       
        valueGetter: (p) => p.row.details || "—",
      },
     
     
     
      {
        field: "created_at",
        headerName: "Time",
        flex: 1,
       
        valueGetter: (params) => {
          const v = params.row.created_at;
          return v ? new Date(v).toLocaleString() : "—";
        },
      },
    ],
    []
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Try passing common query params. If your controller uses a different shape,
      // adapt here (or adjust inside getAllUserTrack).
      const query = {
        page: page + 1,                // API usually 1-based
        per_page: pageSize,            // common param name
        search: searchText || undefined,
        type: type || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };

      const res = await getAllUserTrack(query);

      // Support the paginated shape from your sample
      const apiData = res?.data ?? res; // some controllers wrap/unwarp
      const collection = apiData?.data?.data || apiData?.data || [];
      const currentPage = apiData?.data?.current_page ?? apiData?.current_page ?? (page + 1);
      const total = apiData?.data?.total ?? apiData?.total ?? collection.length;

      setRows(Array.isArray(collection) ? collection : []);
      setRowCount(Number.isFinite(total) ? total : collection.length);

      // If API returned a different current page (edge cases), sync our state
      if (currentPage !== page + 1) {
        setPage(Math.max(0, currentPage - 1));
      }
    } catch (e) {
      console.error("getAllUserTrack failed:", e);
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchText, type, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData, reloadKey]);

  // quick reset filters
  const clearFilters = () => {
    setSearchText("");
    setType("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="User Activity Track" subtitle="Monitor logins and actions across the system" />
      </Box>

      {/* Filters */}
      <Box
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems="center">
          <TextField
            size="small"
            label="Search (name, email, activity, details)"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 260 }}
          />
          <TextField
            select
            size="small"
            label="Type"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            {TYPE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(0);
            }}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(0);
            }}
          />
          <Box flex={1} />
          <Button variant="outlined" onClick={() => setReloadKey((k) => k + 1)}>
            Refresh
          </Button>
          <Button variant="text" onClick={clearFilters} sx={{ ml: { xs: 0, md: 1 } }}>
            Clear
          </Button>
        </Stack>
      </Box>

      {/* Table */}
      <Box
        height="75vh"
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 2,
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: `1px solid ${theme.palette.divider}` },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.gray[10],
            fontSize: 14,
            fontWeight: 800,
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[800] },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: colors.gray[10],
            borderTop: `1px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.gray[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={rows}
          getRowId={(r) => r.id}
          columns={columns}
          loading={loading}
          // built-in toolbar (export/columns/filters if you want)
          components={{ Toolbar: GridToolbar }}
          // server-like pagination
          paginationMode="server"
          rowCount={rowCount}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: DEFAULT_PAGE_SIZE } },
            columns: { columnVisibilityModel: { ip_address: true, url: true, method: true } },
          }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Small legend */}
      <Typography variant="caption" sx={{ mt: 1.5, display: "block", color: "text.secondary" }}>
        Tip: Use the search box to match by user name, email, activity, or details. Use the date range to narrow results.
      </Typography>
    </Box>
  );
};

export default UserActivityList;
