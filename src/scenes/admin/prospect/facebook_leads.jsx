import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Box,
  Button,
  Typography,
  useTheme,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { useNavigate } from "react-router-dom";
import { getFacebookLeads } from "../../../api/controller/admin_controller/user_controller";
import { convertToPrsspect, convertContactRowStatusMultipleForFacebook } from "../../../api/controller/admin_controller/prospect_controller";

dayjs.extend(relativeTime);

const StatusChip = ({ status, colors }) => {
  const isConverted = String(status) === "1";
  const label = isConverted ? "Converted" : "New";
  const bg = isConverted ? colors.greenAccent[700] : colors.blueAccent[700];
  const fg = isConverted ? colors.greenAccent[200] : colors.blueAccent[200];
  return <Chip size="small" label={label} sx={{ bgcolor: bg, color: fg }} />;
};

const Toolbar = ({ query, setQuery, onRefresh, colors, selectionCount, filter, setFilter, reports }) => (
  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", p: 1, borderBottom: `1px solid ${colors.gray[700]}` }}>
    <Typography variant="h6" sx={{ fontWeight: 800, color: colors.gray[100] }}>Facebook Leads</Typography>

    <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: { xs: 0, md: 2 } }}>
      <TextField
        size="small"
        placeholder="Search name, email, mobile"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: colors.gray[400] }} /> }}
        sx={{
          minWidth: 260,
          "& .MuiOutlinedInput-root": { bgcolor: "background.default", color: colors.gray[100] },
          "& fieldset": { borderColor: colors.gray[700] },
        }}
      />

      <TextField
        size="small"
        select
        label="Filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        SelectProps={{ native: true }}
        sx={{
          minWidth: 140,
          "& .MuiOutlinedInput-root": { bgcolor: "background.default", color: colors.gray[100] },
          "& fieldset": { borderColor: colors.gray[700] },
        }}
      >
        <option value="all">All</option>
        <option value="new">New</option>
        <option value="converted">Converted</option>
      </TextField>
<Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    gap: 2,
    alignItems: { xs: "flex-start", sm: "center" },
    bgcolor: colors.gray[900],
    px: 2,
    py: 1,
    borderRadius: 2,
    boxShadow: 1,
    minWidth: 340,
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Chip
      label={`Today: ${reports?.today_onboard ?? 0}`}
      color="success"
      sx={{
        fontWeight: 700,
        fontSize: "1rem",
        bgcolor: colors.greenAccent[700],
        color: colors.gray[100],
        px: 2,
        py: 1,
      }}
    />
    <Chip
      label={`Yesterday: ${reports?.yesterday_onboard ?? 0}`}
      color="info"
      sx={{
        fontWeight: 700,
        fontSize: "1rem",
        bgcolor: colors.blueAccent[700],
        color: colors.gray[100],
        px: 2,
        py: 1,
      }}
    />
    <Chip
      label={`Last 7 Days: ${reports?.last_7_days_onboard ?? 0}`}
      color="warning"
      sx={{
        fontWeight: 700,
        fontSize: "1rem",
        bgcolor: colors.orangeAccent[700],
        color: colors.gray[100],
        px: 2,
        py: 1,
      }}
    />
    <Chip
      label={`Last Month: ${reports?.last_1_month_onboard ?? 0}`}
      color="error"
      sx={{
        fontWeight: 700,
        fontSize: "1rem",
        bgcolor: colors.redAccent[700],
        color: colors.gray[100],
        px: 2,
        py: 1,
      }}
    />
  </Box>
</Box>
    </Box>

    <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
      <Tooltip title="Refresh">
        <IconButton onClick={onRefresh} sx={{ color: colors.blueAccent[300] }}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
      <Chip size="small" label={`${selectionCount} selected`} variant="outlined" sx={{ color: colors.gray[300], borderColor: colors.gray[700] }} />
    </Box>
  </Box>
);

const FacebookLeadsTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => { getContactList(); }, []);

  const getContactList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFacebookLeads();
      if (response.status === "success") {
        setLeads(response.data || []);
        setReports(response.report);
      } else {
        setError("Failed to fetch Facebook leads");
      }
    } catch (e) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionModelChange = (newSelectionModel) => {
    setSelectedRows(newSelectionModel);
  };

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = leads;
    if (filter !== "all") {
      list = list.filter((l) => (filter === "converted" ? String(l.status) === "1" : String(l.status) !== "1"));
    }
    if (!q) return list;
    return list.filter((l) => [l.name, l.email, l.mobile, l.note].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [leads, query, filter]);

  const handleConvertToProspect = async () => {
    if (selectedRows.length === 0) return;
    try {
      const selectedLeads = leads.filter((lead) => selectedRows.includes(lead.id));
      const payload = selectedLeads.map((lead) => ({
        prospect_name: lead.name,
        is_individual: true,
        industry_type_id: 2,
        interested_for_id: 1,
        information_source_id: 3,
        stage_id: 1,
        priority_id: 2,
        status: 1,
        is_active: 1,
        type: 'prospect',
        website_link: "https://example.com",
        facebook_page: "https://facebook.com/ridoyfahim",
        linkedin: "https://linkedin.com/in/fahimridoy",
        zone_id: 5,
        latitude: 23.810331,
        longitude: 90.412521,
        address: "Dhaka, Bangladesh",
        note: "Prospect Added from Facebook lead form",
      }));

      const idList = { ids: selectedRows };

      await convertToPrsspect(selectedRows);
 
      await convertContactRowStatusMultipleForFacebook(idList);
      await getContactList();

      setSnack({ open: true, message: `Converted ${selectedRows.length} lead(s)`, severity: "success" });
      setSelectedRows([]);
    } catch (err) {
      setSnack({ open: true, message: "Conversion failed", severity: "error" });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90, headerAlign: "center", align: "center" },
    { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "mobile", headerName: "Mobile", flex: 1, minWidth: 160 },
    { field: "ad_name", headerName: "Ad Name", flex: 1, minWidth: 140 },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => <StatusChip status={params.value} colors={colors} />,
      sortable: false,
      filterable: false,
    },
    {
      field: "updated_at",
      headerName: "Updated",
      width: 160,
      valueGetter: (p) => (p.value ? dayjs(p.value).fromNow() : "—"),
      sortComparator: (v1, v2, p1, p2) => dayjs(p1.row.updated_at).valueOf() - dayjs(p2.row.updated_at).valueOf(),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", gap: 2, alignItems: "center", color: colors.gray[100] }}>
        <CircularProgress size={24} />
        <Typography>Loading…</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box m={4} sx={{ bgcolor: theme.palette.background.default, borderRadius: 2, boxShadow: 1 }}>
      <Toolbar
      reports={reports}
        query={query}
        setQuery={setQuery}
        onRefresh={getContactList}
        colors={colors}
        selectionCount={selectedRows.length}
        filter={filter}
        setFilter={setFilter}
      />

      <Box mt={0} height="72vh" sx={{
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 2,
        border: `1px solid ${colors.gray[700]}`,
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-columnHeaders": { bgcolor: colors.gray[900], color: colors.gray[100], fontWeight: 700, borderBottom: `1px solid ${colors.gray[700]}` },
        "& .MuiDataGrid-cell": { borderBottom: `1px solid ${colors.gray[800]}`, color: colors.gray[100] },
        "& .MuiDataGrid-virtualScroller": { bgcolor: theme.palette.background.paper },
        "& .MuiDataGrid-footerContainer": { bgcolor: colors.gray[900], borderTop: `1px solid ${colors.gray[700]}`, color: colors.gray[100] },
        "& .MuiCheckbox-root": { color: `${colors.greenAccent[400]} !important` },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.gray[100]} !important` },
        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { color: colors.gray[300] },
      }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={setSelectedRows}
          rowSelectionModel={selectedRows}
          slots={{ Toolbar: GridToolbar }}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>

      <Box display="flex" justifyContent="flex-end" gap={1.5} mt={2}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={getContactList}
          sx={{ color: colors.blueAccent[300], borderColor: colors.blueAccent[500], "&:hover": { bgcolor: colors.blueAccent[700], color: colors.primary[900] } }}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={<DoneAllIcon />}
          onClick={() => setConfirmOpen(true)}
          disabled={selectedRows.length === 0}
          sx={{ bgcolor: colors.greenAccent[500], color: colors.gray[500], "&:hover": { bgcolor: colors.greenAccent[700] } }}
        >
          Convert Selected to Prospect ({selectedRows.length})
        </Button>
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Convert selected lead(s)?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will create prospect entries and mark the leads as converted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConvertToProspect} variant="contained" startIcon={<DoneAllIcon />}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FacebookLeadsTable;
