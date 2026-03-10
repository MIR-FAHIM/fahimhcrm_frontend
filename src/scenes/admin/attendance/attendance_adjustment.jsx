import { Box, Button, Typography, useTheme, Paper, useMediaQuery } from "@mui/material";
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString() : "N/A";

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

      {isMobile ? (
        <Box display="flex" flexDirection="column" gap={2} mt={3}>
          {adjustments.map((item) => (
            <Paper
              key={item.id}
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {item.attendance?.user?.name || "N/A"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.status || "N/A"}
                </Typography>
              </Box>

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Current Time
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {formatDateTime(item.attendance?.check_in_time)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Requested Time
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {formatDateTime(item.requested_time)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {item.type || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Note
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {item.note || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  size="small"
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
                  onClick={() => handleApprove(item.id)}
                >
                  Approve
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
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
      )}
    </Box>
  );
};

export default AttendanceAdjustments;
