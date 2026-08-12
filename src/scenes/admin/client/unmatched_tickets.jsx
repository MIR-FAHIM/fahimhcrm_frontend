import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import SyncProblemRoundedIcon from "@mui/icons-material/SyncProblemRounded";
import dayjs from "dayjs";
import { fetchClients, getUnmatchedTickets, matchTicketClient } from "../../../api/controller/admin_controller/client_controller";
import TicketConvertToTaskDialog from "./components/ticket_convert_to_task_dialog";

const getProspect = (client) => client?.prospect || {};
const getClientLabel = (client) => {
  const prospect = getProspect(client);
  return prospect.prospect_name || client.client_name || client.name || `Client #${client.id}`;
};

const UnmatchedTickets = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchOpen, setMatchOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [matching, setMatching] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const showSnack = (message, severity = "success") => setSnack({ open: true, message, severity });

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getUnmatchedTickets();
      if (response?.status === "success") {
        setTickets(Array.isArray(response.data) ? response.data : []);
      } else {
        setTickets([]);
        setError(response?.message || "Failed to fetch unmatched tickets.");
      }
    } catch (err) {
      setTickets([]);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch unmatched tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    fetchClients()
      .then((response) => {
        if (response?.status === "success") setClients(Array.isArray(response.data) ? response.data : []);
      })
      .catch((err) => showSnack(err?.response?.data?.message || err?.message || "Failed to load clients.", "error"));
  }, [loadTickets]);

  const openMatch = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedClient(null);
    setMatchOpen(true);
  };

  const closeMatch = () => {
    if (matching) return;
    setMatchOpen(false);
    setSelectedTicket(null);
    setSelectedClient(null);
  };

  const handleMatch = async () => {
    if (!selectedTicket?.id) return;
    if (!selectedClient?.id) return showSnack("Select a CRM client first.", "warning");

    setMatching(true);
    try {
      const response = await matchTicketClient(selectedTicket.id, { client_id: selectedClient.id });
      if (response?.status === "success" || response?.status === true) {
        showSnack(response?.message || "Ticket matched with client.");
        setMatchOpen(false);
        setSelectedTicket(null);
        setSelectedClient(null);
        await loadTickets();
      } else {
        showSnack(response?.message || "Failed to match ticket.", "error");
      }
    } catch (err) {
      showSnack(err?.response?.data?.message || err?.message || "Failed to match ticket.", "error");
    } finally {
      setMatching(false);
    }
  };

  const openConvert = (ticket) => {
    if (!ticket?.client_id || ticket?.converted_task_id) return;
    setSelectedTicket(ticket);
    setConvertOpen(true);
  };

  const handleConverted = async () => {
    showSnack("Ticket converted to task successfully.");
    setConvertOpen(false);
    setSelectedTicket(null);
    await loadTickets();
  };

  const columns = useMemo(
    () => [
      { field: "external_ticket_id", headerName: "External Ticket ID", minWidth: 170, valueGetter: (params) => params.row.external_ticket_id || params.row.ticket_code || params.row.id },
      {
        field: "source",
        headerName: "Source",
        minWidth: 130,
        renderCell: ({ row }) => <Chip size="small" label={row.source || "External"} variant="outlined" sx={{ fontWeight: 650 }} />,
      },
      { field: "client_name", headerName: "Client Name", minWidth: 180, valueGetter: (params) => params.row.client_name || params.row.external_client_name || "-" },
      { field: "client_email", headerName: "Client Email", minWidth: 220, valueGetter: (params) => params.row.client_email || params.row.external_client_email || "-" },
      { field: "client_phone", headerName: "Client Phone", minWidth: 155, valueGetter: (params) => params.row.client_phone || params.row.external_client_phone || "-" },
      {
        field: "subject",
        headerName: "Subject",
        flex: 1,
        minWidth: 240,
        renderCell: ({ row }) => (
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>{row.subject || "Untitled ticket"}</Typography>
            <Typography noWrap variant="caption" color="text.secondary">{row.category || row.description || "No category"}</Typography>
          </Box>
        ),
      },
      { field: "external_priority", headerName: "External Priority", minWidth: 155, valueGetter: (params) => params.row.external_priority || "-" },
      { field: "external_status", headerName: "External Status", minWidth: 150, valueGetter: (params) => params.row.external_status || "-" },
      { field: "created_at", headerName: "Created Date", minWidth: 145, valueFormatter: ({ value }) => (value ? dayjs(value).format("MMM D, YYYY") : "-") },
      {
        field: "actions",
        headerName: "Actions",
        minWidth: 245,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => {
          const matched = Boolean(row.client_id || row.client);
          const converted = Boolean(row.converted_task_id);
          return (
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<LinkRoundedIcon />} disabled={matched} onClick={() => openMatch(row)} sx={{ fontWeight: 700 }}>
                Match
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddTaskRoundedIcon />}
                disabled={!matched || converted}
                onClick={() => openConvert(row)}
                sx={{ bgcolor: brand, color: brandContrast, fontWeight: 700, "&:hover": { bgcolor: brandDark } }}
              >
                {converted ? "Converted" : "Convert"}
              </Button>
            </Stack>
          );
        },
      },
    ],
    [brand, brandContrast, brandDark, theme]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <SyncProblemRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1 }}>
              Unmatched Tickets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Match external tickets to CRM clients before converting them into tasks.
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" onClick={loadTickets} disabled={loading} sx={{ fontWeight: 700 }}>
          Refresh
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper
        elevation={0}
        sx={{
          height: "72vh",
          minHeight: 560,
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <DataGrid
          rows={tickets}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: "none",
            color: theme.palette.text.primary,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: alpha(brand, theme.palette.mode === "dark" ? 0.18 : 0.08),
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
            "& .MuiDataGrid-cell": { borderBottom: `1px solid ${theme.palette.divider}` },
            "& .MuiDataGrid-row:hover": { bgcolor: alpha(brand, theme.palette.mode === "dark" ? 0.16 : 0.06) },
            "& .MuiDataGrid-virtualScroller, & .MuiDataGrid-footerContainer, & .MuiDataGrid-toolbarContainer": {
              bgcolor: theme.palette.background.paper,
            },
          }}
        />
      </Paper>

      <Dialog open={matchOpen} onClose={closeMatch} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: theme.palette.background.paper } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Match Client</DialogTitle>
        <DialogContent dividers sx={{ borderColor: theme.palette.divider }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Match {selectedTicket?.ticket_code || selectedTicket?.external_ticket_id || "this ticket"} with a CRM client.
          </Typography>
          <Autocomplete
            options={clients}
            value={selectedClient}
            getOptionLabel={getClientLabel}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            onChange={(_, value) => setSelectedClient(value)}
            noOptionsText="No clients found"
            renderInput={(params) => <TextField {...params} label="CRM Client" placeholder="Search client" />}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeMatch} disabled={matching}>Cancel</Button>
          <Button variant="contained" onClick={handleMatch} disabled={matching || !selectedClient} startIcon={matching ? <CircularProgress size={16} color="inherit" /> : null}>
            Match Client
          </Button>
        </DialogActions>
      </Dialog>

      <TicketConvertToTaskDialog
        open={convertOpen}
        ticket={selectedTicket}
        onClose={() => {
          setConvertOpen(false);
          setSelectedTicket(null);
        }}
        onConverted={handleConverted}
      />

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((state) => ({ ...state, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack((state) => ({ ...state, open: false }))} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UnmatchedTickets;
