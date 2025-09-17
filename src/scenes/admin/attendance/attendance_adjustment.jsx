import { Box, Button, Typography, useTheme, Paper } from "@mui/material";
import { Header } from "../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAttendanceAdjustment,
  approveAdjustment,
} from "../../../api/controller/admin_controller/attendance_controller";

const AttendanceAdjustments = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const userID = localStorage.getItem("userId");

  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleApprove = async (id) => {
    const data = { adjustment_id: id, user_id: userID };
    const response = await approveAdjustment(data);
    if (response.success === true) {
      alert(response.message);
      handleGetAdjustmentsList();
    }
  };

  const handleGetAdjustmentsList = async () => {
    try {
      const response = await getAttendanceAdjustment();
      if (response.status === "success") {
        setAdjustments(response.data || []);
        setError(null);
      } else {
        setError("Failed to fetch attendance adjustments");
      }
    } catch {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetAdjustmentsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, headerAlign: "center", align: "center" },
    {
      field: "user_name",
      headerName: "User",
      flex: 1.3,
      valueGetter: (params) => params.row.attendance?.user?.name || "N/A",
    },
    {
      field: "current_time",
      headerName: "Current Time",
      flex: 1.2,
      valueGetter: (params) =>
        params.row.attendance?.check_in_time
          ? new Date(params.row.attendance.check_in_time).toLocaleString()
          : "N/A",
    },
    {
      field: "requested_time",
      headerName: "Requested Time",
      flex: 1.2,
      valueGetter: (params) =>
        params.row.requested_time ? new Date(params.row.requested_time).toLocaleString() : "N/A",
    },
    { field: "type", headerName: "Type", flex: 0.8 },
    { field: "note", headerName: "Note", flex: 1.6 },
    { field: "status", headerName: "Status", flex: 0.8 },
    {
      field: "view_details",
      headerName: "Actions",
      flex: 0.9,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Button
          variant="contained"
          sx={{
            borderRadius: 10,
            textTransform: "none",
            fontSize: 13,
            fontWeight: 700,
            px: 2,
            bgcolor: theme.palette.blueAccent.main,
            color: theme.palette.blueAccent.contrastText,
            "&:hover": { bgcolor: theme.palette.blueAccent.dark },
          }}
          onClick={() => handleApprove(params.row.id)}
        >
          Approve
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Box m={4}>
        <Typography variant="h6" color="text.primary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header
          title="Attendance Adjustments"
          subtitle="Review employee requests for time adjustment"
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          height: "75vh",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 2,
          "& .MuiDataGrid-root": { border: "none", backgroundColor: "transparent" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            color: theme.palette.text.secondary,
          },
          "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.background.paper,
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.default,
            borderTop: `1px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: theme.palette.text.primary,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "& .MuiCheckbox-root": {
            color: `${theme.palette.primary.main} !important`,
          },
        }}
      >
        <DataGrid
          rows={adjustments}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 400 },
              printOptions: { disableToolbarButton: true },
              csvOptions: { fileName: "attendance_adjustments" },
            },
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Paper>
    </Box>
  );
};

export default AttendanceAdjustments;
