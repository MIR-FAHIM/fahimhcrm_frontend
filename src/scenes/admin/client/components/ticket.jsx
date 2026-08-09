import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import dayjs from "dayjs";
import { getTicketByClient } from "../../../../api/controller/admin_controller/client_controller";
import AddTaskFormProject from "./add_task_for_client";

const statusColor = (theme, status = "") => {
  const normalized = status.toLowerCase();
  if (normalized === "open") return theme.palette.success.main;
  if (normalized === "closed") return theme.palette.text.secondary;
  if (normalized === "pending") return theme.palette.warning.main;
  return theme.palette.info.main;
};

const ClientTicket = ({ clientId, refreshKey = 0 }) => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTicketByClient(clientId);
        if (!mounted) return;
        if (response?.status === "success") {
          setTickets(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response?.message || "Failed to fetch tickets.");
        }
      } catch (err) {
        if (mounted) setError(err?.message || "Error fetching tickets.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (clientId) fetchTickets();

    return () => {
      mounted = false;
    };
  }, [clientId, refreshKey]);

  const columns = useMemo(
    () => [
      {
        field: "ticket_code",
        headerName: "Ticket",
        flex: 1,
        minWidth: 150,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <ConfirmationNumberRoundedIcon fontSize="small" sx={{ color: brand }} />
            <Typography noWrap sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
              {row.ticket_code || `#${row.id}`}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "subject",
        headerName: "Subject",
        flex: 1.7,
        minWidth: 220,
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
        field: "type",
        headerName: "Type",
        width: 120,
        renderCell: ({ row }) => (
          <Chip size="small" label={row.type || "N/A"} variant="outlined" sx={{ fontWeight: 650 }} />
        ),
      },
      {
        field: "priority",
        headerName: "Priority",
        width: 150,
        renderCell: ({ row }) => {
          const color = row.priority?.color_code || theme.palette.warning.main;
          return (
            <Chip
              size="small"
              label={row.priority?.priority_name || "N/A"}
              sx={{ bgcolor: alpha(color, 0.16), color, fontWeight: 700 }}
            />
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: ({ row }) => {
          const color = statusColor(theme, row.status);
          const label = row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : "Unknown";
          return <Chip size="small" label={label} sx={{ bgcolor: alpha(color, 0.14), color, fontWeight: 700 }} />;
        },
      },
      {
        field: "created_at",
        headerName: "Created",
        width: 145,
        valueFormatter: ({ value }) => (value ? dayjs(value).format("MMM D, YYYY") : "-"),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 130,
        sortable: false,
        filterable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddTaskRoundedIcon />}
            sx={{ bgcolor: brand, color: brandContrast, fontWeight: 700, "&:hover": { bgcolor: brandDark } }}
            onClick={() => {
              setSelectedTicket(params.row);
              setIsTaskDialogOpen(true);
            }}
          >
            Task
          </Button>
        ),
      },
    ],
    [brand, brandContrast, brandDark, theme]
  );

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper
        elevation={0}
        sx={{
          height: 520,
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

      <Dialog
        open={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary } }}
      >
        {selectedTicket && (
          <AddTaskFormProject
            projectId={parseInt(clientId, 10)}
            statusID={1}
            title={selectedTicket.ticket_code}
            details={selectedTicket.subject}
            onClose={() => setIsTaskDialogOpen(false)}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default ClientTicket;
