import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
} from "@mui/material";
import { getAllLeave, approveLeave, rejectLeave } from "../../../../api/controller/admin_controller/leave_manage/leave_manage";
import { tokens } from "../../../../theme";

const LeaveManageTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const userID = localStorage.getItem("userId");
  
  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await getAllLeave();
      setLeaveRequests(response.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      showSnackbar("Failed to fetch leave requests. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleApprove = async (leaveId) => {
    setLeaveRequests((prevRequests) =>
      prevRequests.map((leave) =>
        leave.id === leaveId ? { ...leave, approving: true } : leave
      )
    );

    const data = { approver_id: userID };

    try {
      const response = await approveLeave(data, leaveId);
      if (response.status === "success") {
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave.id === leaveId
              ? { ...leave, status: "Approved", is_approve: 1, approver: { name: "Admin User" }, approving: false }
              : leave
          )
        );
        showSnackbar("Leave request approved successfully!", "success");
      } else {
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave.id === leaveId ? { ...leave, approving: false } : leave
          )
        );
        showSnackbar(`Failed to approve leave: ${response.message}`, "error");
      }
    } catch (error) {
      setLeaveRequests((prevRequests) =>
        prevRequests.map((leave) =>
          leave.id === leaveId ? { ...leave, approving: false } : leave
        )
      );
      console.error("Error approving leave:", error);
      showSnackbar("Error approving leave. Please try again.", "error");
    }
  };
  
  const handleReject = async (leaveId) => {
    setLeaveRequests((prevRequests) =>
      prevRequests.map((leave) =>
        leave.id === leaveId ? { ...leave, approving: true } : leave
      )
    );

    const data = { approver_id: userID };

    try {
      const response = await rejectLeave(data, leaveId);
      if (response.status === "success") {
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave.id === leaveId
              ? { ...leave, status: "Rejected", is_approve: 2, approver: { name: "Admin User" }, approving: false }
              : leave
          )
        );
        showSnackbar("Leave Rejected!", "success");
      } else {
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave.id === leaveId ? { ...leave, approving: false } : leave
          )
        );
        showSnackbar(`Failed to reject leave: ${response.message}`, "error");
      }
    } catch (error) {
      setLeaveRequests((prevRequests) =>
        prevRequests.map((leave) =>
          leave.id === leaveId ? { ...leave, approving: false } : leave
        )
      );
      console.error("Error approving leave:", error);
      showSnackbar("Error approving leave. Please try again.", "error");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: theme.palette.background.default }}
      p={3}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, width: "100%", borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
        <Typography 
          variant="h5" 
          component="h1" 
          gutterBottom 
          textAlign="center" 
          sx={{ mb: 3, fontWeight: 'bold', color: colors.blueAccent[500] }}
        >
          Employee Leave Request Management
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2, color: colors.gray[100] }}>Loading leave requests...</Typography>
          </Box>
        ) : leaveRequests.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography variant="h6" sx={{ color: colors.gray[400] }}>No leave requests to display.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 5 }}>
            <Table aria-label="leave requests table">
              <TableHead sx={{ backgroundColor: colors.primary[600] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: colors.gray[100] }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: colors.gray[100] }}>Leave Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: colors.gray[100] }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: colors.gray[100] }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: colors.gray[100] }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: colors.gray[100] }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: colors.gray[100] }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: colors.gray[100] }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests.map((leave, index) => (
                  <TableRow 
                    key={leave.id} 
                    sx={{ 
                      backgroundColor: index % 2 === 0 ? theme.palette.background.paper : theme.palette.background.default,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell sx={{ color: colors.gray[100] }}>{leave.employee?.name || 'N/A'}</TableCell>
                    <TableCell sx={{ color: colors.gray[100] }}>{leave.leave_type?.leave_name || 'N/A'}</TableCell>
                    <TableCell sx={{ color: colors.gray[100] }}>{leave.start_date}</TableCell>
                    <TableCell sx={{ color: colors.gray[100] }}>{leave.end_date}</TableCell>
                    <TableCell sx={{ color: colors.gray[100] }}>{leave.duration} Days</TableCell>
                    <TableCell sx={{ color: colors.gray[100] }}>
                      {leave.is_approve === 1 ? (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.greenAccent[500] }}>
                          Approved {leave.approver?.name ? `(by ${leave.approver.name})` : ''}
                        </Typography>
                      ) : leave.is_approve === 2 ? (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.redAccent[500] }}>
                          Rejected
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: colors.blueAccent[500] }}>
                          Pending
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: colors.gray[100] }}>{leave.details}</TableCell>
                    <TableCell align="center">
                      {leave.is_approve == 0 ? (
                        <Box display="flex" gap={1} justifyContent="center">
                          <Button
                            variant="contained"
                            onClick={() => handleApprove(leave.id)}
                            disabled={leave.approving || loading}
                            sx={{
                              backgroundColor: colors.greenAccent[500],
                              color: colors.primary[900],
                              '&:hover': {
                                backgroundColor: colors.greenAccent[700],
                              },
                            }}
                            startIcon={leave.approving ? <CircularProgress size={20} color="inherit" /> : null}
                          >
                            {leave.approving ? "Approving..." : "Approve"}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => handleReject(leave.id)}
                            disabled={loading || leave.approving}
                            sx={{
                              color: colors.redAccent[500],
                              borderColor: colors.redAccent[500],
                              '&:hover': {
                                backgroundColor: colors.redAccent[700],
                                color: colors.primary[900],
                              },
                            }}
                          >
                            Reject
                          </Button>
                        </Box>
                      ) : leave.is_approve == 2 ? (
                        <Button
                          variant="contained"
                          disabled
                          sx={{
                            backgroundColor: colors.redAccent[500],
                            color: colors.primary[900],
                          }}
                        >
                          Rejected
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          disabled
                          sx={{
                            backgroundColor: colors.greenAccent[500],
                            color: colors.primary[900],
                          }}
                        >
                          Approved
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveManageTable;