import { Box, Button, Typography, useTheme, Chip, CircularProgress, Dialog } from "@mui/material";
import { Header } from "../../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../../theme";
import { getTicketByClient } from "../../../../api/controller/admin_controller/client_controller";
import AddTaskFormProject from "./add_task_for_client";
const ClientTicket = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the DataGrid columns based on the API response structure
  const columns = [
    { field: "ticket_code", headerName: "Ticket Code", flex: 1 },
    { field: "subject", headerName: "Subject", flex: 1.5 },
    { field: "type", headerName: "Type", flex: 0.8 },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      // Custom cell renderer to display the priority name with its color
      renderCell: ({ row: { priority } }) => (
        <Chip
          label={priority?.priority_name || "N/A"}
          sx={{
            backgroundColor: priority?.color_code || "#9e9e9e",
            color: theme.palette.getContrastText(priority?.color_code || "#9e9e9e"),
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      // Custom cell renderer to capitalize the status and add a pill style
      renderCell: ({ row: { status } }) => (
        <Chip
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          sx={{
            backgroundColor: status === "open" ? colors.greenAccent[600] : colors.grey[600],
            color: "white",
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      // Custom cell renderer to format the date
      valueFormatter: ({ value }) => new Date(value).toLocaleDateString(),
    },
   {
  field: "actions",
  headerName: "Actions",
  flex: 1,
  renderCell: (params) => (
    <Button
      variant="contained"
      sx={{
        backgroundColor: colors.blueAccent[700],
        "&:hover": {
          backgroundColor: colors.blueAccent[600],
        },
      }}
      onClick={() => {
        setSelectedTicket(params.row); // save ticket details
        setIsTaskDialogOpen(true); // open dialog
      }}
    >
      Task
    </Button>
  ),
}
  ];

  useEffect(() => {
    // The client ID should be dynamic, but for this example, we use a placeholder '1'
    const clientId = 1; 

    const fetchTickets = async () => {
      try {
        const response = await getTicketByClient(clientId);
        if (response.status === "success") {
          // The API response returns data as an array, which is perfect for DataGrid rows
          setTickets(response.data);
        } else {
          setError("Failed to fetch tickets.");
        }
      } catch (err) {
        setError("Error fetching data. Please check your network connection.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, []);

  return (
    <Box m="20px">
     

      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[400],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.gray[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.gray[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.gray[100]} !important`,
          },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="h5" color="error">
              {error}
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={tickets}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row.id}
          />
        )
        }
        <Dialog
  open={isTaskDialogOpen}
  onClose={() => setIsTaskDialogOpen(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary
    }
  }}
>
  {selectedTicket && (
    <AddTaskFormProject
      projectId={parseInt(1)}
      statusID={1}
      title={selectedTicket.ticket_code}   // ✅ Ticket code as title
      details={selectedTicket.subject}   // ✅ Ticket code as title
      onClose={() => setIsTaskDialogOpen(false)}
    />
  )}
</Dialog>
      </Box>
    </Box>
  );
};

export default ClientTicket;