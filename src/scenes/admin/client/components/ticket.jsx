import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { getTicketByClient } from "../../../../api/controller/admin_controller/client_controller";
import TicketConvertToTaskDialog from "./ticket_convert_to_task_dialog";

const statusColor = (theme, status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "open") return theme.palette.success.main;
  if (normalized === "closed") return theme.palette.text.secondary;
  if (normalized === "pending") return theme.palette.warning.main;
  return theme.palette.info.main;
};

const display = (value, fallback = "-") => value || fallback;

const getCreatedBySource = (ticket) =>
  ticket.created_by_user?.name ||
  ticket.creator?.name ||
  ticket.created_by_name ||
  ticket.created_by ||
  ticket.source ||
  "-";

const ClientTicket = ({ clientId, refreshKey = 0 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const showSnack = (message, severity = "success") => setSnack({ open: true, message, severity });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTicketByClient(clientId);
      if (response?.status === "success") {
        setTickets(Array.isArray(response.data) ? response.data : []);
      } else {
        setTickets([]);
        setError(response?.message || "Failed to fetch tickets.");
      }
    } catch (err) {
      setTickets([]);
      setError(err?.response?.data?.message || err?.message || "Error fetching tickets.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) fetchTickets();
  }, [clientId, fetchTickets, refreshKey]);

  const openConvertDialog = (ticket) => {
    if (ticket?.converted_task_id) return;
    setSelectedTicket(ticket);
    setIsConvertDialogOpen(true);
  };

  const closeConvertDialog = () => {
    setIsConvertDialogOpen(false);
    setSelectedTicket(null);
  };

  const handleConverted = async () => {
    showSnack("Ticket converted to task successfully.");
    closeConvertDialog();
    await fetchTickets();
  };

  const columns = useMemo(
    () => [
      {
        field: "ticket_code",
        headerName: "Ticket Code",
        minWidth: 155,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <ConfirmationNumberRoundedIcon fontSize="small" sx={{ color: brand }} />
            <Typography noWrap sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
              {row.ticket_code || row.external_ticket_id || `#${row.id}`}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "source",
        headerName: "Source",
        minWidth: 130,
        renderCell: ({ row }) => (
          <Chip size="small" label={display(row.source || row.ticket_source, "Internal")} variant="outlined" sx={{ fontWeight: 650 }} />
        ),
      },
      {
        field: "subject",
        headerName: "Subject",
        flex: 1,
        minWidth: 250,
        renderCell: ({ row }) => (
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ color: theme.palette.text.primary, fontWeight: 650 }}>
              {row.subject || "Untitled ticket"}
            </Typography>
            <Typography noWrap variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {row.description || row.category || "No description"}
            </Typography>
          </Box>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 125,
        renderCell: ({ row }) => {
          const color = statusColor(theme, row.status);
          const label = row.status ? String(row.status).charAt(0).toUpperCase() + String(row.status).slice(1) : "Unknown";
          return <Chip size="small" label={label} sx={{ bgcolor: alpha(color, 0.14), color, fontWeight: 700 }} />;
        },
      },
      {
        field: "priority",
        headerName: "Priority",
        minWidth: 145,
        renderCell: ({ row }) => {
          const color = row.priority?.color_code || theme.palette.warning.main;
          return (
            <Chip
              size="small"
              label={row.priority?.priority_name || row.priority_name || "N/A"}
              sx={{ bgcolor: alpha(color, 0.16), color, fontWeight: 700 }}
            />
          );
        },
      },
      {
        field: "external_priority",
        headerName: "External Priority",
        minWidth: 165,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 650 }}>
            {display(row.external_priority)}
          </Typography>
        ),
      },
      {
        field: "external_status",
        headerName: "External Status",
        minWidth: 150,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 650 }}>
            {display(row.external_status)}
          </Typography>
        ),
      },
      {
        field: "category",
        headerName: "Category",
        minWidth: 140,
        renderCell: ({ row }) => <Chip size="small" label={display(row.category || row.type, "N/A")} variant="outlined" sx={{ fontWeight: 650 }} />,
      },
      {
        field: "created_source",
        headerName: "Created By/Source",
        minWidth: 180,
        renderCell: ({ row }) => (
          <Typography variant="body2" noWrap title={getCreatedBySource(row)} sx={{ color: theme.palette.text.primary, fontWeight: 650 }}>
            {getCreatedBySource(row)}
          </Typography>
        ),
      },
      {
        field: "match_status",
        headerName: "Match Status",
        minWidth: 145,
        renderCell: ({ row }) => {
          const matched = Boolean(row.client_id || row.client || row.matched_client_id);
          return <Chip size="small" color={matched ? "success" : "warning"} variant={matched ? "filled" : "outlined"} label={matched ? "Matched" : "Unmatched"} sx={{ fontWeight: 700 }} />;
        },
      },
      {
        field: "converted_task_id",
        headerName: "Converted Task",
        minWidth: 165,
        renderCell: ({ row }) =>
          row.converted_task_id ? (
            <Button size="small" endIcon={<OpenInNewRoundedIcon />} onClick={() => navigate(`/task-details/${row.converted_task_id}`)} sx={{ fontWeight: 700 }}>
              Converted
            </Button>
          ) : (
            <Chip size="small" label="Not converted" variant="outlined" sx={{ fontWeight: 650 }} />
          ),
      },
      {
        field: "created_at",
        headerName: "Created Date",
        minWidth: 145,
        valueFormatter: ({ value }) => (value ? dayjs(value).format("MMM D, YYYY") : "-"),
      },
      {
        field: "actions",
        headerName: "Actions",
        minWidth: 170,
        sortable: false,
        filterable: false,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => {
          const converted = Boolean(row.converted_task_id);
          return (
            <Button
              variant="contained"
              size="small"
              disabled={converted}
              startIcon={<AddTaskRoundedIcon />}
              sx={{ bgcolor: brand, color: brandContrast, fontWeight: 700, "&:hover": { bgcolor: brandDark } }}
              onClick={() => openConvertDialog(row)}
            >
              {converted ? "Converted" : "Convert"}
            </Button>
          );
        },
      },
    ],
    [brand, brandContrast, brandDark, navigate, theme]
  );

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper
        elevation={0}
        sx={{
          height: 640,
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
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
            "& .MuiDataGrid-cell": { borderBottom: `1px solid ${theme.palette.divider}` },
            "& .MuiDataGrid-row:hover": { bgcolor: alpha(brand, theme.palette.mode === "dark" ? 0.16 : 0.06) },
            "& .MuiDataGrid-virtualScroller, & .MuiDataGrid-footerContainer, & .MuiDataGrid-toolbarContainer": {
              bgcolor: theme.palette.background.paper,
            },
            "& .MuiDataGrid-footerContainer, & .MuiDataGrid-toolbarContainer": {
              borderTop: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${brand} !important`,
              fontWeight: 650,
            },
            "& .MuiDataGrid-overlay": { bgcolor: alpha(theme.palette.background.paper, 0.92) },
          }}
        />
      </Paper>

      <TicketConvertToTaskDialog
        open={isConvertDialogOpen}
        ticket={selectedTicket}
        onClose={closeConvertDialog}
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

export default ClientTicket;
